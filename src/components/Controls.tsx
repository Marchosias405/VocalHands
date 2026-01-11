type Props = {
  recording: boolean;
  loading: boolean;
  muted: boolean;
  useGemini: boolean;
  onToggle: () => void;
  onMute: () => void;
  onToggleGemini: () => void;
  onSpeakNow: () => void;
  onClear: () => void;
};

export default function Controls({
  recording,
  loading,
  muted,
  useGemini,
  onToggle,
  onMute,
  onToggleGemini,
  onSpeakNow,
  onClear,
}: Props) {
  return (
    <div className="controls">
      <button onClick={onToggle} disabled={loading}>
        {loading ? "Loading..." : recording ? "Stop" : "Start"}
      </button>

      <button onClick={onMute}>{muted ? "Unmute" : "Mute"}</button>

      <button onClick={onToggleGemini}>
        Gemini: {useGemini ? "On" : "Off"}
      </button>

      <button onClick={onSpeakNow}>Speak sentence now</button>

      <button onClick={onClear} className="danger">
        Clear
      </button>
    </div>
  );
}
