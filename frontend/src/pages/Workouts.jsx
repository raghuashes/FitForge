import { useEffect, useState } from "react";
import api, { errMsg, today, useExercises } from "../api.js";
import { Alert } from "../components/ui.jsx";

const blankRow = () => ({ exerciseId: "", sets: 3, reps: 10, weightKg: 0 });

export default function Workouts() {
  const exercises = useExercises();
  const [history, setHistory] = useState([]);
  const [bests, setBests] = useState([]);
  const [date, setDate] = useState(today());
  const [duration, setDuration] = useState(45);
  const [rows, setRows] = useState([blankRow()]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    api.get("/workouts").then((r) => setHistory(r.data)).catch((e) => setErr(errMsg(e)));
    api.get("/workouts/personal-bests").then((r) => setBests(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const updateRow = (i, k, v) => setRows(rows.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(""); setOk("");
    try {
      const entries = rows.map((r) => ({
        exerciseId: Number(r.exerciseId || exercises[0]?.id),
        sets: Number(r.sets), reps: Number(r.reps), weightKg: Number(r.weightKg),
      }));
      await api.post("/workouts", { date, durationMinutes: Number(duration), entries });
      setOk("Workout logged!");
      setRows([blankRow()]);
      load();
    } catch (ex) { setErr(errMsg(ex)); }
    setBusy(false);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this workout?")) return;
    try { await api.delete(`/workouts/${id}`); load(); } catch (e) { setErr(errMsg(e)); }
  };

  return (
    <div>
      <h2>Workout Log</h2>
      <p className="muted small-text">Guided sessions from Explore are logged here automatically. Use this form for your own custom workouts.</p>
      <form className="card" onSubmit={submit}>
        <h3>Log a workout</h3>
        <Alert msg={err} /><Alert msg={ok} type="success" />
        <div className="form-grid">
          <label>Date<input type="date" required value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <label>Duration (minutes)<input type="number" min="1" required value={duration} onChange={(e) => setDuration(e.target.value)} /></label>
        </div>
        <div className="row-fields head muted small-text"><span>Exercise</span><span>Sets</span><span>Reps</span><span>Weight (kg)</span><span></span></div>
        {rows.map((r, i) => (
          <div className="row-fields four" key={i}>
            <select value={r.exerciseId || exercises[0]?.id || ""} onChange={(e) => updateRow(i, "exerciseId", e.target.value)}>
              {exercises.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
            <input type="number" min="1" value={r.sets} onChange={(e) => updateRow(i, "sets", e.target.value)} />
            <input type="number" min="1" value={r.reps} onChange={(e) => updateRow(i, "reps", e.target.value)} />
            <input type="number" min="0" step="0.5" value={r.weightKg} onChange={(e) => updateRow(i, "weightKg", e.target.value)} />
            <button type="button" className="btn small danger" onClick={() => setRows(rows.filter((_, idx) => idx !== i))} disabled={rows.length === 1}>✕</button>
          </div>
        ))}
        <div className="row">
          <button type="button" className="btn ghost small" onClick={() => setRows([...rows, blankRow()])}>+ Add exercise</button>
          <button className="btn" disabled={busy}>{busy ? "Saving..." : "Save workout"}</button>
        </div>
      </form>

      <div className="two-col">
        <div className="card">
          <h3>History</h3>
          {history.length === 0 ? <p className="muted">No workouts logged yet.</p> : (
            <ul className="list">
              {history.map((w) => (
                <li key={w.id}>
                  <div className="row-between">
                    <strong>{w.title || "Custom workout"} · {w.date} · {w.durationMinutes} min</strong>
                    <button className="btn small danger" onClick={() => remove(w.id)}>Delete</button>
                  </div>
                  <div className="muted small-text">{w.entries.map((e) => `${e.exerciseName} ${e.sets}×${e.reps} @ ${e.weightKg}kg`).join(" · ")}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h3>🏆 Personal bests</h3>
          {bests.length === 0 ? <p className="muted">Log a workout to see your best lifts.</p> : (
            <table>
              <thead><tr><th>Exercise</th><th>Best weight</th></tr></thead>
              <tbody>{bests.map((b) => <tr key={b.exerciseName}><td>{b.exerciseName}</td><td>{b.weightKg} kg</td></tr>)}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
