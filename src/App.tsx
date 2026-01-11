import { useEffect, useRef, useState } from "react";
import "./App.css";

import Controls from "./components/Controls";
import TranscriptPanel from "./components/TranscriptPanel";
import AudioPanel from "./components/AudioPanel";
import StatusPanel from "./components/StatusPanel";
import WebcamFeed from "./components/WebcamFeed";

import { initSignSpeak } from "./api/signSpeakClient";
import { useLivePipeline } from "./components/useLivePipeline";

export default function App() {
  const [muted, setMuted] = useState(false);
  const [useGemini, setUseGemini] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initSignSpeak(import.meta.env.VITE_SIGN_SPEAK_API_KEY);
  }, []);

  const pipeline = useLivePipeline({
    muted,
    useGemini,
    geminiKey: import.meta.env.VITE_GEMINI_API_KEY,
    videoRef,
    canvasRef,
  });

  return (
    <div className="page">
      <header className="header">
        <h1>Hands2Voice</h1>
        <p className="sub">
          Live video → sign recognition → text → (Gemini cleanup) → speech
        </p>
      </header>

      <div className="grid">
        <WebcamFeed videoRef={videoRef} canvasRef={canvasRef} />

        <AudioPanel muted={muted} lastSpoken={pipeline.lastSpoken} />

        <StatusPanel
          mode={pipeline.mode}
          recording={pipeline.recording}
          loading={pipeline.loading}
          error={pipeline.error}
        />

        <TranscriptPanel
          liveText={pipeline.liveText}
          draftSentence={pipeline.draftSentence}
          history={pipeline.history}
        />
      </div>

      <Controls
        recording={pipeline.recording}
        loading={pipeline.loading}
        muted={muted}
        useGemini={useGemini}
        onToggle={() => (pipeline.recording ? pipeline.stop() : pipeline.start())}
        onMute={() => setMuted((m) => !m)}
        onToggleGemini={() => setUseGemini((g) => !g)}
        onSpeakNow={() => pipeline.speakNow()}
        onClear={() => pipeline.clear()}
      />

      <footer className="footer">
        <small>Tip: Keep good lighting + hands visible for better tracking.</small>
      </footer>
    </div>
  );
}
