import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { useAuth } from "../auth";
const DEMO = import.meta.env.VITE_DEMO === "1";

export function Login() {
  const { user, login, loading } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from || "/";

  if (loading) return null;
  if (user) return <Navigate to={from} replace />;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await login(String(f.get("email")), String(f.get("password")));
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <img src="/favicon.svg" alt="" width={52} height={52} />
        <h1>Digital Dome dashboard</h1>
        <p className="muted">Sign in to manage the website.</p>
        {DEMO && <div className="preview-note">Preview: any email and password will sign you in.</div>}
        <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="username" required autoFocus defaultValue={DEMO ? "preview@somdigitaldome.com" : undefined} /></div>
        <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required defaultValue={DEMO ? "preview-password" : undefined} /></div>
        {error && <div className="error-box" role="alert">{error}</div>}
        <button className="btn btn--primary btn--block" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}
