import { useState } from "react";
import { Navigate } from "react-router";
import { api } from "../api";
import { useAuth } from "../auth";
import { useLoad } from "../hooks";
import { ErrorBox, Loading, Modal, PageHeader, fmtDate, useToast } from "../components/ui";

interface Account { _id: string; name: string; email: string; role: "admin" | "editor"; lastLoginAt?: string }

export function Users() {
  const { user } = useAuth();
  const { data, error, reload } = useLoad<Account[]>(user?.role === "admin" ? "/users" : null);
  const [adding, setAdding] = useState(false);
  const toast = useToast();
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  const remove = async (a: Account) => {
    if (!confirm(`Remove ${a.name}’s access to the dashboard?`)) return;
    try { await api.del(`/users/${a._id}`); toast("User removed"); reload(); } catch (e) { toast((e as Error).message, "err"); }
  };
  if (error) return <ErrorBox text={error} retry={reload} />;
  if (!data) return <Loading />;
  return (
    <>
      <PageHeader title="Users" subtitle="Administrators can manage users. Editors can change all website content." actions={<button className="btn btn--primary" onClick={() => setAdding(true)}>+ Add user</button>} />
      <div className="panel">
        <table className="table">
          <thead><tr><th>Name</th><th>Role</th><th>Last sign-in</th><th /></tr></thead>
          <tbody>{data.map((a) => (
            <tr key={a._id}>
              <td><strong>{a.name}</strong><br /><small className="muted">{a.email}</small></td>
              <td><span className="pill">{a.role === "admin" ? "Administrator" : "Editor"}</span></td>
              <td>{a.lastLoginAt ? fmtDate(a.lastLoginAt) : <span className="muted">Never</span>}</td>
              <td className="row-actions">{a._id !== user.id && <button className="btn btn--sm btn--ghost" onClick={() => remove(a)}>Remove</button>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {adding && <AddUser onClose={() => setAdding(false)} onDone={() => { setAdding(false); reload(); }} />}
    </>
  );
}

function AddUser({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [error, setError] = useState("");
  const toast = useToast();
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try { await api.post("/users", f); toast("User added. Share the password with them securely."); onDone(); } catch (err) { setError((err as Error).message); }
  };
  return (
    <Modal title="Add user" onClose={onClose}>
      <form className="stack" onSubmit={submit}>
        <div className="field"><label htmlFor="u-name">Name</label><input id="u-name" name="name" required autoFocus /></div>
        <div className="field"><label htmlFor="u-email">Email</label><input id="u-email" name="email" type="email" required /></div>
        <div className="field"><label htmlFor="u-role">Role</label><select id="u-role" name="role" defaultValue="editor"><option value="editor">Editor</option><option value="admin">Administrator</option></select></div>
        <div className="field"><label htmlFor="u-pass">Temporary password</label><input id="u-pass" name="password" type="password" minLength={10} required autoComplete="new-password" />
          <small className="help">At least 10 characters. They can change it under Account after signing in.</small></div>
        {error && <div className="error-box">{error}</div>}
        <div className="actions"><button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button><button className="btn btn--primary" type="submit">Add user</button></div>
      </form>
    </Modal>
  );
}

export function Account() {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const toast = useToast();
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (f.next !== f.confirm) return setError("The new passwords don’t match.");
    try { await api.put("/auth/password", { current: f.current, next: f.next }); setError(""); form.reset(); toast("Password changed"); }
    catch (err) { setError((err as Error).message); }
  };
  return (
    <>
      <PageHeader title="Your account" subtitle={`${user?.name} · ${user?.email}`} />
      <form className="panel stack narrow" onSubmit={submit}>
        <h2>Change password</h2>
        <div className="field"><label htmlFor="a-cur">Current password</label><input id="a-cur" name="current" type="password" required autoComplete="current-password" /></div>
        <div className="field"><label htmlFor="a-new">New password</label><input id="a-new" name="next" type="password" minLength={10} required autoComplete="new-password" /></div>
        <div className="field"><label htmlFor="a-con">Repeat new password</label><input id="a-con" name="confirm" type="password" minLength={10} required autoComplete="new-password" /></div>
        {error && <div className="error-box">{error}</div>}
        <div><button className="btn btn--primary" type="submit">Change password</button></div>
      </form>
    </>
  );
}
