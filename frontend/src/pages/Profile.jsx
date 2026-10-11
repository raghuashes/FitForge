import { useEffect, useState } from "react";
import api, { errMsg } from "../api.js";
import { Alert } from "../components/ui.jsx";

export default function Profile() {
  const [f, setF] = useState(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/profile").then((r) => setF(r.data)).catch((e) => setErr(errMsg(e)));
  }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(""); setOk("");
    try {
      const body = {
        ...f,
        heightCm: Number(f.heightCm), weightKg: Number(f.weightKg), daysPerWeek: Number(f.daysPerWeek),
        calorieTarget: Number(f.calorieTarget), proteinTarget: Number(f.proteinTarget),
      };
      const r = await api.put("/profile", body);
      setF(r.data);
      setOk("Profile saved!");
    } catch (ex) { setErr(errMsg(ex)); }
    setBusy(false);
  };

  if (!f) return <><Alert msg={err} /><p className="muted">Loading…</p></>;

  return (
    <div>
      <h2>Fitness Profile</h2>
      <form className="card form-grid" onSubmit={save}>
        <Alert msg={err} /><Alert msg={ok} type="success" />
        <label>Goal
          <select value={f.goal} onChange={set("goal")}>
            <option value="MUSCLE_GAIN">Muscle gain</option>
            <option value="WEIGHT_LOSS">Weight loss</option>
            <option value="GENERAL_FITNESS">General fitness</option>
          </select>
        </label>
        <label>Experience
          <select value={f.experience} onChange={set("experience")}>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </label>
        <label>Height (cm)<input type="number" step="0.1" min="50" required value={f.heightCm} onChange={set("heightCm")} /></label>
        <label>Current weight (kg)<input type="number" step="0.1" min="20" required value={f.weightKg} onChange={set("weightKg")} /></label>
        <label>Workout days per week<input type="number" min="1" max="7" required value={f.daysPerWeek} onChange={set("daysPerWeek")} /></label>
        <label>Daily calorie target<input type="number" min="500" required value={f.calorieTarget} onChange={set("calorieTarget")} /></label>
        <label>Daily protein target (g)<input type="number" min="10" required value={f.proteinTarget} onChange={set("proteinTarget")} /></label>
        <div className="full"><button className="btn" disabled={busy}>{busy ? "Saving..." : "Save profile"}</button></div>
      </form>
    </div>
  );
}
