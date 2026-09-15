import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../lib/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-error">Invalid or missing reset token.</div>
          <p className="auth-footer">
            <Link to="/forgot-password" className="auth-link">Request a new reset link</Link>
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setFieldError('');
    setLoading(true);
    try {
      await resetPassword({ token, newPassword });
      navigate('/login', { state: { message: 'Password updated. You can now sign in.' } });
    } catch (err) {
      const d = err.response?.data;
      const fe = d?.errors?.find(e => e.field === 'token' || e.field === 'newPassword');
      if (fe) setFieldError(fe.message);
      setError(d?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Form 8038-CP</div>
        <h2 className="auth-title">Set a new password</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label className="field-label">New password <span className="field-hint">(min 8 characters)</span></label>
            <input
              className={`form-input${fieldError ? ' input-error' : ''}`}
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoFocus
            />
            {fieldError && <span className="field-error">{fieldError}</span>}
          </div>
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login" className="auth-link">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
