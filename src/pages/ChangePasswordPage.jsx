import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../lib/api';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');
    setLoading(true);
    try {
      await changePassword(form);
      setSuccess(true);
    } catch (err) {
      const d = err.response?.data;
      if (d?.errors?.length) {
        const map = {};
        d.errors.forEach(e => { map[e.field] = e.message; });
        setErrors(map);
      }
      setGeneralError(d?.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-success">Password changed successfully!</div>
          <button className="auth-submit-btn" style={{ marginTop: 20 }} onClick={() => navigate('/app')}>
            Back to form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Form 8038-CP</div>
        <h2 className="auth-title">Change password</h2>

        {generalError && <div className="auth-error">{generalError}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label className="field-label">Current password</label>
            <input
              className={`form-input${errors.currentPassword ? ' input-error' : ''}`}
              type="password"
              value={form.currentPassword}
              onChange={set('currentPassword')}
              required
              autoFocus
            />
            {errors.currentPassword && <span className="field-error">{errors.currentPassword}</span>}
          </div>

          <div className="field">
            <label className="field-label">New password <span className="field-hint">(min 8 characters)</span></label>
            <input
              className={`form-input${errors.newPassword ? ' input-error' : ''}`}
              type="password"
              value={form.newPassword}
              onChange={set('newPassword')}
              required
              minLength={8}
            />
            {errors.newPassword && <span className="field-error">{errors.newPassword}</span>}
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Updating…' : 'Change password'}
          </button>
          <button type="button" className="step-btn step-btn--prev" style={{ marginTop: 10, width: '100%' }} onClick={() => navigate('/app')}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
