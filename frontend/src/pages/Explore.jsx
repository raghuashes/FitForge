import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api, { errMsg, pretty } from "../api.js";
import { Alert } from "../components/ui.jsx";
import { banner, catStyle } from "../catalog.js";
import { GymArt, quoteOfDay, ExerciseImg } from "../components/Art.jsx";
import { BodyFig, MacroChips } from "../components/viz.jsx";
import { MGS, EX } from "../exercises.js";

const CATEGORIES = ["All", "Strength", "HIIT", "Cardio", "Core", "Yoga"];
const LEVELS = ["All", "BEGINNER", "INTERMEDIATE", "ADVANCED"];

function Workouts() {
  const [sp, setSp] = useSearchParams();
  const loc = sp.get("loc") === "GYM" ? "GYM" : "HOME";
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [list, setList] = useState(null);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    setList(null);
    const params = { location: loc };
    if (category !== "All") params.category = category;
    if (level !== "All") params.level = level;
    api.get("/catalog", { params }).then((r) => setList(r.data)).catch((e) => { setErr(errMsg(e)); setList([]); });
  }, [loc, category, level]);

  return (
    <div>
      <div className="explore-hero">
        <GymArt />
        <h2>Train anywhere</h2>
        <p>Guided workouts you can follow step by step, at home or in the gym.</p>
        <p className="quote">“{quoteOfDay()}”</p>
        <div className="segmented">
          <button className={loc === "HOME" ? "on" : ""} onClick={() => setSp({ loc: "HOME" })}>🏠 Home</button>
          <button className={loc === "GYM" ? "on" : ""} onClick={() => setSp({ loc: "GYM" })}>🏋️ Gym</button>
        </div>
      </div>

      <div className="chips">
        {CATEGORIES.map((c) => (
          <button key={c} className={`chip ${category === c ? "on" : ""}`} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>
      <div className="chips">
        {LEVELS.map((l) => (
          <button key={l} className={`chip light ${level === l ? "on" : ""}`} onClick={() => setLevel(l)}>{l === "All" ? "Any level" : pretty(l)}</button>
        ))}
      </div>

      <Alert msg={err} />
      {list === null ? <p className="muted">Loading workouts…</p> : list.length === 0 ? (
        <p className="muted">No workouts match these filters.</p>
      ) : (
        <div className="workout-grid">
          {list.map((w) => (
            <div key={w.id} className="wcard" onClick={() => nav(`/explore/${w.id}`)}>
              <div className="wbanner" style={banner(w.category)}>
                <span className="wemoji">{catStyle(w.category).emoji}</span>
                <span className="badge">{pretty(w.level)}</span>
                <span className="badge cat">{w.category}</span>
              </div>
              <div className="wbody">
                <h3>{w.title}</h3>
                <p className="muted small-text">{w.description}</p>
                <div className="meta">
                  <span>⏱ {w.durationMinutes} min</span>
                  <span>🔥 {w.caloriesBurned} kcal</span>
                  <span>📋 {w.exerciseCount} moves</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const Chev = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
);

function ExerciseCard({ e, open, onToggle }) {
  const [name, equip, level, rx, target, pose, steps, tip] = e;
  const group = ["Chest", "Back", "Shoulders", "Biceps", "Triceps", "Core"].includes(target) ? target : "Legs";
  return (
    <div className={`exc ${open ? "open" : ""}`}>
      <button className="exh" onClick={onToggle} aria-expanded={open}>
        <ExerciseImg name={name} group={group} pose={pose} />
        <div className="exm">
          <b>{name}</b>
          <div className="mchips"><span className="mx k">{rx}</span><span className="mx eq">{equip}</span><span className="mx lv">{level}</span></div>
          <div className="muted small-text">Targets: {target}</div>
        </div>
        <span className="chv"><Chev /></span>
      </button>
      {open && (
        <div className="exb">
          <ExerciseImg name={name} group={group} pose={pose} />
          <div style={{ flex: 1 }}>
            <h4>How to do it</h4>
            <ol className="how">{steps.map((s) => <li key={s}>{s}</li>)}</ol>
            <div className="callout"><b>Coach tip:</b> {tip}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Muscles() {
  const [mg, setMg] = useState(null);
  const [eq, setEq] = useState("All");
  const [open, setOpen] = useState(null);

  if (!mg) {
    return (
      <div className="mgrid">
        {MGS.map((m) => (
          <button key={m.k} className="mt" onClick={() => { setMg(m.k); setEq("All"); setOpen(null); }}>
            <BodyFig hl={m.hl} />
            <div><b>{m.n}</b><span className="muted small-text">{m.sub}</span><span className="cnt">{EX[m.k].length} exercises</span></div>
            <span className="chv"><Chev /></span>
          </button>
        ))}
      </div>
    );
  }
  const m = MGS.find((x) => x.k === mg), all = EX[mg];
  const eqs = ["All", ...new Set(all.map((e) => e[1]))];
  const list = all.filter((e) => eq === "All" || e[1] === eq);
  return (
    <div>
      <a className="back" href="#" onClick={(ev) => { ev.preventDefault(); setMg(null); }}>‹ All muscle groups</a>
      <div className="mhd">
        <BodyFig hl={m.hl} />
        <div><h2 style={{ margin: "0 0 4px" }}>{m.n}</h2><div className="muted small-text">{m.sub}</div><p className="muted" style={{ margin: "8px 0 0", fontSize: 14 }}>{m.blurb}</p></div>
      </div>
      <div className="chips">{eqs.map((q) => <button key={q} className={`chip ${eq === q ? "on" : ""}`} onClick={() => setEq(q)}>{q}</button>)}</div>
      <p className="muted small-text">{list.length} exercise{list.length === 1 ? "" : "s"}</p>
      {list.map((x) => <ExerciseCard key={x[0]} e={x} open={open === x[0]} onToggle={() => setOpen(open === x[0] ? null : x[0])} />)}
    </div>
  );
}

export default function Explore() {
  const [sp, setSp] = useSearchParams();
  // ?loc=HOME|GYM opens guided workouts (links from the dashboard); otherwise muscle groups.
  const tab = sp.get("tab") || (sp.get("loc") ? "WRK" : "MUS");
  return (
    <div>
      <h1 className="ptitle">Explore</h1>
      <div className="tabs">
        <button className={`tab ${tab === "MUS" ? "on" : ""}`} onClick={() => setSp({ tab: "MUS" })}>Muscle groups</button>
        <button className={`tab ${tab === "WRK" ? "on" : ""}`} onClick={() => setSp({ tab: "WRK", loc: sp.get("loc") || "HOME" })}>Guided workouts</button>
      </div>
      {tab === "MUS" ? <Muscles /> : <Workouts />}
    </div>
  );
}
