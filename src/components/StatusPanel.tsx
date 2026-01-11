type Props = {
  mode: "signspeak" | "mock";
  recording: boolean;
  loading: boolean;
  error?: string;
};

export default function StatusPanel({ mode, recording, loading, error }: Props) {
  return (
    <div className="card">
      <h3>Status</h3>
      <p><b>Mode:</b> {mode}</p>
      <p><b>Recording:</b> {recording ? "Yes" : "No"}</p>
      <p><b>Loading:</b> {loading ? "Yes" : "No"}</p>
      {error ? <p className="error"><b>Error:</b> {error}</p> : null}
      {mode === "mock" ? (
        <p className="hint">
          Mock mode is ON so the app runs even if Sign-Speak hookup isn’t finished.
        </p>
      ) : null}
    </div>
  );
}
