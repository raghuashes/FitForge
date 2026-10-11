import { useEffect, useState } from "react";
import api, { errMsg, today } from "../api.js";
import { Alert } from "../components/ui.jsx";

const GOAL_OF = { FAT_LOSS: "WEIGHT_LOSS", MUSCLE_GAIN: "MUSCLE_GAIN", MAINTAIN: "GENERAL_FITNESS" };

export default function DietPlans({ kind }) {
  const [plans, setPlans] = useState(null);
  const [pref, setPref] = useState("veg");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    api.get("/diet/plans").then((r) => setPlans(r.data)).catch((e) => { setErr(errMsg(e)); setPlans([]); });
  }, []);

  const plan = plans?.find((p) => p.goal === kind);

  const logMeal = async (m) => {
    setErr(""); setOk("");
    try {
      await api.post("/meals", {
        date: today(), mealType: m.mealType, foodName: (pref === "veg" ? m.veg : m.nonVeg).slice(0, 250),
        calories: m.calories, protein: m.protein, carbs: 0, fat: 0,
      });
      setOk(`${m.name} added to today's tracker.`);
    } catch (e) { setErr(errMsg(e)); }
  };

  const useTargets = async () => {
    setErr(""); setOk("");
    try {
      const pr = (await api.get("/profile")).data;
      await api.put("/profile", { ...pr, calorieTarget: plan.calories, proteinTarget: plan.protein, goal: GOAL_OF[kind] });
      setOk("Your daily calorie and protein targets were updated.");
    } catch (e) { setErr(errMsg(e)); }
  };

  if (plans === null) return <p className="muted">Loading your plan…</p>;
  if (!plan) return <Alert msg={err || "Plan not available."} />;

  const macros = [
    ["Protein", plan.protein, plan.protein * 4], ["Carbs", plan.carbs, plan.carbs * 4], ["Fat", plan.fat, plan.fat * 9],
  ];
  const total = macros.reduce((a, m) => a + m[2], 0) || 1;

  return (
    <div>
      <div className={`diet-hero ${kind === "FAT_LOSS" ? "fat" : kind === "MUSCLE_GAIN" ? "muscle" : ""}`}>
        <h2>{plan.title}</h2>
        <p>{plan.summary}</p>
        <span className="pill">Built for {Math.round(plan.weightKg)} kg body weight</span>
      </div>
      <Alert msg={err} /><Alert msg={ok} type="success" />

      <div className="card">
        <div className="kcal-big"><strong>{plan.calories}</strong><span className="muted">kcal per day</span></div>
        {macros.map(([n, g, kc]) => (
          <div className="macro" key={n}>
            <div className="row-between"><span>{n}</span><span><b>{g} g</b> <span className="muted small-text">({Math.round((kc / total) * 100)}%)</span></span></div>
            <div className="bar-wrap"><div className="bar-fill" style={{ width: `${(kc / total) * 100}%` }} /></div>
          </div>
        ))}
        <button className="btn ghost" onClick={useTargets}>Use as my daily targets</button>
      </div>

      <h3 className="sec-title">Micronutrients</h3>
      <p className="muted small-text">General adult reference intakes for your plan. Needs vary with age, sex and health.</p>
      <div className="micro-grid">
        {plan.micros.map((m) => (
          <div className="micro" key={m.name}>
            <div className="micro-top"><b>{m.name}</b><span>{m.target}</span></div>
            <div className="muted small-text">{m.why}</div>
            <div className="micro-src">{m.sources}</div>
          </div>
        ))}
      </div>

      <div className="row-between" style={{ marginTop: 16 }}>
        <h3 className="sec-title" style={{ margin: 0 }}>Meals</h3>
        <div className="segmented small">
          <button className={pref === "veg" ? "on" : ""} onClick={() => setPref("veg")}>🥗 Veg</button>
          <button className={pref === "non" ? "on" : ""} onClick={() => setPref("non")}>🍗 Non-veg</button>
        </div>
      </div>
      {plan.meals.map((m) => (
        <div className="card meal-card" key={m.name}>
          <div className="meal-head">
            <div><strong>{m.name}</strong><div className="muted small-text">{m.time}</div></div>
            <div className="meal-macros"><b>{m.calories}</b> kcal · <b>{m.protein}</b> g protein</div>
          </div>
          <p>{pref === "veg" ? m.veg : m.nonVeg}</p>
          <div className="rich">Rich in: {m.rich}</div>
          <button className="btn small ghost" onClick={() => logMeal(m)}>+ Log to today</button>
        </div>
      ))}

      <div className="card"><h3>Coach tips</h3><ul className="tips">{plan.tips.map((t) => <li key={t}>{t}</li>)}</ul></div>
    </div>
  );
}
