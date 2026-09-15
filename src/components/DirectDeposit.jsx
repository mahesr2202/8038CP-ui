import React, { useRef } from 'react';

function DirectDeposit({ formData, onChange, errors = {} }) {
  const routingRefs = useRef([]);

  // Routing number: array of 9 single-digit values
  const routing = formData.routing || Array(9).fill('');

  const handleRoutingDigit = (index, e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    const newRouting = [...routing];
    if (val === '') {
      newRouting[index] = '';
      onChange({ ...formData, routing: newRouting });
      if (index > 0) routingRefs.current[index - 1]?.focus();
      return;
    }
    newRouting[index] = val.slice(-1);
    onChange({ ...formData, routing: newRouting });
    if (index < 8) routingRefs.current[index + 1]?.focus();
  };

  const handleRoutingKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !routing[index] && index > 0) {
      routingRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      routingRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 8) {
      e.preventDefault();
      routingRefs.current[index + 1]?.focus();
    }
  };

  const handleRoutingPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 9);
    const newRouting = Array(9).fill('');
    for (let i = 0; i < pasted.length; i++) newRouting[i] = pasted[i];
    onChange({ ...formData, routing: newRouting });
    const nextIndex = Math.min(pasted.length, 8);
    routingRefs.current[nextIndex]?.focus();
  };

  const handleAccountType = (type) => {
    onChange({ ...formData, accountType: formData.accountType === type ? '' : type });
  };

  const routingFilled = routing.filter(d => d).length;
  const routingComplete = routingFilled === 9;

  return (
    <div>
      <div className="section-card">
        <div className="section-header">
          <span className="section-header-title">Direct Deposit of Credit Payment</span>
          <span className="section-header-subtitle">Line 26 — see instructions</span>
        </div>

        {/* 26a — Routing number */}
        <div className="field-group">
          <div className="field">
            <label className="field-label">
              <span className="field-line-badge">26a</span>
              Routing number — enter each digit in a separate box
            </label>
            <div className="routing-boxes" onPaste={handleRoutingPaste}>
              {Array(9).fill(null).map((_, i) => (
                <React.Fragment key={i}>
                  {/* Visual divider after position 3 and 7 to match ABA format */}
                  {(i === 3 || i === 7) && (
                    <span className="routing-divider">·</span>
                  )}
                  <input
                    type="text"
                    inputMode="numeric"
                    className={`routing-box${errors.routing ? ' form-input--error' : ''}`}
                    maxLength={1}
                    value={routing[i] || ''}
                    ref={el => { routingRefs.current[i] = el; }}
                    onChange={e => handleRoutingDigit(i, e)}
                    onKeyDown={e => handleRoutingKeyDown(i, e)}
                    aria-label={`Routing number digit ${i + 1}`}
                  />
                </React.Fragment>
              ))}
            </div>
            <span className={`routing-status${routingComplete ? ' complete' : ''}`}>
              {routingComplete
                ? `Routing number: ${routing.join('')}`
                : `${routingFilled} of 9 digits entered`}
            </span>
            {errors.routing && <span className="field-error">{errors.routing}</span>}
            <span className="field-hint">Must be a valid 9-digit ABA routing number</span>
          </div>
        </div>

        {/* 26b — Account type */}
        <div className="field-group">
          <div className="field">
            <label className="field-label">
              <span className="field-line-badge">26b</span>
              Account type
            </label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="accountType"
                  value="checking"
                  checked={formData.accountType === 'checking'}
                  onChange={() => onChange({ ...formData, accountType: 'checking' })}
                />
                Checking
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="accountType"
                  value="savings"
                  checked={formData.accountType === 'savings'}
                  onChange={() => onChange({ ...formData, accountType: 'savings' })}
                />
                Savings
              </label>
            </div>
            <span className="field-hint">Select one account type</span>
            {errors.accountType && <span className="field-error">{errors.accountType}</span>}
          </div>
        </div>

        {/* 26c — Account number */}
        <div className="field-group">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="field">
              <label className="field-label">
                <span className="field-line-badge">26c</span>
                Account number
              </label>
              <input
                type="text"
                className={`form-input${errors.accountNumber ? ' form-input--error' : ''}`}
                value={formData.accountNumber || ''}
                onChange={e => {
                  let val = e.target.value.replace(/[^0-9\-]/g, '');
                  if (val.length > 17) val = val.slice(0, 17);
                  onChange({ ...formData, accountNumber: val });
                }}
                maxLength={17}
                placeholder="Account number"
                style={{ letterSpacing: '2px', fontFamily: 'monospace', fontWeight: 600 }}
              />
              <span className="field-hint">Up to 17 characters, hyphens ok</span>
              {errors.accountNumber && <span className="field-error">{errors.accountNumber}</span>}
            </div>
            <div />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DirectDeposit;
