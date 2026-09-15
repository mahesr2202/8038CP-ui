import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { login } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveAuth } = useAuth();
  const successMsg = location.state?.message;

  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');
    setLoading(true);
    try {
      const { data } = await login(form);
      if (data.token) {
        saveAuth(data.token, data.user);
        navigate('/app');
      } else {
        navigate('/verify-email', { state: { challengeId: data.challengeId, maskedEmail: data.maskedEmail, expiresAt: data.expiresAt } });
      }
    } catch (err) {
      const d = err.response?.data;
      if (d?.errors?.length) {
        const map = {};
        d.errors.forEach(e => { map[e.field] = e.message; });
        setErrors(map);
      }
      setGeneralError(d?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Form 8038-CP</div>
        <h2 className="auth-title">Sign in to your account</h2>

        {successMsg && <div className="auth-success">{successMsg}</div>}
        {generalError && <div className="auth-error">{generalError}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label className="field-label">Email address</label>
            <input className={`form-input${errors.email ? ' input-error' : ''}`} type="email" value={form.email} onChange={set('email')} required autoFocus />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="field">
            <label className="field-label">Password</label>
            <input className={`form-input${errors.password ? ' input-error' : ''}`} type="password" value={form.password} onChange={set('password')} required />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="auth-row">
            <label className="styled-checkbox-row">
              <input type="checkbox" checked={form.rememberMe} onChange={set('rememberMe')} />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  );
}
