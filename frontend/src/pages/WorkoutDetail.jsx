import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { errMsg, pretty } from "../api.js";
import { Alert } from "../components/ui.jsx";
import { banner, catStyle, rx } from "../catalog.js";
import { ExerciseImg } from "../components/Art.jsx";

export default function WorkoutDetail() {
  const { id } = useParams();
  const [w, setW] = useState(null);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    api.get(`/catalog/${id}`).then((r) => setW(r.data)).catch((e) => setErr(errMsg(e)));
  }, [id]);

  if (err) return <Alert msg={err} />;
  if (!w) return <p className="muted">Loading…</p>;

  return (
    <div>
      <Link to={`/explore?loc=${w.location}`} className="back">← Back to {w.location === "HOME" ? "Home" : "Gym"} workouts</Link>
      <div className="detail-banner" style={banner(w.category)}>
        <span className="wemoji big">{catStyle(w.category).emoji}</span>
        <div>
          <div className="row">
            <span className="badge">{w.location === "HOME" ? "🏠 Home" : "🏋️ Gym"}</span>
            <span className="badge">{pretty(w.level)}</span>
            <span className="badge">{w.category}</span>
          </div>
          <h1>{w.title}</h1>
          <p>{w.description}</p>
        </div>
      </div>

      <div className="stats">
        <div className="card stat"><span className="muted">Duration</span><strong>{w.durationMinutes} min</strong></div>
        <div className="card stat"><span className="muted">Calories</span><strong>~{w.caloriesBurned}</strong></div>
        <div className="card stat"><span className="muted">Exercises</span><strong>{w.exerciseCount}</strong></div>
      </div>

      <div className="card">
        <div className="row-between">
          <h3>Exercises</h3>
          <button className="btn" onClick={() => nav(`/play/${w.id}`)}>▶ Start workout</button>
        </div>
        <ol className="steps">
          {w.steps.map((s) => (
            <li key={s.order}>
              <div className="step-num">{s.order + 1}</div>
              <ExerciseImg name={s.name} group={s.muscleGroup} />
              <div className="step-main">
                <strong>{s.name}</strong>
                <div className="muted small-text">{s.muscleGroup}{s.tip ? ` · ${s.tip}` : ""}</div>
              </div>
              <div className="step-rx">
                <strong>{rx(s)}</strong>
                {s.restSeconds > 0 && <div className="muted small-text">{s.restSeconds}s rest</div>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
