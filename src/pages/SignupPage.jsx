import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../lib/api';

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '', termsAccepted: false });
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
      const { data } = await signup({ ...form, channel: 'WEB' });
      navigate('/verify-email', { state: { challengeId: data.challengeId, maskedEmail: data.maskedEmail, expiresAt: data.expiresAt } });
    } catch (err) {
      const d = err.response?.data;
      if (d?.errors?.length) {
        const map = {};
        d.errors.forEach(e => { map[e.field] = e.message; });
        setErrors(map);
      }
      setGeneralError(d?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Form 8038-CP</div>
        <h2 className="auth-title">Create an account</h2>

        {generalError && <div className="auth-error">{generalError}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label className="field-label">Full name</label>
            <input className={`form-input${errors.fullName ? ' input-error' : ''}`} type="text" value={form.fullName} onChange={set('fullName')} maxLength={100} />
            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
          </div>

          <div className="field">
            <label className="field-label">Email address</label>
            <input className={`form-input${errors.email ? ' input-error' : ''}`} type="email" value={form.email} onChange={set('email')} required autoFocus />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="field">
            <label className="field-label">Password <span className="field-hint">(min 8 characters)</span></label>
            <input className={`form-input${errors.password ? ' input-error' : ''}`} type="password" value={form.password} onChange={set('password')} required minLength={8} />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="field">
            <label className="field-label">Phone <span className="field-hint">(optional)</span></label>
            <input className={`form-input${errors.phone ? ' input-error' : ''}`} type="text" value={form.phone} onChange={set('phone')} placeholder="(XXX) XXX-XXXX" />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>

          <div className="field">
            <label className="styled-checkbox-row">
              <input type="checkbox" checked={form.termsAccepted} onChange={set('termsAccepted')} required />
              <span>I accept the Terms of Service and Privacy Policy</span>
            </label>
            {errors.termsAccepted && <span className="field-error">{errors.termsAccepted}</span>}
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
