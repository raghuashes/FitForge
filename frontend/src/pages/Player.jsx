import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { errMsg, today } from "../api.js";
import { Alert } from "../components/ui.jsx";
import { banner, fmt } from "../catalog.js";

function buildQueue(w) {
  const q = [];
  w.steps.forEach((s, i) => {
    for (let n = 1; n <= s.sets; n++) {
      q.push({ type: "work", step: s, set: n });
      const last = i === w.steps.length - 1 && n === s.sets;
      if (!last && s.restSeconds > 0) q.push({ type: "rest", seconds: s.restSeconds });
    }
  });
  return q;
}
const initial = (c) => (!c ? 0 : c.type === "rest" ? c.seconds : c.step.durationSeconds || 0);

export default function Player() {
  const { id } = useParams();
  const nav = useNavigate();
  const [w, setW] = useState(null);
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ending, setEnding] = useState(false);
  const [done, setDone] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const startedAt = useRef(0);

  useEffect(() => {
    api.get(`/catalog/${id}`).then((r) => {
      const q = buildQueue(r.data);
      setW(r.data); setQueue(q); setIdx(0); setRemaining(initial(q[0]));
    }).catch((e) => setErr(errMsg(e)));
  }, [id]);

  const cur = queue[idx];
  const timed = !!cur && (cur.type === "rest" || cur.step.durationSeconds > 0);
  const active = started && !paused && !ending && !done;

  useEffect(() => {
    if (!active || !timed) return;
    const t = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [active, timed, idx]);

  useEffect(() => {
    if (active && timed && remaining <= 0) next();
    // eslint-disable-next-line
  }, [remaining]);

  const go = (i) => { setIdx(i); setRemaining(initial(queue[i])); };
  const next = () => { if (idx + 1 >= queue.length) setEnding(true); else go(idx + 1); };
  const start = () => { startedAt.current = Date.now(); setStarted(true); };

  const save = async () => {
    setSaving(true); setErr("");
    const minutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000));
    try {
      await api.post(`/catalog/${id}/complete`, { date: today(), durationMinutes: minutes });
      setDone({ minutes });
    } catch (e) { setErr(errMsg(e)); }
    setSaving(false);
  };

  if (err && !w) return <Alert msg={err} />;
  if (!w) return <p className="muted">Loading…</p>;

  if (done) {
    return (
      <div className="card player center">
        <div className="big-emoji">🎉</div>
        <h2>Workout complete!</h2>
        <p className="muted">{w.title}</p>
        <div className="stats">
          <div className="card stat"><span className="muted">Time</span><strong>{done.minutes} min</strong></div>
          <div className="card stat"><span className="muted">Est. calories</span><strong>~{w.caloriesBurned}</strong></div>
        </div>
        <p className="muted small-text">Saved to your workout log.</p>
        <div className="row" style={{ justifyContent: "center" }}>
          <button className="btn" onClick={() => nav("/dashboard")}>Go to dashboard</button>
          <button className="btn ghost" onClick={() => nav(`/explore?loc=${w.location}`)}>More workouts</button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="card player center">
        <div className="detail-banner" style={banner(w.category)}><div><h1>{w.title}</h1><p>{w.exerciseCount} exercises · {w.durationMinutes} min</p></div></div>
        <p className="muted">Get your space ready. Each exercise runs with a timer or a rep target, with rest breaks in between.</p>
        <button className="btn big-btn" onClick={start}>▶ Start</button>
        <p><Link to={`/explore/${w.id}`} className="back">← Back to details</Link></p>
      </div>
    );
  }

  if (ending) {
    return (
      <div className="card player center">
        <div className="big-emoji">💪</div>
        <h2>All sets done!</h2>
        <p className="muted">Save this session to your workout log.</p>
        <Alert msg={err} />
        <button className="btn big-btn" onClick={save} disabled={saving}>{saving ? "Saving..." : "Finish & save"}</button>
      </div>
    );
  }

  const isRest = cur.type === "rest";
  const upNext = isRest ? queue[idx + 1] : queue[idx + 1]?.type === "rest" ? queue[idx + 2] : queue[idx + 1];
  const pct = Math.round((idx / queue.length) * 100);

  return (
    <div className={`card player center ${isRest ? "rest" : "work"}`}>
      <div className="bar-wrap"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
      <div className="phase">{isRest ? "REST" : `SET ${cur.set} OF ${cur.step.sets}`}</div>
      <h1 className="p-title">{isRest ? "Take a breather" : cur.step.name}</h1>
      {!isRest && cur.step.tip && <p className="muted">{cur.step.tip}</p>}

      {timed ? (
        <div className="countdown">{fmt(remaining)}</div>
      ) : (
        <div className="countdown reps">{cur.step.reps} <small>reps</small></div>
      )}

      <div className="row" style={{ justifyContent: "center" }}>
        {timed && <button className="btn ghost" onClick={() => setPaused(!paused)}>{paused ? "▶ Resume" : "⏸ Pause"}</button>}
        {!timed && <button className="btn big-btn" onClick={next}>✓ Done</button>}
        <button className="btn ghost" onClick={next}>Skip ⏭</button>
      </div>

      {upNext && upNext.type === "work" && (
        <p className="muted small-text">Up next: <strong>{upNext.step.name}</strong></p>
      )}
      <p><Link to={`/explore/${w.id}`} className="back">Quit workout</Link></p>
    </div>
  );
}
