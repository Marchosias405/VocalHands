import { Hands, Results } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

function resizeCanvasToVideo(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
  const w = video.videoWidth || 640;
  const h = video.videoHeight || 480;
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
}

function drawLandmarks(canvas: HTMLCanvasElement, results: Results) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const lm = results.multiHandLandmarks?.[0];
  if (!lm) return;

  const connections: Array<[number, number]> = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [0, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [0, 9],
    [9, 10],
    [10, 11],
    [11, 12],
    [0, 13],
    [13, 14],
    [14, 15],
    [15, 16],
    [0, 17],
    [17, 18],
    [18, 19],
    [19, 20],
    [5, 9],
    [9, 13],
    [13, 17],
  ];

  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(0, 255, 0, 0.85)";
  for (const [a, b] of connections) {
    const A = lm[a],
      B = lm[b];
    ctx.beginPath();
    ctx.moveTo(A.x * canvas.width, A.y * canvas.height);
    ctx.lineTo(B.x * canvas.width, B.y * canvas.height);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255, 0, 0, 0.9)";
  for (let i = 0; i < lm.length; i++) {
    const p = lm[i];
    const x = p.x * canvas.width;
    const y = p.y * canvas.height;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function dist(a: any, b: any) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function classifyGesture(results: Results): string | null {
  const lm = results.multiHandLandmarks?.[0];
  if (!lm) return null;

  const wrist = lm[0];
  const palm = lm[9]; // good palm reference

  // "Up" if tip is noticeably farther from wrist than PIP
  function isUp(tipIdx: number, pipIdx: number) {
    return dist(lm[tipIdx], wrist) > dist(lm[pipIdx], wrist) + 0.03;
  }

  // "Curled" if tip is close to palm (strong fist signal)
  function isCurled(tipIdx: number) {
    return dist(lm[tipIdx], palm) < 0.18; // tweakable
  }

  const indexUp = isUp(8, 6);
  const middleUp = isUp(12, 10);
  const ringUp = isUp(16, 14);
  const pinkyUp = isUp(20, 18);

  // --- INTRO MACRO: 🤘 thumb + index + pinky up
  // Thumb "up" test: thumb tip farther from wrist than thumb IP joint
  const thumbUp = dist(lm[4], wrist) > dist(lm[3], wrist) + 0.03;

  if (thumbUp && indexUp && !middleUp && !ringUp && pinkyUp) {
    return "__INTRO__";
  }

  // Known patterns first (so peace doesn't get overridden)
  if (indexUp && middleUp && !ringUp && !pinkyUp) return "THANK YOU"; // ✌️
  if (indexUp && !middleUp && !ringUp && !pinkyUp) return "YOU"; // ☝️
  if (indexUp && middleUp && ringUp && pinkyUp) return "HELLO"; // ✋

  // STOP only if all 4 fingers are STRONGLY curled
  const curledCount = [isCurled(8), isCurled(12), isCurled(16), isCurled(20)].filter(
    Boolean
  ).length;
  if (curledCount === 4) return "STOP";

  // Otherwise: don't guess
  return null;
}

/**
 * startMediaPipe(video, canvasOrNull, onWord)
 * - draws landmarks if canvas exists
 * - emits ONLY when gesture is stable for ~600ms
 * - cooldown prevents repeating the same word constantly
 */
export function startMediaPipe(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement | null,
  onWord: (w: string) => void
) {
  const hands = new Hands({
    locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.75,
    minTrackingConfidence: 0.75,
  });

  // Stability + cooldown state
  let candidate: string | null = null;
  let candidateSince = 0;
  let lastEmitted: string | null = null;
  let lastEmitAt = 0;

  const STABLE_MS = 600;
  const COOLDOWN_MS = 1200;

  hands.onResults((results) => {
    if (canvas) {
      resizeCanvasToVideo(canvas, video);
      drawLandmarks(canvas, results);
    }

    const g = classifyGesture(results);
    const now = Date.now();

    if (!g) {
      candidate = null;
      candidateSince = 0;
      return;
    }

    // New candidate gesture
    if (candidate !== g) {
      candidate = g;
      candidateSince = now;
      return;
    }

    // Must be stable long enough
    if (now - candidateSince < STABLE_MS) return;

    // Cooldown prevents spamming same output
    if (lastEmitted === g && now - lastEmitAt < COOLDOWN_MS) return;

    lastEmitted = g;
    lastEmitAt = now;
    onWord(g);
  });

  const cam = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 640,
    height: 480,
  });

  cam.start();

  return () => {
    cam.stop();
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };
}
