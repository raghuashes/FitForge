export const MC = { p: "#6ea8ff", c: "#fbbf24", f: "#f472b6" };

export function Ring({ value, max, color = "var(--primary)", big, sub }) {
  const r = 52, c = 2 * Math.PI * r, pct = Math.min(1, max ? value / max : 0), over = value > max * 1.05;
  return (
    <svg viewBox="0 0 130 130" className="ring" role="img" aria-label={`${big} ${sub}`}>
      <circle cx="65" cy="65" r={r} fill="none" stroke="var(--border)" strokeWidth="11" />
      {pct > 0 && <circle cx="65" cy="65" r={r} fill="none" stroke={over ? "#f87171" : color} strokeWidth="11" strokeLinecap="round"
        strokeDasharray={`${c * pct} ${c}`} transform="rotate(-90 65 65)" />}
      <text x="65" y="64" textAnchor="middle" className="rn">{big}</text>
      <text x="65" y="83" textAnchor="middle" className="rs">{sub}</text>
    </svg>
  );
}

export function MacroRow({ name, value, target, color }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  return (
    <div className="mrow">
      <div className="row-between">
        <span><i className="dotc" style={{ background: color }} />{name}</span>
        <span><b>{Math.round(value)}</b><span className="muted small-text"> / {target} g</span></span>
      </div>
      <div className="bar-wrap"><div className="bar-fill" style={{ width: `${pct}%`, background: value > target * 1.05 ? "#f87171" : color }} /></div>
    </div>
  );
}

export function MacroChips({ kcal, p, c, f }) {
  return (
    <div className="mchips">
      {kcal != null && <span className="mx k">{kcal} kcal</span>}
      <span className="mx p">P {Math.round(p)}g</span><span className="mx c">C {Math.round(c)}g</span><span className="mx f">F {Math.round(f)}g</span>
    </div>
  );
}

export function LineChart({ data, color, unit, goal }) {
  if (data.length < 2) return <p className="muted">Add more entries to see the trend.</p>;
  const W = 360, H = 176, L = 40, R = 10, T = 12, B = 24;
  let vs = data.map((p) => p.y); if (goal != null) vs = vs.concat(goal);
  let lo = Math.min(...vs), hi = Math.max(...vs); const pd = (hi - lo || 1) * 0.18; lo -= pd; hi += pd;
  const X = (i) => L + (i / (data.length - 1)) * (W - L - R), Y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const pts = data.map((p, i) => `${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join(" ");
  const id = "g" + color.slice(1), last = data[data.length - 1];
  const xs = [0, Math.floor((data.length - 1) / 2), data.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Trend chart">
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".28" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      {[0, 1, 2, 3].map((k) => { const v = lo + (k * (hi - lo)) / 3, y = Y(v); return <g key={k}><line x1={L} x2={W - R} y1={y} y2={y} stroke="var(--border)" /><text x={L - 6} y={y + 3.5} textAnchor="end" className="ax">{v.toFixed(1)}</text></g>; })}
      {goal != null && <g><line x1={L} x2={W - R} y1={Y(goal)} y2={Y(goal)} stroke="#22c55e" strokeWidth="1.5" strokeDasharray="5 4" /><text x={W - R} y={Y(goal) - 5} textAnchor="end" className="ax" fill="#4ade80">Target {goal}</text></g>}
      <polygon points={`${X(0)},${H - B} ${pts} ${X(data.length - 1)},${H - B}`} fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      {data.length <= 16 && data.map((p, i) => <circle key={i} cx={X(i)} cy={Y(p.y)} r="3" fill={color}><title>{`${p.x}: ${p.y} ${unit}`}</title></circle>)}
      <circle cx={X(data.length - 1)} cy={Y(last.y)} r="5" fill={color} stroke="var(--card)" strokeWidth="2" />
      {xs.map((i, k) => <text key={k} x={X(i)} y={H - 6} textAnchor={k === 0 ? "start" : k === 2 ? "end" : "middle"} className="ax">{data[i].x}</text>)}
    </svg>
  );
}

export function BarChart({ data, color, target, unit }) {
  const W = 360, H = 160, L = 40, R = 8, T = 12, B = 24, mx = Math.max(...data.map((x) => x.v), target || 0) * 1.12 || 1;
  const bw = (W - L - R) / data.length, Y = (v) => T + (1 - v / mx) * (H - T - B);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Bar chart">
      {[0, 0.5, 1].map((k) => { const v = mx * k, y = Y(v); return <g key={k}><line x1={L} x2={W - R} y1={y} y2={y} stroke="var(--border)" /><text x={L - 6} y={y + 3.5} textAnchor="end" className="ax">{Math.round(v)}</text></g>; })}
      {data.map((x, i) => (
        <g key={i}>
          <rect x={L + i * bw + bw * 0.2} y={Y(x.v)} width={bw * 0.6} height={Math.max(0, H - B - Y(x.v))} rx="4" fill={x.hi ? color : color + "88"}><title>{`${x.l}: ${x.v} ${unit}`}</title></rect>
          <text x={L + i * bw + bw / 2} y={H - 7} textAnchor="middle" className="ax">{x.l}</text>
        </g>
      ))}
      {target > 0 && <line x1={L} x2={W - R} y1={Y(target)} y2={Y(target)} stroke="#4ade80" strokeWidth="1.5" strokeDasharray="5 4" />}
    </svg>
  );
}

export function BodyFig({ hl }) {
  const c = (k) => `base ${hl === k ? "hl" : ""}`, both = (a, b) => `base ${hl === a || hl === b ? "hl" : ""}`;
  return (
    <svg viewBox="0 0 60 100" className="fig" aria-hidden="true">
      <circle cx="30" cy="9" r="7" className="base" />
      <rect x="17" y="19" width="26" height="36" rx="9" className={c("upper")} />
      <rect x="8" y="20" width="8" height="32" rx="4" className={c("upper")} />
      <rect x="44" y="20" width="8" height="32" rx="4" className={c("upper")} />
      <rect x="19" y="21" width="22" height="13" rx="5" className={c("chest")} />
      <rect x="18.5" y="22" width="7" height="24" rx="3.5" className={c("back")} />
      <rect x="34.5" y="22" width="7" height="24" rx="3.5" className={c("back")} />
      <rect x="19" y="46" width="22" height="12" rx="5" className={c("lower")} />
      <rect x="18" y="56" width="11" height="40" rx="5" className={both("legs", "lower")} />
      <rect x="31" y="56" width="11" height="40" rx="5" className={both("legs", "lower")} />
    </svg>
  );
}
