import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import Field from '../components/Field.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const err = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) err.email = 'Enter a valid email address';
    if (!form.password) err.password = 'Enter your password';
    setErrors(err); setFormError('');
    if (Object.keys(err).length) return;
    setBusy(true);
    try {
      await login(form.email.trim(), form.password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (ex) {
      setFormError(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to open the urban heat dashboard."
      footer={<>New here? <Link to="/signup" className="font-bold text-teal-600 dark:text-teal-400">Create an account</Link></>}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
        <Field label="Password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={set('password')} error={errors.password} />
        {formError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{formError}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </AuthShell>
  );
}
