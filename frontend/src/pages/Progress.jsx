import { useEffect, useMemo, useState } from "react";
import api, { errMsg, today } from "../api.js";
import { Alert } from "../components/ui.jsx";
import { LineChart, BarChart, MacroRow, MacroChips, MC } from "../components/viz.jsx";

const r1 = (v) => Math.round(v * 10) / 10;
const sg = (v) => (v > 0 ? `+${v}` : `${v}`);
const lab = (d) => d.slice(5).replace("-", "/");

// Body-composition and goal maths (same rules as the interface preview).
function summarize(list, heightCm, goal, asian) {
  const h2 = (heightCm / 100) ** 2;
  const start = list[0].kg, now = list[list.length - 1].kg;
  const bs = start / h2, bn = now / h2;
  const nu = asian ? 23 : 25, ob = asian ? 27.5 : 30, hm = nu - 0.1;
  const cat = bn < 18.5 ? "Underweight" : bn < nu ? "Healthy weight" : bn < ob ? "Overweight" : "Obese";
  let dir, tg, pace;
  if (bn < 18.5) { dir = "GAIN"; tg = 20 * h2; pace = 0.35; }
  else if (bn >= nu) { dir = "LOSE"; tg = hm * h2; pace = 0.5; }
  else if (goal === "WEIGHT_LOSS" && bn > hm - 2) { dir = "LOSE"; tg = (hm - 2) * h2; pace = 0.5; }
  else if (goal === "MUSCLE_GAIN") { dir = "GAIN"; tg = start + 3; pace = 0.25; }
  else { dir = "MAINTAIN"; tg = now; pace = 0.5; }
  let go = 0, pc = 100;
  if (dir === "LOSE") { go = Math.max(0, now - tg); pc = start <= tg ? 100 : Math.floor(Math.max(0, Math.min(100, ((start - now) / (start - tg)) * 100))); }
  else if (dir === "GAIN") { go = Math.max(0, tg - now); pc = tg <= start ? 100 : Math.floor(Math.max(0, Math.min(100, ((now - start) / (tg - start)) * 100))); }
  const wk = Math.ceil(go / pace);
  let adv;
  if (dir === "MAINTAIN") adv = "Your BMI is in the healthy range. Keep your habits steady and log your body fat % for a clearer picture of fat versus muscle.";
  else if (go <= 0.05) adv = "Target reached. Great work! Set a new goal or hold this weight while you build strength.";
  else if (dir === "LOSE") adv = `Aim to lose about ${go.toFixed(1)} kg (to around ${tg.toFixed(1)} kg). A safe pace is 0.25-0.75 kg per week, so roughly ${wk} weeks. Keep lifting to protect your muscle.`;
  else if (bn < 18.5) adv = `Aim to gain about ${go.toFixed(1)} kg to reach a healthy BMI. Eat in a small surplus with enough protein and strength train, gaining about 0.25-0.5 kg per week.`;
  else adv = `A realistic lean-gain block is about 3 kg at roughly 0.25 kg per week. About ${go.toFixed(1)} kg to go (around ${wk} weeks). Eat a small surplus and keep progressing your lifts.`;
  const bfs = list.filter((x) => x.bodyFat != null);
  let comp = null;
  if (bfs.length) {
    const f = bfs[0], l = bfs[bfs.length - 1];
    const fs = (f.kg * f.bodyFat) / 100, fn = (l.kg * l.bodyFat) / 100;
    comp = { src: "MEASURED", bfS: f.bodyFat, bfN: l.bodyFat, fs: r1(fs), fn: r1(fn), ls: r1(f.kg - fs), ln: r1(l.kg - fn), fc: r1(fn - fs), lc: r1(l.kg - fn - (f.kg - fs)) };
  } else if (list.length >= 2 && Math.abs(now - start) >= 0.1) {
    const d = now - start, sh = d < 0 ? 0.8 : goal === "MUSCLE_GAIN" ? 0.5 : 0.75;
    comp = { src: "ESTIMATED", fc: r1(d * sh), lc: r1(d * (1 - sh)) };
  }
  return { start: r1(start), now: r1(now), chg: r1(now - start), bs: r1(bs), bn: r1(bn), cat, hmin: r1(18.5 * h2), hmax: r1(hm * h2), dir, tg: r1(tg), go: r1(go), wk, pc, adv, comp };
}

export default function Progress() {
  const [list, setList] = useState(null);
  const [profile, setProfile] = useState(null);
  const [days, setDays] = useState([]);
  const [dash, setDash] = useState(null);
  const [asian, setAsian] = useState(false);
  const [date, setDate] = useState(today());
  const [kg, setKg] = useState("");
  const [bf, setBf] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => api.get("/weights").then((r) => setList(r.data)).catch((e) => { setErr(errMsg(e)); setList([]); });
  useEffect(() => {
    load();
    api.get("/profile").then((r) => setProfile(r.data)).catch(() => {});
    api.get("/dashboard", { params: { today: today() } }).then((r) => setDash(r.data)).catch(() => {});
    const dates = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); dates.push(d.toISOString().slice(0, 10)); }
    Promise.all(dates.map((d) => api.get("/meals/summary", { params: { date: d } }).then((r) => r.data)))
      .then(setDays).catch(() => {});
  }, []);

  const add = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      await api.post("/weights", { date, kg: Number(kg), bodyFat: bf === "" ? null : Number(bf) });
      setKg(""); setBf("");
      load();
    } catch (ex) { setErr(errMsg(ex)); }
    setBusy(false);
  };
  const remove = async (id) => { try { await api.delete(`/weights/${id}`); load(); } catch (e) { setErr(errMsg(e)); } };

  const m = useMemo(() => (list && list.length && profile?.heightCm ? summarize(list, profile.heightCm, profile.goal, asian) : null), [list, profile, asian]);
  if (list === null) return <p className="muted">Loading…</p>;

  const cut = asian ? [18.5, 23, 27.5] : [18.5, 25, 30], MIN = 15, MAX = 40, sp = MAX - MIN;
  const cols = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];
  const ws = [cut[0] - MIN, cut[1] - cut[0], cut[2] - cut[1], MAX - cut[2]];
  const wA = list.map((x) => ({ x: lab(x.date), y: x.kg }));
  const bA = list.filter((x) => x.bodyFat != null).map((x) => ({ x: lab(x.date), y: x.bodyFat }));
  const lastBf = bA.length ? bA[bA.length - 1].y : null;
  const nd = days.map((d, i) => ({ l: i === days.length - 1 ? "Today" : new Date(d.date + "T00:00").toLocaleDateString(undefined, { weekday: "short" }), v: d.calories, hi: i === days.length - 1 }));
  const avg = (k) => (days.length ? Math.round(days.reduce((a, d) => a + d[k], 0) / days.length) : 0);
  const tgt = days[0];

  return (
    <div>
      <h1 className="ptitle">Progress</h1>
      <Alert msg={err} />

      {list.length === 0 ? (
        <div className="card"><p className="muted">Log your first weigh-in below to unlock BMI, goal tracking and fat / muscle change.</p></div>
      ) : (
        <>
          <div className="kpis">
            <div className="kpi"><span className="muted small-text">Current weight</span><strong>{r1(list[list.length - 1].kg)}<small> kg</small></strong></div>
            <div className="kpi"><span className="muted small-text">Change</span><strong className={list.length > 1 && m && m.chg > 0 ? "bd2" : "gd"}>{m ? sg(m.chg) : "–"}<small> kg</small></strong></div>
            <div className="kpi"><span className="muted small-text">BMI</span><strong>{m ? m.bn : "–"}</strong><span className="small-text muted">{m ? m.cat : "Set height in profile"}</span></div>
            <div className="kpi"><span className="muted small-text">Body fat</span><strong>{lastBf != null ? lastBf : "–"}{lastBf != null && <small> %</small>}</strong></div>
          </div>

          <div className="card">
            <h3>Weight trend</h3>
            <div className="muted small-text" style={{ margin: "-6px 0 6px" }}>{list.length} entries · kg</div>
            <LineChart data={wA} color="#ff6a3d" unit="kg" goal={m && m.dir !== "MAINTAIN" ? m.tg : null} />
          </div>

          {bA.length > 1 && <div className="card"><h3>Body fat trend</h3><div className="muted small-text" style={{ margin: "-6px 0 6px" }}>Percent</div><LineChart data={bA} color="#22c55e" unit="%" /></div>}

          {m && (
            <>
              <div className="card">
                <h3>{m.dir === "LOSE" ? "Fat loss goal" : m.dir === "GAIN" ? "Weight and muscle gain goal" : "Maintain"}</h3>
                {m.dir !== "MAINTAIN" && (
                  <>
                    <div className="row" style={{ alignItems: "baseline", gap: 10, marginBottom: 10 }}><span className="big">{m.go} kg</span><span className="muted">{m.dir === "LOSE" ? "to lose" : "to gain"} · target {m.tg} kg{m.wk > 0 ? ` · about ${m.wk} weeks` : ""}</span></div>
                    <div className="bar-wrap"><div className="bar-fill" style={{ width: `${m.pc}%` }} /></div>
                    <div className="muted small-text" style={{ marginTop: 4 }}>{m.pc}% of the way there</div>
                  </>
                )}
                <p className="adv">{m.adv}</p>
              </div>

              <div className="card">
                <div className="row-between"><h3 style={{ margin: 0 }}>Fat and muscle change</h3>
                  {m.comp && <span className={`mx ${m.comp.src === "MEASURED" ? "p" : "c"}`}>{m.comp.src === "MEASURED" ? "Measured" : "Estimated"}</span>}</div>
                {!m.comp ? <p className="muted">Log at least two weigh-ins, ideally with body fat %, to see how much fat you lost and muscle you gained.</p> : (
                  <>
                    <div className="dg">
                      <div className={`dl ${m.comp.fc <= 0 ? "good" : "bad"}`}><span className="muted small-text">Body fat</span><strong>{sg(m.comp.fc)} kg</strong><span className="small-text">{m.comp.fc < 0 ? "fat lost" : m.comp.fc > 0 ? "fat gained" : "no change"}</span></div>
                      <div className={`dl ${m.comp.lc >= 0 ? "good" : "bad"}`}><span className="muted small-text">Muscle (lean mass)</span><strong>{sg(m.comp.lc)} kg</strong><span className="small-text">{m.comp.lc > 0 ? "muscle gained" : m.comp.lc < 0 ? "lean mass lost" : "no change"}</span></div>
                    </div>
                    <p className="muted small-text">{m.comp.src === "MEASURED"
                      ? `Body fat ${m.comp.bfS}% → ${m.comp.bfN}% · Fat mass ${m.comp.fs} → ${m.comp.fn} kg · Lean mass ${m.comp.ls} → ${m.comp.ln} kg. Lean mass includes muscle, organs, bone and water.`
                      : "Rule-of-thumb split of your weight change (about 80% fat when losing weight, and about half muscle when gaining on a lifting program). Add your body fat % below for real numbers."}</p>
                  </>
                )}
              </div>
            </>
          )}

          {days.length > 0 && (
            <div className="card">
              <div className="row-between"><h3 style={{ margin: 0 }}>Nutrition, last 7 days</h3><span className="muted small-text">kcal per day</span></div>
              <BarChart data={nd} color="#ff6a3d" target={tgt?.calorieTarget} unit="kcal" />
              <div className="muted small-text" style={{ margin: "4px 0 12px" }}>Dashed line is your {tgt?.calorieTarget} kcal target.</div>
              <div className="muted small-text">Daily average</div>
              <MacroChips kcal={avg("calories")} p={avg("protein")} c={avg("carbs")} f={avg("fat")} />
              <div style={{ marginTop: 10 }}>
                <MacroRow name="Protein (avg)" value={avg("protein")} target={tgt.proteinTarget} color={MC.p} />
                <MacroRow name="Carbs (avg)" value={avg("carbs")} target={tgt.carbTarget} color={MC.c} />
                <MacroRow name="Fat (avg)" value={avg("fat")} target={tgt.fatTarget} color={MC.f} />
              </div>
            </div>
          )}

          {dash && (
            <div className="card">
              <h3>Training consistency</h3>
              <div className="sumr" style={{ marginTop: 4, borderTop: 0, paddingTop: 0 }}>
                <div><span className="muted small-text">Last 7 days</span><b>{dash.workouts7} sessions</b></div>
                <div><span className="muted small-text">Last 30 days</span><b>{dash.workouts30} sessions</b></div>
                <div><span className="muted small-text">Streak</span><b>{dash.streak} days</b></div>
              </div>
            </div>
          )}

          {m && (
            <div className="card">
              <div className="row-between"><h3 style={{ margin: 0 }}>BMI check</h3>
                <div className="seg2"><button className={!asian ? "on" : ""} onClick={() => setAsian(false)}>WHO</button><button className={asian ? "on" : ""} onClick={() => setAsian(true)}>Asian</button></div></div>
              <div className="row" style={{ alignItems: "baseline", gap: 10, margin: "10px 0" }}><span className="big">{m.bn}</span><span className="muted">BMI · {m.cat}</span></div>
              <div className="bmib">{ws.map((x, i) => <span key={i} style={{ width: `${(x / sp) * 100}%`, background: cols[i] }} />)}<i className="bmim" style={{ left: `${Math.max(0, Math.min(100, ((m.bn - MIN) / sp) * 100))}%` }} /></div>
              <div className="bmis"><span>15</span><span>{cut[0]}</span><span>{cut[1]}</span><span>{cut[2]}</span><span>40</span></div>
              <p className="muted small-text">Healthy weight for {profile.heightCm} cm: {m.hmin}–{m.hmax} kg. You are {m.now} kg{list.length > 1 ? ` (${sg(m.chg)} kg since ${m.start} kg, BMI ${m.bs} → ${m.bn})` : ""}.</p>
              <p className="muted small-text">BMI cannot tell fat from muscle, so it can overestimate in muscular people and underestimate in people with low muscle. Use it as a guide, not a diagnosis.</p>
            </div>
          )}
        </>
      )}

      <form className="card" onSubmit={add}>
        <h3>Log a weigh-in</h3>
        <div className="fg4">
          <label>Date<input type="date" required value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <label>Weight (kg)<input type="number" required step="0.1" min="20" placeholder="e.g. 78.0" value={kg} onChange={(e) => setKg(e.target.value)} /></label>
          <label>Body fat % (optional)<input type="number" step="0.1" min="3" max="60" placeholder="Smart scale or caliper" value={bf} onChange={(e) => setBf(e.target.value)} /></label>
        </div>
        <button className="btn" disabled={busy}>{busy ? "Saving..." : "Add entry"}</button>
      </form>

      {list.length > 0 && (
        <div className="card">
          <h3>Recent entries</h3>
          {[...list].reverse().slice(0, 10).map((w) => (
            <div className="mealr" key={w.id}>
              <div style={{ flex: 1 }}><b>{w.kg} kg</b>{w.bodyFat != null && <span className="muted"> · {w.bodyFat}% body fat</span>}<div className="muted small-text">{w.date}</div></div>
              <button className="ib2" onClick={() => remove(w.id)} aria-label="Delete entry" title="Delete">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
