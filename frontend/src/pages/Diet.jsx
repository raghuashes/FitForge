import { useEffect, useState } from "react";
import api, { errMsg, today, pretty } from "../api.js";
import { Alert } from "../components/ui.jsx";
import { Ring, MacroRow, MacroChips, MC } from "../components/viz.jsx";
import DietPlans from "./DietPlans.jsx";
import { RecipeRow } from "../components/Recipes.jsx";
import { dietKind } from "../plan.js";

const TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];
const blank = { mealType: "BREAKFAST", foodName: "", calories: "", protein: "", carbs: "", fat: "" };

function Tracker() {
  const [date, setDate] = useState(today());
  const [meals, setMeals] = useState([]);
  const [sum, setSum] = useState(null);
  const [f, setF] = useState(blank);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    api.get("/meals", { params: { date } }).then((r) => setMeals(r.data)).catch((e) => setErr(errMsg(e)));
    api.get("/meals/summary", { params: { date } }).then((r) => setSum(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, [date]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const add = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const p = Number(f.protein || 0), c = Number(f.carbs || 0), fa = Number(f.fat || 0);
    // Blank calories are calculated from the macros (4 / 4 / 9 kcal per gram).
    const kcal = f.calories === "" ? Math.round(p * 4 + c * 4 + fa * 9) : Number(f.calories);
    try {
      await api.post("/meals", { date, mealType: f.mealType, foodName: f.foodName, calories: kcal, protein: p, carbs: c, fat: fa });
      setF({ ...blank, mealType: f.mealType });
      load();
    } catch (ex) { setErr(errMsg(ex)); }
    setBusy(false);
  };

  const remove = async (id) => {
    try { await api.delete(`/meals/${id}`); load(); } catch (e) { setErr(errMsg(e)); }
  };

  const left = sum ? sum.calorieTarget - sum.calories : 0;
  return (
    <div>
      <div className="row-between">
        <h2>Diet Tracker</h2>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "auto" }} />
      </div>
      <Alert msg={err} />

      {sum && (
        <div className="card">
          <div className="nut2">
            <Ring value={sum.calories} max={sum.calorieTarget} big={Math.abs(left)} sub={left >= 0 ? "kcal left" : "kcal over"} />
            <div style={{ flex: 1 }}>
              <MacroRow name="Protein" value={sum.protein} target={sum.proteinTarget} color={MC.p} />
              <MacroRow name="Carbs" value={sum.carbs} target={sum.carbTarget} color={MC.c} />
              <MacroRow name="Fat" value={sum.fat} target={sum.fatTarget} color={MC.f} />
            </div>
          </div>
          <div className="sumr">
            <div><span className="muted small-text">Eaten</span><b>{sum.calories}</b></div>
            <div><span className="muted small-text">Target</span><b>{sum.calorieTarget}</b></div>
            <div><span className="muted small-text">Macro kcal</span><b>{Math.round(sum.protein * 4)}P · {Math.round(sum.carbs * 4)}C · {Math.round(sum.fat * 9)}F</b></div>
          </div>
        </div>
      )}

      <form className="card" onSubmit={add}>
        <h3>Add a meal</h3>
        <div className="fg4">
          <label>Meal<select value={f.mealType} onChange={set("mealType")}>{TYPES.map((t) => <option key={t} value={t}>{pretty(t)}</option>)}</select></label>
          <label style={{ gridColumn: "span 2" }}>Food<input required placeholder="e.g. Chicken wrap" value={f.foodName} onChange={set("foodName")} /></label>
          <label>Calories<input type="number" min="0" placeholder="auto" value={f.calories} onChange={set("calories")} /></label>
          <label>Protein (g)<input type="number" min="0" step="0.1" value={f.protein} onChange={set("protein")} /></label>
          <label>Carbs (g)<input type="number" min="0" step="0.1" value={f.carbs} onChange={set("carbs")} /></label>
          <label>Fat (g)<input type="number" min="0" step="0.1" value={f.fat} onChange={set("fat")} /></label>
        </div>
        <p className="muted small-text">Leave calories blank to calculate them from the macros (4 / 4 / 9 kcal per gram).</p>
        <button className="btn" disabled={busy}>{busy ? "Adding..." : "Add meal"}</button>
      </form>

      <div className="card">
        <h3>Meals on {date}</h3>
        {meals.length === 0 ? <p className="muted">No meals logged for this day.</p> : TYPES.map((t) => {
          const l = meals.filter((m) => m.mealType === t);
          if (!l.length) return null;
          return (
            <div key={t}>
              <div className="mtype"><span>{pretty(t)}</span><span className="muted small-text">{l.reduce((a, m) => a + m.calories, 0)} kcal</span></div>
              {l.map((m) => (
                <div className="mealr" key={m.id}>
                  <div style={{ flex: 1, minWidth: 0 }}><b>{m.foodName}</b><MacroChips kcal={m.calories} p={m.protein} c={m.carbs} f={m.fat} /></div>
                  <button className="ib2" onClick={() => remove(m.id)} aria-label={`Remove ${m.foodName}`} title="Remove">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
                  </button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Diet() {
  const [tab, setTab] = useState("PLAN");
  const [kind, setKind] = useState("MAINTAIN");
  const [recipes, setRecipes] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/profile").then((r) => setKind(dietKind(r.data.goal))).catch(() => {});
  }, []);
  useEffect(() => {
    if (tab === "RECIPES") api.get("/diet/recipes", { params: { goal: kind } }).then((r) => setRecipes(r.data)).catch(() => {});
  }, [tab, kind]);

  const logRecipe = async (r) => {
    setMsg("");
    try {
      await api.post("/meals", { date: today(), mealType: "SNACK", foodName: r.name, calories: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat });
      setMsg(`${r.name} added to today's tracker.`);
    } catch (e) { setMsg(errMsg(e)); }
  };

  const tabs = [["PLAN", "Plan"], ["RECIPES", "Recipes"], ["TRACKER", "Tracker"]];
  const kinds = [["FAT_LOSS", "Fat loss"], ["MUSCLE_GAIN", "Muscle gain"], ["MAINTAIN", "Balanced"]];
  return (
    <div>
      <h1 className="ptitle">Diet</h1>
      <div className="tabs">
        {tabs.map(([k, l]) => <button key={k} className={`tab ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}>{l}</button>)}
      </div>
      {tab !== "TRACKER" && (
        <div className="chips">
          {kinds.map(([k, l]) => <button key={k} className={`chip ${kind === k ? "on" : ""}`} onClick={() => setKind(k)}>{l}</button>)}
        </div>
      )}
      {tab === "PLAN" && <DietPlans kind={kind} />}
      {tab === "RECIPES" && (
        <div>
          {msg && <div className="alert success">{msg}</div>}
          {recipes.map((r) => <RecipeRow key={r.name} r={r} onLog={logRecipe} />)}
        </div>
      )}
      {tab === "TRACKER" && <Tracker />}
    </div>
  );
}
