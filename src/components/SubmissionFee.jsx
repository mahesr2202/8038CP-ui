import { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { createPaymentIntent, submitForm, previewXml, downloadFormPdf, downloadScheduleAPdf } from '../lib/api';

const SUBMISSION_FEE = 50;

const CARD_STYLE = {
  style: {
    base: {
      fontSize: '15px',
      color: '#1E293B',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#94A3B8' },
    },
    invalid: { color: '#EF4444', iconColor: '#EF4444' },
  },
};

export default function SubmissionFee({ draftId, isActive, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const [generatedXml, setGeneratedXml] = useState(null);
  const [showXml, setShowXml] = useState(true);
  const [xmlLoading, setXmlLoading] = useState(false);
  const [xmlError, setXmlError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [scheduleALoading, setScheduleALoading] = useState(false);

  useEffect(() => {
    if (!draftId || !isActive) return;
    setXmlLoading(true);
    setXmlError(null);
    previewXml(draftId)
      .then(res => setGeneratedXml(res.data))
      .catch(err => {
        let msg;
        try {
          const data = typeof err?.response?.data === 'string'
            ? JSON.parse(err.response.data)
            : err?.response?.data;
          msg = data?.message;
        } catch { /* not JSON */ }
        setXmlError(msg || err?.message || 'Could not generate XML preview.');
      })
      .finally(() => setXmlLoading(false));
  }, [draftId, isActive]);

  const downloadXml = () => {
    const blob = new Blob([generatedXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Form8038CP_${draftId}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const res = await downloadFormPdf(draftId);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Form8038CP_${draftId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download Form 8038-CP PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadScheduleAPdf = async () => {
    setScheduleALoading(true);
    try {
      const res = await downloadScheduleAPdf(draftId);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `ScheduleA_8038CP_${draftId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('No Schedule A data found for this submission.');
    } finally {
      setScheduleALoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!stripe || !elements || !draftId) return;
    setProcessing(true);
    setError(null);

    try {
      const { data: intentData } = await createPaymentIntent();
      if (intentData.error) { setError(intentData.error); return; }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        intentData.clientSecret,
        { payment_method: { card: elements.getElement(CardElement), billing_details: { name } } }
      );

      if (stripeError) { setError(stripeError.message); return; }

      if (paymentIntent?.status === 'succeeded') {
        const { data } = await submitForm(draftId, { stripePaymentIntentId: paymentIntent.id });
        setGeneratedXml(data?.generatedXml || null);
        setSucceeded(true);
        onSuccess?.();
      }
    } catch (err) {
      const data = err.response?.data;
      const fieldErrors = data?.errors?.length
        ? data.errors.map(e => e.message).join('\n')
        : null;
      setError(fieldErrors || data?.message || 'An error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (succeeded) {
    return (
      <div className="section-card fee-success-card">
        <div className="fee-success">
          <div className="fee-success-icon">✓</div>
          <h3 className="fee-success-title">Payment Successful</h3>
          <p className="fee-success-msg">
            Your ${SUBMISSION_FEE}.00 submission fee has been processed and your Form 8038-CP has been submitted.
          </p>
          <div className="fee-success-actions">
            <button className="step-btn step-btn--print fee-print-btn" onClick={handleDownloadPdf} disabled={pdfLoading}>
              {pdfLoading ? 'Generating…' : 'Download Form 8038-CP PDF'}
            </button>
            <button className="step-btn step-btn--print fee-print-btn" onClick={handleDownloadScheduleAPdf} disabled={scheduleALoading}>
              {scheduleALoading ? 'Generating…' : 'Download Schedule A PDF'}
            </button>
            {generatedXml && (
              <button className="step-btn step-btn--next fee-xml-btn" onClick={downloadXml}>
                Download IRS XML
              </button>
            )}
          </div>
          {generatedXml && (
            <div className="xml-preview-section">
              <button
                className="xml-toggle-btn"
                onClick={() => setShowXml(v => !v)}
              >
                {showXml ? 'Hide XML' : 'Preview IRS e-file XML'}
              </button>
              {showXml && (
                <pre className="xml-preview">{generatedXml}</pre>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* XML Preview section — shown before payment */}
      <div className="section-card" style={{ marginBottom: 20 }}>
        <div className="section-header">
          <span className="section-header-title">IRS e-file XML Preview</span>
          <span className="section-header-subtitle">Review before submitting</span>
        </div>
        <div style={{ padding: '0 24px 20px' }}>
          {xmlLoading && (
            <p style={{ color: '#64748B', fontSize: 14 }}>Generating XML preview…</p>
          )}
          {xmlError && (
            <p style={{ color: '#DC2626', fontSize: 14 }}>{xmlError}</p>
          )}
          {generatedXml && !xmlLoading && (
            <>
              <div className="fee-success-actions" style={{ justifyContent: 'flex-start', marginBottom: 12 }}>
                <button className="xml-toggle-btn" onClick={() => setShowXml(v => !v)}>
                  {showXml ? 'Hide XML' : 'Show XML'}
                </button>
                <button className="fee-xml-btn" style={{ marginTop: 0 }} onClick={downloadXml}>
                  Download XML
                </button>
              </div>
              {showXml && <pre className="xml-preview">{generatedXml}</pre>}
            </>
          )}
        </div>
      </div>

    <div className="section-card">
      <div className="section-header">
        <span className="section-header-title">Submission Fee</span>
        <span className="section-header-subtitle">Secured by Stripe</span>
      </div>

      <div className="fee-summary">
        <div className="fee-line">
          <span>Form 8038-CP Processing Fee</span>
          <span>${SUBMISSION_FEE}.00</span>
        </div>
        <div className="fee-divider" />
        <div className="fee-line fee-total">
          <span>Total Due</span>
          <span>${SUBMISSION_FEE}.00</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="fee-form">
        <div className="field-group">
          <div className="field">
            <label className="field-label">Cardholder Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="Name on card"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="field" style={{ marginTop: 16 }}>
            <label className="field-label">Card Information</label>
            <div className="card-element-wrapper">
              <CardElement options={CARD_STYLE} />
            </div>
          </div>
          {error && <div className="fee-error" style={{ whiteSpace: 'pre-line' }}>{error}</div>}
          <button type="submit" className="fee-pay-btn" disabled={!stripe || processing || !name.trim() || !draftId}>
            {processing ? <span className="fee-spinner" /> : <>🔒 Pay ${SUBMISSION_FEE}.00 &amp; Submit Form</>}
          </button>
          <p className="fee-secure-note">
            Your payment is encrypted and secured by Stripe. We never store card details.
          </p>
        </div>
      </form>
    </div>
    </div>
  );
}
