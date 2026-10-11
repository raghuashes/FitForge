import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

const Icon = ({ d }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const ITEMS = [
  ["/dashboard", "Home", "M3 11l9-8 9 8M5 10v10h14V10"],
  ["/fitness", "Fitness", "M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12"],
  ["/explore", "Explore", "M12 3a9 9 0 100 18 9 9 0 000-18zM15 9l-2 5-5 1 2-5z"],
  ["/diet", "Diet", "M3 12h18a9 9 0 01-18 0zM8 8c0-2 2-2 2-4M13 8c0-2 2-2 2-4"],
  ["/progress", "Progress", "M4 20V10M10 20V4M16 20v-8M22 20H2"],
];

export function BottomNav() {
  return (
    <nav className="bottomnav" aria-label="Main">
      <div className="in">
        {ITEMS.map(([to, label, d]) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "bn on" : "bn")}>
            <Icon d={d} /><span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default function TopBar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const initials = (user?.name || "U").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  return (
    <header className="topbar">
      <span className="brand">FitForge</span>
      <div className="row">
        <Link to="/workouts" className="btn small ghost">Log</Link>
        <Link to="/profile" className="avatar" title="Profile">{initials}</Link>
        <button className="btn small ghost" onClick={() => { logout(); nav("/login"); }}>Logout</button>
      </div>
    </header>
  );
}
