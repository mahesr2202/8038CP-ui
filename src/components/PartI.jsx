import React, { useRef } from 'react';

const US_STATES = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'],
  ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'],
  ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'],
  ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'],
  ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'],
  ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'],
  ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
  ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'],
  ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'],
  ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'],
  ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'], ['WY', 'Wyoming'], ['DC', 'District of Columbia'],
];

function InfoIcon() {
  return (
    <svg
      width="14" height="14" viewBox="0 0 16 16" fill="none"
      style={{ color: '#64748B', flexShrink: 0, cursor: 'help' }}
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8" y1="7.5" x2="8" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="5.25" r="0.85" fill="currentColor" />
    </svg>
  );
}

function EINBoxes({ value = '', onChange, hasError }) {
  const digits = value.replace(/-/g, '');
  const refs = useRef([]);

  const handleChange = (idx, e) => {
    const ch = e.target.value.replace(/[^0-9]/g, '').slice(-1);
    const arr = digits.padEnd(9, ' ').split('');
    arr[idx] = ch || ' ';
    const raw = arr.join('').replace(/ /g, '').slice(0, 9);
    const formatted = raw.length > 2 ? raw.slice(0, 2) + '-' + raw.slice(2) : raw;
    onChange(formatted);
    if (ch && idx < 8) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace') {
      if (!digits[idx] && idx > 0) refs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      e.preventDefault();
      refs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < 8) {
      e.preventDefault();
      refs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 9);
    const formatted = pasted.length > 2 ? pasted.slice(0, 2) + '-' + pasted.slice(2) : pasted;
    onChange(formatted);
    const nextIdx = Math.min(pasted.length, 8);
    refs.current[nextIdx]?.focus();
  };

  const boxStyle = (idx, err) => ({
    width: 32, height: 38, textAlign: 'center', fontSize: 14, fontWeight: 600,
    border: `1.5px solid ${err ? '#EF4444' : '#CBD5E1'}`,
    borderRadius: 6, outline: 'none', background: '#fff', fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {Array(9).fill(0).map((_, i) => (
        <React.Fragment key={i}>
          {i === 2 && (
            <span style={{ fontWeight: 700, fontSize: 18, color: '#64748B', lineHeight: 1, padding: '0 1px' }}>
              —
            </span>
          )}
          <input
            ref={el => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[i] || ''}
            onChange={e => handleChange(i, e)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            style={boxStyle(i, hasError)}
            onFocus={e => {
              e.target.style.borderColor = '#4F46E5';
              e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.15)';
            }}
            onBlur={e => {
              e.target.style.borderColor = hasError ? '#EF4444' : '#CBD5E1';
              e.target.style.boxShadow = 'none';
            }}
          />
        </React.Fragment>
      ))}
    </div>
  );
}

function PartI({ formData, onChange, errors = {} }) {
  return (
    <div>
      <div className="section-card">
        <div className="section-header">
          <span className="section-header-title">Part I — Information on Entity That Is To Receive Payment</span>
          <span className="section-header-subtitle">Lines 1–6</span>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="field-group">
            <div className="section-errors-banner">
              Please correct the highlighted fields before continuing.
            </div>
          </div>
        )}

        {/* Lines 1 + 2 — same row */}
        <div className="field-group">
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 24, alignItems: 'start' }}>

            {/* Line 1 */}
            <div className="field">
              <label className="field-label">
                <span className="field-line-badge">1</span>
                Name of entity that is to receive payment of the credit
                <InfoIcon />
              </label>
              <input
                type="text"
                className={`form-input${errors.line1 ? ' form-input--error' : ''}`}
                value={formData.line1 || ''}
                onChange={e => onChange({ ...formData, line1: e.target.value })}
                maxLength={80}
                placeholder="Enter entity name"
              />
              {errors.line1 && <span className="field-error">{errors.line1}</span>}
            </div>

            {/* Line 2 — EIN */}
            <div className="field">
              <label className="field-label">
                <span className="field-line-badge">2</span>
                Employer identification number (EIN)
                <InfoIcon />
              </label>
              <EINBoxes
                value={formData.line2 || ''}
                onChange={val => onChange({ ...formData, line2: val })}
                hasError={!!errors.line2}
              />
              {errors.line2 && <span className="field-error">{errors.line2}</span>}
            </div>
          </div>
        </div>

        {/* Line 3 — Address */}
        <div className="field-group">
          <label className="field-label" style={{ marginBottom: 8 }}>
            <span className="field-line-badge">3</span>
            Number and street (or P.O. box no. if mail is not delivered to street address)
          </label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="text"
              className={`form-input${errors.line3_street ? ' form-input--error' : ''}`}
              value={formData.line3_street || ''}
              onChange={e => onChange({ ...formData, line3_street: e.target.value })}
              maxLength={60}
              placeholder="Address 1"
              style={{ flex: 3 }}
            />
            <input
              type="text"
              className={`form-input${errors.line3_room ? ' form-input--error' : ''}`}
              value={formData.line3_room || ''}
              onChange={e => onChange({ ...formData, line3_room: e.target.value })}
              maxLength={35}
              placeholder="address 2"
              style={{ flex: 2 }}
            />
          </div>
          {errors.line3_street && <span className="field-error" style={{ display: 'block', marginTop: 4 }}>{errors.line3_street}</span>}
          {errors.line3_room && <span className="field-error" style={{ display: 'block', marginTop: 2 }}>{errors.line3_room}</span>}
        </div>

        {/* Line 4 — City / State / ZIP */}
        <div className="field-group">
          <label className="field-label" style={{ marginBottom: 8 }}>
            <span className="field-line-badge">4</span>
            City, town, or post office; state; and ZIP code
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: 12 }}>
            <input
              type="text"
              className={`form-input${errors.line4_city ? ' form-input--error' : ''}`}
              value={formData.line4_city || ''}
              onChange={e => onChange({ ...formData, line4_city: e.target.value })}
              maxLength={40}
              placeholder="City"
            />
            <select
              className={`form-select${errors.line4_state ? ' form-input--error' : ''}`}
              value={formData.line4_state || ''}
              onChange={e => onChange({ ...formData, line4_state: e.target.value })}
            >
              <option value="">State</option>
              {US_STATES.map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
            <input
              type="text"
              className={`form-input${errors.line4_zip ? ' form-input--error' : ''}`}
              value={formData.line4_zip || ''}
              onChange={e => {
                const v = e.target.value.replace(/[^0-9-]/g, '').slice(0, 10);
                onChange({ ...formData, line4_zip: v });
              }}
              maxLength={10}
              placeholder="ZIP"
            />
          </div>
          {errors.line4_city && <span className="field-error" style={{ display: 'block', marginTop: 4 }}>{errors.line4_city}</span>}
          {errors.line4_state && <span className="field-error" style={{ display: 'block', marginTop: 2 }}>{errors.line4_state}</span>}
          {errors.line4_zip && <span className="field-error" style={{ display: 'block', marginTop: 2 }}>{errors.line4_zip}</span>}
        </div>

        {/* Lines 5 + 6 — same row */}
        <div className="field-group">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>

            {/* Line 5 */}
            <div className="field">
              <label className="field-label">
                <span className="field-line-badge">5</span>
                Name and title of designated contact person whom the IRS may contact for more information
                <InfoIcon />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input
                  type="text"
                  className={`form-input${errors.line5_name ? ' form-input--error' : ''}`}
                  value={formData.line5_name || ''}
                  onChange={e => onChange({ ...formData, line5_name: e.target.value })}
                  maxLength={35}
                  placeholder="Name"
                />
                <input
                  type="text"
                  className={`form-input${errors.line5_title ? ' form-input--error' : ''}`}
                  value={formData.line5_title || ''}
                  onChange={e => onChange({ ...formData, line5_title: e.target.value })}
                  maxLength={35}
                  placeholder="Title"
                />
              </div>
              {errors.line5_name && <span className="field-error">{errors.line5_name}</span>}
            </div>

            {/* Line 6 */}
            <div className="field">
              <label className="field-label">
                <span className="field-line-badge">6</span>
                Telephone number of contact person shown on line 5
                <InfoIcon />
              </label>
              <input
                type="text"
                className={`form-input${errors.line6 ? ' form-input--error' : ''}`}
                value={formData.line6 || ''}
                onChange={e => onChange({ ...formData, line6: e.target.value })}
                maxLength={20}
                placeholder="(XXX) XXX-XXXX"
              />
              {errors.line6 && <span className="field-error">{errors.line6}</span>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PartI;
