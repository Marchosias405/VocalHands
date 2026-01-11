type Props = {
  muted: boolean;
  lastSpoken: string;
};

export default function AudioPanel({ muted, lastSpoken }: Props) {
  return (
    <div className="card">
      <h3>Audio</h3>
      <p>
        <b>Muted:</b> {muted ? "Yes" : "No"}
      </p>
      <div className="label">Last spoken</div>
      <div>{lastSpoken || "—"}</div>
    </div>
  );
}
