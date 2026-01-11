import type React from "react";

type Props = {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
};

export default function WebcamFeed({ videoRef, canvasRef }: Props) {
  return (
    <div className="card">
      <h3>Camera</h3>

      <div style={{ position: "relative", width: "100%", borderRadius: 12, overflow: "hidden" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            display: "block",
            background: "#000",
            aspectRatio: "4 / 3",
          }}
        />

        {/* Overlay */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />
      </div>

      <p className="hint" style={{ marginTop: 8 }}>
        Overlay shows the tracked finger points (landmarks).
      </p>
    </div>
  );
}
