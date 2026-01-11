type Props = {
  liveText: string;
  draftSentence: string;
  history: string[];
};

export default function TranscriptPanel({ liveText, draftSentence, history }: Props) {
  return (
    <div className="card cardWide">
      <h3>Transcript</h3>

      <div className="block">
        <div className="label">Live (raw)</div>
        <div className="big">{liveText || "—"}</div>
      </div>

      <div className="block">
        <div className="label">Draft sentence</div>
        <div>{draftSentence || "—"}</div>
      </div>

      <div className="block">
        <div className="label">History</div>
        {history.length === 0 ? (
          <div className="muted">No sentences yet</div>
        ) : (
          <ul>
            {history.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
