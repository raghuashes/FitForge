import { useEffect, useState } from "react";
import api, { errMsg, pretty, useExercises } from "../api.js";
import { Alert } from "../components/ui.jsx";
import { GymArt, quoteOfDay } from "../components/Art.jsx";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const blankRow = () => ({ exerciseId: "", dayOfWeek: "Monday", sets: 3, reps: 10, restSeconds: 60 });

export default function Plans() {
  const exercises = useExercises();
  const [plans, setPlans] = useState([]);
  const [sel, setSel] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("GENERAL_FITNESS");
  const [rows, setRows] = useState([blankRow()]);
  const [wk, setWk] = useState(1);
  const [sm, setSm] = useState({ goal: "WEIGHT_LOSS", experience: "BEGINNER", weightKg: 70, daysPerWeek: 4 });

  const load = () => api.get("/plans").then((r) => setPlans(r.data)).catch((e) => setErr(errMsg(e)));
  useEffect(() => {
    load();
    api.get("/profile").then((r) => setSm({
      goal: r.data.goal, experience: r.data.experience, weightKg: r.data.weightKg, daysPerWeek: r.data.daysPerWeek,
    })).catch(() => {});
  }, []);

  const build = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const r = await api.post("/plans/smart", {
        goal: sm.goal, experience: sm.experience, weightKg: Number(sm.weightKg), daysPerWeek: Number(sm.daysPerWeek),
      });
      await load();
      setSel(r.data);
    } catch (ex) { setErr(errMsg(ex)); }
    setBusy(false);
  };

  const create = async (ev) => {
    ev.preventDefault();
    setBusy(true); setErr("");
    try {
      const items = rows.map((r) => ({
        exerciseId: Number(r.exerciseId || exercises[0]?.id),
        dayOfWeek: r.dayOfWeek, sets: Number(r.sets), reps: Number(r.reps), restSeconds: Number(r.restSeconds),
      }));
      const r = await api.post("/plans", { name, goal, items });
      await load();
      setSel(r.data); setShow(false); setName(""); setRows([blankRow()]);
    } catch (e) { setErr(errMsg(e)); }
    setBusy(false);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this plan?")) return;
    try {
      await api.delete(`/plans/${id}`);
      if (sel?.id === id) setSel(null);
      load();
    } catch (e) { setErr(errMsg(e)); }
  };

  const updateRow = (i, k, v) => setRows(rows.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  const setS = (k) => (e) => setSm({ ...sm, [k]: e.target.value });

  const hasW2 = !!sel && sel.items.some((i) => (i.weekNo || 1) === 2);
  const showWk = hasW2 ? wk : 1;
  const byDay = sel ? DAYS.map((d) => [d, sel.items.filter((i) => (i.weekNo || 1) === showWk && i.dayOfWeek === d)]).filter(([, l]) => l.length) : [];

  return (
    <div>
      <div className="page-hero compact">
        <GymArt />
        <div className="hero-text">
          <h1>Smart workout plan</h1>
          <p className="quote">“{quoteOfDay()}”</p>
        </div>
      </div>
      <Alert msg={err} />

      <form className="card" onSubmit={build}>
        <h3>⚡ Build my smart plan</h3>
        <p className="muted small-text">Tell us your target and body weight. We pick the split, reps, rest and a starting weight for each lift.</p>
        <div className="form-grid">
          <label>Target
            <select value={sm.goal} onChange={setS("goal")}>
              <option value="WEIGHT_LOSS">Fat loss</option>
              <option value="MUSCLE_GAIN">Muscle gain</option>
              <option value="GENERAL_FITNESS">General fitness</option>
            </select>
          </label>
          <label>Body weight (kg)<input type="number" min="30" step="0.1" required value={sm.weightKg} onChange={setS("weightKg")} /></label>
          <label>Experience
            <select value={sm.experience} onChange={setS("experience")}>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </label>
          <label>Workout days per week<input type="number" min="1" max="7" required value={sm.daysPerWeek} onChange={setS("daysPerWeek")} /></label>
        </div>
        <div className="row">
          <button className="btn" disabled={busy}>{busy ? "Building..." : "Build my plan"}</button>
          <button type="button" className="btn ghost" onClick={() => setShow(!show)}>{show ? "Cancel" : "Create a plan manually"}</button>
        </div>
      </form>

      {show && (
        <form className="card" onSubmit={create}>
          <h3>New manual plan</h3>
          <div className="form-grid">
            <label>Plan name<input required value={name} onChange={(e) => setName(e.target.value)} /></label>
            <label>Goal
              <select value={goal} onChange={(e) => setGoal(e.target.value)}>
                <option value="MUSCLE_GAIN">Muscle gain</option>
                <option value="WEIGHT_LOSS">Fat loss</option>
                <option value="GENERAL_FITNESS">General fitness</option>
              </select>
            </label>
          </div>
          {rows.map((r, i) => (
            <div className="row-fields" key={i}>
              <select value={r.exerciseId || exercises[0]?.id || ""} onChange={(e) => updateRow(i, "exerciseId", e.target.value)}>
                {exercises.map((x) => <option key={x.id} value={x.id}>{x.name} ({x.muscleGroup})</option>)}
              </select>
              <select value={r.dayOfWeek} onChange={(e) => updateRow(i, "dayOfWeek", e.target.value)}>
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
              <input type="number" min="1" title="Sets" value={r.sets} onChange={(e) => updateRow(i, "sets", e.target.value)} />
              <input type="number" min="1" title="Reps" value={r.reps} onChange={(e) => updateRow(i, "reps", e.target.value)} />
              <input type="number" min="0" title="Rest (sec)" value={r.restSeconds} onChange={(e) => updateRow(i, "restSeconds", e.target.value)} />
              <button type="button" className="btn small danger" onClick={() => setRows(rows.filter((_, idx) => idx !== i))} disabled={rows.length === 1}>✕</button>
            </div>
          ))}
          <div className="row">
            <button type="button" className="btn ghost small" onClick={() => setRows([...rows, blankRow()])}>+ Add exercise</button>
            <button className="btn" disabled={busy}>Save plan</button>
          </div>
        </form>
      )}

      <div className="two-col">
        <div className="card">
          <h3>My plans</h3>
          {plans.length === 0 ? <p className="muted">No plans yet. Build your smart plan above.</p> : (
            <ul className="list">
              {plans.map((p) => (
                <li key={p.id} className={sel?.id === p.id ? "selected" : ""}>
                  <div className="row-between">
                    <div>
                      <strong>{p.name}</strong>
                      <div className="muted small-text">{pretty(p.goal)} · {p.items.length} exercises · {p.createdOn}</div>
                    </div>
                    <div className="row">
                      <button className="btn small ghost" onClick={() => setSel(p)}>View</button>
                      <button className="btn small danger" onClick={() => remove(p.id)}>Delete</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h3>{sel ? sel.name : "Plan details"}</h3>
          {!sel ? <p className="muted">Select a plan to see your weekly schedule.</p> : (
            <>
              {sel.notes && <div className="callout">{sel.notes}</div>}
              {hasW2 && (
                <div className="week-toggle" style={{ marginBottom: 8 }}>
                  <button className={showWk === 1 ? "on" : ""} onClick={() => setWk(1)}>Week 1</button>
                  <button className={showWk === 2 ? "on" : ""} onClick={() => setWk(2)}>Week 2</button>
                </div>
              )}
              {byDay.map(([day, items]) => (
                <div key={day} className="day-block">
                  <h4>{day}</h4>
                  <table>
                    <tbody>
                      {items.map((i) => (
                        <tr key={i.id}>
                          <td>{i.exerciseName}<div className="muted small-text">{i.note || i.muscleGroup}</div></td>
                          <td className="nowrap"><strong>{i.minutes > 0 ? `${i.minutes} min` : `${i.sets} × ${i.reps}`}</strong></td>
                          <td className="muted nowrap">{i.restSeconds > 0 ? `${i.restSeconds}s rest` : ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
