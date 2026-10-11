import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg, today } from "../api.js";
import { Alert } from "../components/ui.jsx";
import { ExerciseImg } from "../components/Art.jsx";
import { weekDates, weekdayName, dayTitle, dayMinutes, repsList, warmupFor, warmMinutes, goalLabel } from "../plan.js";

export default function Fitness() {
  const [weekOff, setWeekOff] = useState(0);
  const week = useMemo(() => weekDates(weekOff), [weekOff]);
  const todayName = weekdayName(new Date());
  const [plan, setPlan] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [sel, setSel] = useState(todayName);
  const [warm, setWarm] = useState(true);
  const [work, setWork] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/plans").then((r) => setPlan(r.data[0] || null)).catch((e) => { setErr(errMsg(e)); setPlan(null); });
    api.get("/profile").then((r) => setProfile(r.data)).catch(() => {});
  }, []);

  if (plan === undefined) return <p className="muted">Loading your plan…</p>;
  if (plan === null) {
    return (
      <div>
        <Alert msg={err} />
        <h1 className="ptitle">My Workout Plan</h1>
        <div className="card center">
          <div className="big-emoji">🗓️</div>
          <p className="muted">You don't have a plan yet. Tell us your target and weight and we'll build one for you.</p>
          <Link className="btn" to="/plans">Build my smart plan</Link>
        </div>
      </div>
    );
  }

  const hasWeek2 = plan.items.some((i) => (i.weekNo || 1) === 2);
  const wkNo = weekOff === 1 && hasWeek2 ? 2 : 1;
  const weekItems = plan.items.filter((i) => (i.weekNo || 1) === wkNo);
  const items = weekItems.filter((i) => i.dayOfWeek === sel);
  const trainingDays = new Set(weekItems.map((i) => i.dayOfWeek));
  const isToday = weekOff === 0 && sel === todayName;
  const mins = dayMinutes(items);
  const warmList = warmupFor(items);
  const warmMins = warmMinutes(warmList);
  const range = `${week[0].num} ${week[0].month} – ${week[6].num} ${week[6].month}`;

  const swap = async () => {
    setBusy(true); setErr(""); setOk("");
    try {
      const r = await api.post(`/plans/${plan.id}/swap`, { from: sel, to: todayName, week: wkNo });
      setPlan(r.data); setSel(todayName); setOk("Swapped. This workout is now today's session.");
    } catch (e) { setErr(errMsg(e)); }
    setBusy(false);
  };

  const done = async () => {
    setBusy(true); setErr(""); setOk("");
    try {
      await api.post("/workouts", {
        date: today(), durationMinutes: Math.max(1, mins + warmMins),
        entries: items.map((i) => ({ exerciseId: i.exerciseId, sets: i.sets, reps: i.reps, weightKg: 0 })),
      });
      setOk("Workout logged. Great job!");
    } catch (e) { setErr(errMsg(e)); }
    setBusy(false);
  };

  return (
    <div>
      <div className="plan-head">
        <Link to="/dashboard" className="icon-btn" aria-label="Back">‹</Link>
        <div>
          <h1 className="ptitle">My Workout Plan</h1>
          <div className="chips-line">{goalLabel(plan.goal)} • {(profile?.experience || "BEGINNER")} • {trainingDays.size} DAYS</div>
        </div>
        <Link to="/plans" className="icon-btn" aria-label="Plan settings">⚙</Link>
      </div>

      <div className="week-toggle">
        <button className={weekOff === 0 ? "on" : ""} onClick={() => { setWeekOff(0); setOk(""); }}>This week</button>
        <button className={weekOff === 1 ? "on" : ""} onClick={() => { setWeekOff(1); setOk(""); }}>Next week</button>
        <span className="muted small-text">{range}</span>
      </div>

      <div className="week-strip">
        {week.map((d) => (
          <button key={d.name} className={`wd ${sel === d.name ? "on" : ""} ${trainingDays.has(d.name) ? "" : "rest"}`} onClick={() => { setSel(d.name); setOk(""); }}>
            <span className="num">{d.num}</span><span className="sh">{d.short}</span>
            {weekOff === 0 && d.name === todayName && <i className="dot" />}
          </button>
        ))}
      </div>

      {weekOff === 1 && (
        <div className="callout">
          {hasWeek2
            ? "Next week keeps your main lifts, swaps some accessories and adds a small progression."
            : "Next week repeats this week's schedule."}
        </div>
      )}
      <Alert msg={err} /><Alert msg={ok} type="success" />

      <div className="day-title"><h2>{dayTitle(items)}</h2>{items.length > 0 && <span>{mins + warmMins} MINS</span>}</div>

      {items.length === 0 ? (
        <div className="card center"><div className="big-emoji">😴</div><p className="muted">Rest day. Stretch, hydrate and sleep well.</p></div>
      ) : (
        <>
          <div className="sec-head">
            <div><h3>Warm Up</h3><div className="muted small-text">Targeted for {dayTitle(items)}</div></div>
            <div className="row"><span className="muted">{warmMins} MINS</span>
              <button className="sq-btn" onClick={() => setWarm(!warm)} aria-label="Toggle warm up">{warm ? "⌃" : "⌄"}</button></div>
          </div>
          {warm && warmList.map((w) => (
            <div className="ex-row" key={w.n}>
              <ExerciseImg name={w.n} group={w.tag} pose={w.pose} />
              <div><div className="ex-name">{w.n}</div><div className="ex-reps">{w.d}</div><div className="wu-tag">{w.tag} warm-up</div></div>
            </div>
          ))}

          <div className="sec-head">
            <h3>Workout</h3>
            <div className="row"><span className="muted">{mins} MINS</span>
              <button className="sq-btn" onClick={() => setWork(!work)} aria-label="Toggle workout">{work ? "⌃" : "⌄"}</button></div>
          </div>
          {work && items.map((i) => (
            <div className="ex-row" key={i.id}>
              <ExerciseImg name={i.exerciseName} group={i.muscleGroup} />
              <div>
                <div className="ex-name">{i.exerciseName}</div>
                <div className="ex-reps">{repsList(i, plan.goal).join(" • ")}</div>
                {i.note && <div className="ex-note">{i.note}</div>}
              </div>
            </div>
          ))}

          {weekOff === 0 && (
            <div className="cta-bar">
              {isToday
                ? <button className="cta-white" onClick={done} disabled={busy}><span>{busy ? "SAVING…" : "MARK TODAY'S WORKOUT DONE"}</span></button>
                : <button className="cta-white" onClick={swap} disabled={busy}><span>{busy ? "SWAPPING…" : "SWAP WITH TODAY"}</span></button>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
