import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email });
    } catch {
      // anti-enumeration — always show success
    } finally {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Form 8038-CP</div>
        <h2 className="auth-title">Reset your password</h2>

        {sent ? (
          <>
            <div className="auth-success">
              If an account exists for that email, we've sent a reset link. Check your inbox.
            </div>
            <p className="auth-footer">
              <Link to="/login" className="auth-link">Back to sign in</Link>
            </p>
          </>
        ) : (
          <>
            <p className="auth-subtitle">Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="field">
                <label className="field-label">Email address</label>
                <input
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
            <p className="auth-footer">
              <Link to="/login" className="auth-link">Back to sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
