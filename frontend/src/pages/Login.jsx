import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errMsg } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { Alert } from "../components/ui.jsx";
import { quoteOfDay } from "../components/Art.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const r = await api.post("/auth/login", { email, password });
      login(r.data);
      nav("/dashboard");
    } catch (ex) {
      setErr(errMsg(ex));
    }
    setBusy(false);
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <h1>🔥 FitForge</h1>
        <p className="muted">Sign in to your workout & diet planner</p>
        <p className="quote">“{quoteOfDay()}”</p>
        <Alert msg={err} />
        <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button className="btn" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
        <p className="muted center">New here? <Link to="/register">Create an account</Link></p>
        <p className="muted center small-text">Demo (local only): demo@fitforge.com / Demo@1234</p>
      </form>
    </div>
  );
}
