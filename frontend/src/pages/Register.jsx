import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errMsg } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { Alert } from "../components/ui.jsx";

export default function Register() {
  const [name, setName] = useState("");
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
      const r = await api.post("/auth/register", { name, email, password });
      login(r.data);
      nav("/profile");
    } catch (ex) {
      setErr(errMsg(ex));
    }
    setBusy(false);
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <h1>Create account</h1>
        <p className="muted">Start planning your workouts and meals</p>
        <Alert msg={err} />
        <label>Name<input required value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Password (min 6 characters)<input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button className="btn" disabled={busy}>{busy ? "Creating..." : "Register"}</button>
        <p className="muted center">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
