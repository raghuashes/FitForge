import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar as RBar, ReferenceLine } from "recharts";
import api, { errMsg, today } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { Alert, Bar } from "../components/ui.jsx";
import Stories from "../components/Stories.jsx";
import { RecipeRow } from "../components/Recipes.jsx";
import { weekdayName, dayTitle, dayMinutes, dietKind } from "../plan.js";

export default function Dashboard() {
  const { user } = useAuth();
  const [d, setD] = useState(null);
  const [plan, setPlan] = useState(null);
  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get("/dashboard", { params: { today: today() } }).then((r) => setD(r.data)).catch((e) => setErr(errMsg(e)));
    api.get("/plans").then((r) => setPlan(r.data[0] || null)).catch(() => {});
    api.get("/profile").then((r) => {
      setProfile(r.data);
      api.get("/diet/recipes", { params: { goal: dietKind(r.data.goal) } }).then((x) => setRecipes(x.data)).catch(() => {});
    }).catch(() => {});
  }, []);

  if (err) return <Alert msg={err} />;
  if (!d) return <p className="muted">Loading…</p>;

  const todayItems = plan ? plan.items.filter((i) => (i.weekNo || 1) === 1 && i.dayOfWeek === weekdayName(new Date())) : [];
  const weight = d.weightTrend.map((w) => ({ date: w.date.slice(5), kg: w.kg }));
  const cals = d.caloriesLast7.map((c) => ({ date: c.date.slice(5), calories: c.calories }));
  const target = profile?.daysPerWeek || 4;

  return (
    <div>
      <div className="greet">
        <div className="muted small-text">{new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</div>
        <h1 className="ptitle">Hey {user?.name?.split(" ")[0]} 👋</h1>
      </div>

      <Stories />

      <Link to="/fitness" className="card today-card">
        <div>
          <div className="muted small-text">Today's workout</div>
          <h3>{plan ? dayTitle(todayItems) : "No plan yet"}</h3>
          <div className="muted small-text">
            {plan ? (todayItems.length ? `${todayItems.length} exercises · ${dayMinutes(todayItems) + 10} mins` : "Recover well today") : "Build a smart plan for your goal"}
          </div>
        </div>
        <span className="go">›</span>
      </Link>

      <h3 className="sec-title">Eat for your goal</h3>
      <div className="rcarousel">
        <Link to="/diet" className="promo p1"><span className="big">🥗</span><strong>Healthy recipes</strong><span className="small-text">Calories and micronutrients for your target</span></Link>
        <Link to="/diet" className="promo p2"><span className="big">🔥</span><strong>Your diet plan</strong><span className="small-text">Meals, macros and vitamins</span></Link>
      </div>
      {recipes.slice(0, 4).map((r) => <RecipeRow key={r.name} r={r} />)}

      <div className="stats">
        <div className="card stat"><span className="muted">Workouts (7 days)</span><strong>{d.workouts7}</strong><span className="muted small-text">{d.workouts30} in last 30 days</span></div>
        <div className="card stat"><span className="muted">Current streak</span><strong>{d.streak} 🔥</strong><span className="muted small-text">consecutive days</span></div>
        <div className="card stat"><span className="muted">Calories today</span><strong>{d.todayCalories} <small>/ {d.calorieTarget}</small></strong><Bar value={d.todayCalories} max={d.calorieTarget} /></div>
        <div className="card stat"><span className="muted">Protein today</span><strong>{Math.round(d.todayProtein)} g <small>/ {d.proteinTarget} g</small></strong><Bar value={d.todayProtein} max={d.proteinTarget} /></div>
      </div>

      <div className="card">
        <h3>Body weight (kg)</h3>
        {weight.length === 0 ? <p className="muted">No entries yet. <Link to="/progress">Add your weight</Link></p> : (
          <div className="chart"><ResponsiveContainer width="100%" height="100%">
            <LineChart data={weight}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" fontSize={12} /><YAxis domain={["auto", "auto"]} fontSize={12} width={40} /><Tooltip />
              <Line type="monotone" dataKey="kg" stroke="#ff6a3d" strokeWidth={2} dot={false} /></LineChart>
          </ResponsiveContainer></div>
        )}
      </div>
      <div className="card">
        <h3>Calories – last 7 days</h3>
        <div className="chart"><ResponsiveContainer width="100%" height="100%">
          <BarChart data={cals}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" fontSize={12} /><YAxis fontSize={12} width={40} /><Tooltip />
            <ReferenceLine y={d.calorieTarget} stroke="#22c55e" strokeDasharray="4 4" /><RBar dataKey="calories" fill="#ff6a3d" radius={[4, 4, 0, 0]} /></BarChart>
        </ResponsiveContainer></div>
      </div>

      <div className="weekbar">
        <span className="bolt">⚡</span>
        <div><strong>{d.workouts7}/{target}</strong><div className="muted small-text">This Week Activity</div></div>
        <Link to="/fitness" className="weekbtn">WORKOUT</Link>
      </div>
    </div>
  );
}
