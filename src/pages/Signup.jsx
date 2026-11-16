import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import Field from '../components/Field.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', organization: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const err = {};
    if (!form.name.trim()) err.name = 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) err.email = 'Enter a valid email address';
    if (form.password.length < 8) err.password = 'Use at least 8 characters';
    if (form.confirm !== form.password) err.confirm = 'Passwords do not match';
    setErrors(err); setFormError('');
    if (Object.keys(err).length) return;
    setBusy(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), organization: form.organization.trim() || undefined, password: form.password });
      navigate('/', { replace: true });
    } catch (ex) {
      setFormError(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Get access to the urban heat dashboard."
      footer={<>Already have an account? <Link to="/login" className="font-bold text-teal-600 dark:text-teal-400">Sign in</Link></>}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Full name" name="name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
        <Field label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
        <Field label="Organization (optional)" name="organization" autoComplete="organization" value={form.organization} onChange={set('organization')} />
        <Field label="Password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} hint="At least 8 characters" />
        <Field label="Confirm password" name="confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        {formError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{formError}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
    </AuthShell>
  );
}
