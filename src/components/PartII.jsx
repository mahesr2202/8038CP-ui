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

const REPORT_NUMBERS = [
  ...Array.from({ length: 100 }, (_, i) => String(200 + i)),
  ...Array.from({ length: 100 }, (_, i) => String(400 + i)),
  ...Array.from({ length: 100 }, (_, i) => String(800 + i)),
];

const BOND_TYPES = [
  { code: '', label: '— Select bond type —' },
  { code: '102', label: '102 - New clean renewable energy bonds' },
  { code: '103', label: '103 - Qualified energy conservation bonds' },
  { code: '104', label: '104 - Qualified zone academy bonds' },
  { code: '105', label: '105 - Qualified school construction bonds' },
  { code: '109', label: '109 - Build America bonds' },
  { code: '110', label: '110 - Recovery zone economic development bonds' },
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

function EINBoxes({ value = '', onChange, hasError, disabled }) {
  const digits = value.replace(/-/g, '');
  const refs = useRef([]);

  const handleChange = (idx, e) => {
    if (disabled) return;
    const ch = e.target.value.replace(/[^0-9]/g, '').slice(-1);
    const arr = digits.padEnd(9, ' ').split('');
    arr[idx] = ch || ' ';
    const raw = arr.join('').replace(/ /g, '').slice(0, 9);
    const formatted = raw.length > 2 ? raw.slice(0, 2) + '-' + raw.slice(2) : raw;
    onChange(formatted);
    if (ch && idx < 8) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (disabled) return;
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
    if (disabled) return;
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 9);
    const formatted = pasted.length > 2 ? pasted.slice(0, 2) + '-' + pasted.slice(2) : pasted;
    onChange(formatted);
    refs.current[Math.min(pasted.length, 8)]?.focus();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {Array(9).fill(0).map((_, i) => (
        <React.Fragment key={i}>
          {i === 2 && (
            <span style={{ fontWeight: 700, fontSize: 18, color: '#64748B', padding: '0 1px' }}>—</span>
          )}
          <input
            ref={el => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={disabled ? '' : (digits[i] || '')}
            onChange={e => handleChange(i, e)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={disabled}
            style={{
              width: 32, height: 38, textAlign: 'center', fontSize: 14, fontWeight: 600,
              border: `1.5px solid ${hasError ? '#EF4444' : disabled ? '#E2E8F0' : '#CBD5E1'}`,
              borderRadius: 6, outline: 'none',
              background: disabled ? '#F8FAFC' : '#fff',
              color: disabled ? '#94A3B8' : 'inherit',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              cursor: disabled ? 'not-allowed' : 'text',
            }}
            onFocus={e => {
              if (!disabled) {
                e.target.style.borderColor = '#4F46E5';
                e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.15)';
              }
            }}
            onBlur={e => {
              e.target.style.borderColor = hasError ? '#EF4444' : disabled ? '#E2E8F0' : '#CBD5E1';
              e.target.style.boxShadow = 'none';
            }}
          />
        </React.Fragment>
      ))}
    </div>
  );
}

function PartII({ formData, onChange, errors = {} }) {
  const isSame = (formData.line7 || '').trim().toUpperCase() === 'SAME';

  const cusipIsNone = !!formData.line14_is_none;

  return (
    <div>
      <div className="section-card">
        <div className="section-header">
          <span className="section-header-title">Part II — Reporting Authority</span>
          <span className="section-header-subtitle">Lines 7–17c</span>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="field-group">
            <div className="section-errors-banner">
              Please correct the highlighted fields before continuing.
            </div>
          </div>
        )}

        {/* Lines 7 + 8 */}
        <div className="field-group">
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 24, alignItems: 'start' }}>

            {/* Line 7 */}
            <div className="field">
              <label className="field-label">
                <span className="field-line-badge">7</span>
                Issuer's name (if same as line 1, enter "SAME" and skip lines 8, 9, 11, 15, and 16)
                <InfoIcon />
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.line7 || ''}
                onChange={e => onChange({ ...formData, line7: e.target.value })}
                maxLength={80}
                placeholder='Enter issuer name, or "SAME" if same as line 1'
              />
              {isSame && (
                <span className="field-hint" style={{ color: '#059669', fontWeight: 600 }}>
                  Lines 8, 9, 11, 15, and 16 are skipped.
                </span>
              )}
            </div>

            {/* Line 8 — EIN */}
            <div className="field">
              <label className="field-label">
                <span className="field-line-badge">8</span>
                Employer identification number (EIN)
                <InfoIcon />
              </label>
              <EINBoxes
                value={isSame ? '' : (formData.line8 || '')}
                onChange={val => onChange({ ...formData, line8: val })}
                hasError={!!errors.line8}
                disabled={isSame}
              />
              {errors.line8 && <span className="field-error">{errors.line8}</span>}
            </div>
          </div>
        </div>

        {/* Lines 9 + 10 */}
        <div className="field-group">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>

            {/* Line 9 */}
            <div className="field">
              <label className="field-label" style={{ marginBottom: 8 }}>
                <span className="field-line-badge">9</span>
                Number and street (or P.O. box no. if mail is not delivered to street address)
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  className="form-input"
                  value={isSame ? '' : (formData.line9_street || '')}
                  onChange={e => onChange({ ...formData, line9_street: e.target.value })}
                  disabled={isSame}
                  maxLength={60}
                  placeholder="Address 1"
                  style={{ flex: 3 }}
                />
                <input
                  type="text"
                  className="form-input"
                  value={isSame ? '' : (formData.line9_room || '')}
                  onChange={e => onChange({ ...formData, line9_room: e.target.value })}
                  disabled={isSame}
                  maxLength={35}
                  placeholder="address 2"
                  style={{ flex: 2 }}
                />
              </div>
            </div>

            {/* Line 10 */}
            <div className="field">
              <label className="field-label">
                <span className="field-line-badge">10</span>
                Report number&nbsp;
                <a
                  href="https://www.irs.gov/instructions/i8038cp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="field-ref-link"
                  style={{ fontWeight: 400 }}
                >
                  (see instructions ↗)
                </a>
                <InfoIcon />
              </label>
              <select
                className={`form-select${errors.line10 ? ' form-input--error' : ''}`}
                value={formData.line10 || ''}
                onChange={e => onChange({ ...formData, line10: e.target.value })}
              >
                <option value="">— Select —</option>
                {REPORT_NUMBERS.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              {errors.line10 && <span className="field-error">{errors.line10}</span>}
            </div>
          </div>
        </div>

        {/* Lines 11 + 12 */}
        <div className="field-group">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>

            {/* Line 11 */}
            <div className="field">
              <label className="field-label" style={{ marginBottom: 8 }}>
                <span className="field-line-badge">11</span>
                City, town, or post office; state; and ZIP code
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: 10 }}>
                <input
                  type="text"
                  className="form-input"
                  value={isSame ? '' : (formData.line11_city || '')}
                  onChange={e => onChange({ ...formData, line11_city: e.target.value })}
                  disabled={isSame}
                  maxLength={40}
                  placeholder="City"
                />
                <select
                  className="form-select"
                  value={isSame ? '' : (formData.line11_state || '')}
                  onChange={e => onChange({ ...formData, line11_state: e.target.value })}
                  disabled={isSame}
                >
                  <option value="">State</option>
                  {US_STATES.map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  className="form-input"
                  value={isSame ? '' : (formData.line11_zip || '')}
                  onChange={e => {
                    const v = e.target.value.replace(/[^0-9-]/g, '').slice(0, 10);
                    onChange({ ...formData, line11_zip: v });
                  }}
                  disabled={isSame}
                  maxLength={10}
                  placeholder="ZIP"
                />
              </div>
            </div>

            {/* Line 12 */}
            <div className="field">
              <label className="field-label">
                <span className="field-line-badge">12</span>
                Date of issue (MM/DD/YYYY)
                <InfoIcon />
              </label>
              <input
                type="date"
                className={`form-input${errors.line12 ? ' form-input--error' : ''}`}
                value={formData.line12 || ''}
                onChange={e => onChange({ ...formData, line12: e.target.value })}
              />
              {errors.line12 && <span className="field-error">{errors.line12}</span>}
            </div>
          </div>
        </div>

        {/* Lines 13 + 14 */}
        <div className="field-group">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>

            {/* Line 13 */}
            <div className="field">
              <label className="field-label">
                <span className="field-line-badge">13</span>
                Name of issue
                <InfoIcon />
              </label>
              <input
                type="text"
                className={`form-input${errors.line13 ? ' form-input--error' : ''}`}
                value={formData.line13 || ''}
                onChange={e => onChange({ ...formData, line13: e.target.value })}
                maxLength={80}
                placeholder="Issue name"
              />
              {errors.line13 && <span className="field-error">{errors.line13}</span>}
            </div>

            {/* Line 14 */}
            <div className="field">
              <label className="field-label">
                <span className="field-line-badge">14</span>
                CUSIP number&nbsp;
                <a
                  href="https://www.irs.gov/instructions/i8038cp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="field-ref-link"
                  style={{ fontWeight: 400 }}
                >
                  (see instructions ↗)
                </a>
                <InfoIcon />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, marginBottom: 6 }}>
                <input
                  type="checkbox"
                  checked={cusipIsNone}
                  onChange={e => onChange({ ...formData, line14_is_none: e.target.checked, line14: e.target.checked ? 'NONE' : '' })}
                  style={{ width: 15, height: 15, accentColor: '#4F46E5', cursor: 'pointer' }}
                />
                Check if NONE
              </label>
              <input
                type="text"
                className={`form-input${errors.line14 ? ' form-input--error' : ''}`}
                value={cusipIsNone ? '' : (formData.line14 || '')}
                onChange={e => {
                  const val = e.target.value.replace(/\s/g, '').slice(0, 9);
                  onChange({ ...formData, line14: val });
                }}
                disabled={cusipIsNone}
                maxLength={9}
                placeholder="XXXXXXXXX"
                style={{ letterSpacing: '2px', fontFamily: 'monospace', fontWeight: 600 }}
              />
              {errors.line14 && <span className="field-error">{errors.line14}</span>}
            </div>
          </div>
        </div>

        {/* Lines 15 + 16 */}
        <div className="field-group">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>

            {/* Line 15 */}
            <div className="field">
              <label className="field-label">
                <span className="field-line-badge">15</span>
                Name and title of officer or other person whom the IRS may contact for more information
                <InfoIcon />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input
                  type="text"
                  className={`form-input${errors.line15_name ? ' form-input--error' : ''}`}
                  value={isSame ? '' : (formData.line15_name || '')}
                  onChange={e => onChange({ ...formData, line15_name: e.target.value })}
                  disabled={isSame}
                  maxLength={35}
                  placeholder="Name"
                />
                <input
                  type="text"
                  className="form-input"
                  value={isSame ? '' : (formData.line15_title || '')}
                  onChange={e => onChange({ ...formData, line15_title: e.target.value })}
                  disabled={isSame}
                  maxLength={35}
                  placeholder="Title"
                />
              </div>
              {errors.line15_name && <span className="field-error">{errors.line15_name}</span>}
            </div>

            {/* Line 16 */}
            <div className="field">
              <label className="field-label">
                <span className="field-line-badge">16</span>
                Telephone number of contact person shown on line 15
                <InfoIcon />
              </label>
              <input
                type="text"
                className={`form-input${errors.line16 ? ' form-input--error' : ''}`}
                value={isSame ? '' : (formData.line16 || '')}
                onChange={e => onChange({ ...formData, line16: e.target.value })}
                disabled={isSame}
                maxLength={20}
                placeholder="(XXX) XXX-XXXX"
              />
              {errors.line16 && <span className="field-error">{errors.line16}</span>}
            </div>
          </div>
        </div>

        {/* Lines 17a / 17b / 17c */}
        <div className="field-group">

          {/* 17a + 17b — same row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span className="field-line-badge">17a</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
                Check applicable box&nbsp;
                <a
                  href="https://www.irs.gov/instructions/i8038cp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="field-ref-link"
                  style={{ fontWeight: 400 }}
                >
                  (see instructions ↗)
                </a>
                &nbsp;►
              </span>
              <InfoIcon />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={formData.line17a === 'VARIABLE'}
                onChange={() => onChange({ ...formData, line17a: formData.line17a === 'VARIABLE' ? '' : 'VARIABLE' })}
                style={{ width: 15, height: 15, accentColor: '#4F46E5', cursor: 'pointer' }}
              />
              Variable rate bond
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={formData.line17a === 'FIXED'}
                onChange={() => onChange({ ...formData, line17a: formData.line17a === 'FIXED' ? '' : 'FIXED' })}
                style={{ width: 15, height: 15, accentColor: '#4F46E5', cursor: 'pointer' }}
              />
              Fixed rate bond
            </label>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>b</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Enter the issue price ►</span>
                <InfoIcon />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>17b</span>
                <div style={{ display: 'flex', alignItems: 'stretch', border: '1.5px solid #CBD5E1', borderRadius: 8, overflow: 'hidden' }}>
                  <span style={{ padding: '8px 10px', background: '#F1F5F9', fontSize: 14, fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center' }}>$</span>
                  <input
                    type="text"
                    className={errors.line17b ? 'form-input--error' : ''}
                    value={formData.line17b || ''}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9.,]/g, '');
                      onChange({ ...formData, line17b: val });
                    }}
                    placeholder="0"
                    style={{ width: 90, padding: '8px 10px', border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {errors.line17a && <span className="field-error" style={{ display: 'block', marginTop: 6 }}>{errors.line17a}</span>}

          {/* 17c */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>c</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
                Enter code number for type of bonds&nbsp;
                <a
                  href="https://www.irs.gov/instructions/i8038cp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="field-ref-link"
                  style={{ fontWeight: 400 }}
                >
                  (see instructions ↗)
                </a>
              </span>
              <InfoIcon />
            </div>
            <select
              className={`form-select${errors.line17c ? ' form-select--error' : ''}`}
              value={formData.line17c || ''}
              onChange={e => onChange({ ...formData, line17c: e.target.value })}
              style={{ flex: 1, minWidth: 280 }}
            >
              {BOND_TYPES.map(bt => (
                <option key={bt.code} value={bt.code}>{bt.label}</option>
              ))}
            </select>
          </div>
          {errors.line17c && <span className="field-error" style={{ display: 'block', marginTop: 4 }}>{errors.line17c}</span>}
          {errors.line17b && <span className="field-error" style={{ display: 'block', marginTop: 4 }}>{errors.line17b}</span>}
        </div>

      </div>
    </div>
  );
}

export default PartII;
