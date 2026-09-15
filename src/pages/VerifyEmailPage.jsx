import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verifyEmail, resendEmailOtp } from '../lib/api';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;

  const [challengeId, setChallengeId] = useState(state?.challengeId || '');
  const [maskedEmail] = useState(state?.maskedEmail || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  if (!state?.challengeId) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-error">No verification session found.</div>
          <p className="auth-footer"><Link to="/login" className="auth-link">Back to sign in</Link></p>
        </div>
      </div>
    );
  }

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyEmail({ challengeId, code });
      navigate('/login', { state: { message: 'Email verified! You can now sign in.' } });
    } catch (err) {
      const d = err.response?.data;
      setError(d?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResendMsg('');
    setResending(true);
    try {
      const { data } = await resendEmailOtp({ challengeId });
      setChallengeId(data.challengeId);
      setCode('');
      setResendMsg('A new code has been sent to your email.');
    } catch (err) {
      const d = err.response?.data;
      setError(d?.message || 'Could not resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Form 8038-CP</div>
        <h2 className="auth-title">Verify your email</h2>
        <p className="auth-subtitle">
          Enter the 6-digit code sent to <strong>{maskedEmail || 'your email'}</strong>.
        </p>

        {error && <div className="auth-error">{error}</div>}
        {resendMsg && <div className="auth-success">{resendMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label className="field-label">Verification code</label>
            <input
              className="form-input otp-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              value={code}
              onChange={e => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              maxLength={6}
              placeholder="000000"
              required
              autoFocus
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading || code.length < 6}>
            {loading ? 'Verifying…' : 'Verify email'}
          </button>
        </form>

        <p className="auth-footer">
          Didn't receive a code?{' '}
          <button className="auth-link-btn" onClick={handleResend} disabled={resending}>
            {resending ? 'Sending…' : 'Resend code'}
          </button>
        </p>
        <p className="auth-footer">
          <Link to="/login" className="auth-link">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
