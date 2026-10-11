export function Alert({ msg, type = "error" }) {
  if (!msg) return null;
  return <div className={`alert ${type}`}>{msg}</div>;
}

export function Bar({ value, max, label }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="bar-wrap" title={label}>
      <div className="bar-fill" style={{ width: `${pct}%`, background: value > max ? "#ef4444" : undefined }} />
    </div>
  );
}
