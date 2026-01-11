import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { createSmoother } from "../utils/smoothing";
import { createSentenceBuffer } from "../utils/sentenceBuffer";
import { cleanWithGemini } from "../api/geminiClient";
import { speak, stopSpeech } from "../api/tts";
import { startMediaPipe } from "./mediapipeRecognizer";

/**
 * Live pipeline:
 * Webcam -> MediaPipe -> word stream -> smoother -> sentence buffer
 * -> (optional Gemini cleanup) -> browser TTS
 */
export function useLivePipeline({
  muted,
  useGemini,
  geminiKey,
  videoRef,
  canvasRef,
}: {
  muted: boolean;
  useGemini: boolean;
  geminiKey?: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}) {
  const [mode] = useState<"mediapipe" | "mock">("mediapipe");
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const [liveText, setLiveText] = useState("");
  const [draftSentence, setDraftSentence] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [lastSpoken, setLastSpoken] = useState("");

  const smoother = useMemo(() => createSmoother(700, 1300), []);
  const buffer = useMemo(() => createSentenceBuffer(2000), []);

  // Sentence timer
  const intervalRef = useRef<number | null>(null);

  // Stop MediaPipe loop
  const stopCamRef = useRef<null | (() => void)>(null);

  // --- Sentence end watcher (ends sentence after 2s of no new word)
  useEffect(() => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(async () => {
      if (!buffer.shouldEnd()) return;

      const rawSentence = buffer.commit();
      setDraftSentence("");

      let finalSentence = rawSentence;
      if (useGemini) {
        finalSentence = await cleanWithGemini(rawSentence, geminiKey);
      }

      if (finalSentence) {
        setHistory((prev) => [finalSentence, ...prev].slice(0, 6));
        setLastSpoken(finalSentence);
        if (!muted) speak(finalSentence);
      }
    }, 250);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [buffer, muted, useGemini, geminiKey]);

  // --- PUBLIC CONTROLS
  async function start() {
    setError(undefined);
    setLoading(true);

    try {
      const videoEl = videoRef.current;
      if (!videoEl) throw new Error("Video element not mounted.");

      videoEl.autoplay = true;
      videoEl.playsInline = true;
      videoEl.muted = true;

      // Request camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      (videoEl as any).srcObject = stream;

      // Ensure video plays and has frames
      await videoEl.play();

      const canvasEl = canvasRef.current ?? null;

      // Start MediaPipe and get stop() callback
      stopCamRef.current = startMediaPipe(videoEl, canvasEl, (word) => {

        if (word === "__INTRO__") {
          const intro =
            "Hi, we are VocalHands. This is our project for Journey Hacks. This is a live demo.";
          setLiveText("__INTRO__");
          buffer.add(intro);
          setDraftSentence(buffer.draft());
          return;
        }

        setLiveText(word);

        const { commit, text } = smoother(word);
        if (commit) {
          buffer.add(text);
          setDraftSentence(buffer.draft());
        }
      });

      setRecording(true);
    } catch (e: any) {
      setError(e?.message || "Camera failed.");
      setRecording(false);
    } finally {
      setLoading(false);
    }
  }

  async function stop() {
    setLoading(true);
    try {
      // Stop MediaPipe loop
      stopCamRef.current?.();
      stopCamRef.current = null;

      // Stop camera tracks
      const videoEl = videoRef.current;
      const stream = (videoEl as any)?.srcObject as MediaStream | undefined;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        (videoEl as any).srcObject = null;
      }

      // Clear overlay
      const canvasEl = canvasRef.current;
      if (canvasEl) {
        const ctx = canvasEl.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      }

      setRecording(false);
    } finally {
      setLoading(false);
    }
  }

  async function speakNow() {
    const raw = buffer.commit();
    setDraftSentence("");

    let finalSentence = raw;
    if (useGemini) {
      finalSentence = await cleanWithGemini(raw, geminiKey);
    }

    if (finalSentence) {
      setHistory((prev) => [finalSentence, ...prev].slice(0, 6));
      setLastSpoken(finalSentence);
      if (!muted) speak(finalSentence);
    }
  }

  function clear() {
    buffer.clear();
    setLiveText("");
    setDraftSentence("");
    setHistory([]);
    setLastSpoken("");
    stopSpeech();
  }

  return {
    mode,
    recording,
    loading,
    error,
    liveText,
    draftSentence,
    history,
    lastSpoken,
    start,
    stop,
    speakNow,
    clear,
  };
}
