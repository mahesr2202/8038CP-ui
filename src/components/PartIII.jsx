import React from 'react';
import ScheduleA from './ScheduleA.jsx';

function parseDollar(str) {
  if (!str) return 0;
  return parseFloat(String(str).replace(/,/g, '')) || 0;
}

function fmtDollar(num) {
  if (num === null || num === undefined || isNaN(num)) return '';
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const EXPLANATION_CODES = [
  { code: '', label: '— Select explanation code —' },
  { code: '211', label: '211 — Erroneous entry on prior return(s)' },
  { code: '212', label: '212 — Math error on prior return(s)' },
  { code: '213', label: '213 — Claimed interest on prior return(s) on bonds previously redeemed' },
  { code: '214', label: '214 — Claimed interest on prior return(s) on bonds previously legally defeased' },
  { code: '219', label: '219 — Other' },
];

const LINE24B_CODES = [
  { code: '', label: '— Select explanation code —' },
  { code: '241', label: '241 — Insolvent, no receivership or bankruptcy proceedings' },
  { code: '242', label: '242 — Insolvency, receivership or bankruptcy proceedings in progress' },
  { code: '243', label: '243 — Insolvency, receivership or bankruptcy proceedings discharged debt' },
  { code: '244', label: '244 — Insufficient payment sources due to sequestration—no receivership proceedings' },
  { code: '245', label: '245 — Insufficient payment resources for reasons other than sequestration—no receivership proceedings' },
  { code: '249', label: '249 — Other' },
];

const LINE20_ITEMS = [
  { key: '20a', bondCode: '109', label: 'Build America bonds',                        desc: 'Multiply line 19a by 35% (0.35)', calcKey: 'line20a' },
  { key: '20b', bondCode: '110', label: 'Recovery zone economic development bonds',   desc: 'Multiply line 19a by 45% (0.45)', calcKey: 'line20b' },
  { key: '20c', bondCode: '102', label: 'New clean renewable energy bonds',           desc: 'Smaller of lines 19a or 19c',    calcKey: 'line20c' },
  { key: '20d', bondCode: '103', label: 'Qualified energy conservation bonds',        desc: 'Smaller of lines 19a or 19c',    calcKey: 'line20d' },
  { key: '20e', bondCode: '104', label: 'Qualified zone academy bonds',               desc: 'Smaller of lines 19a or 19c',    calcKey: 'line20e' },
  { key: '20f', bondCode: '105', label: 'Qualified school construction bonds',        desc: 'Smaller of lines 19a or 19c',    calcKey: 'line20f' },
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

const SCHEDULE_A_BOND_TYPES = new Set(['102', '103', '104', '105']);

function PartIII({ formData, onChange, calculations, errors = {} }) {
  const { line20a, line20b, line20c, line20d, line20e, line20f, line22 } = calculations;
  const calcMap = { line20a, line20b, line20c, line20d, line20e, line20f };
  const bondType = formData.line17c || '';
  const usesScheduleA = SCHEDULE_A_BOND_TYPES.has(bondType);

  const handleDate  = field => e => onChange({ ...formData, [field]: e.target.value });
  const handleDollar = field => e => onChange({ ...formData, [field]: e.target.value.replace(/[^0-9.,]/g, '') });

  const applicable20Key = { '109': 'line20a', '110': 'line20b', '102': 'line20c', '103': 'line20d', '104': 'line20e', '105': 'line20f' }[bondType] || '';

  return (
    <div>
      <div className="section-card">
        <div className="section-header">
          <span className="section-header-title">Part III — Payment of Credit</span>
          <span className="section-header-subtitle">Lines 18–25</span>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="field-group">
            <div className="section-errors-banner">
              Please correct the highlighted fields before continuing.
            </div>
          </div>
        )}

        {/* Info note */}
        <div className="field-group">
          <div className="info-note">
            Note: For specified tax credit bonds with multiple maturities, see instructions.
          </div>
        </div>

        {/* Schedule A — only for bond types 102, 103, 104, 105 */}
        {usesScheduleA && (
          <div className="field-group">
            <ScheduleA
              bondType={bondType}
              rows={formData.scheduleARows || [{ colAMaturityDate: '', colBActualInterest: '', colCCreditRateInterest: '' }]}
              onChange={rows => onChange({ ...formData, scheduleARows: rows })}
              errors={errors}
            />
          </div>
        )}

        {/* Line 18 — Interest payment date */}
        <div className="field-group">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
            <div className="field">
              <label className="field-label">
                <span className="field-line-badge">18</span>
                Interest payment date
                <InfoIcon />
              </label>
              <input
                type="date"
                className={`form-input${errors.line18 ? ' form-input--error' : ''}`}
                value={formData.line18 || ''}
                onChange={handleDate('line18')}
              />
              <span className="field-hint">Date this credit payment relates to.</span>
              {errors.line18 && <span className="field-error">{errors.line18}</span>}
            </div>
            <div />
          </div>
        </div>

        {/* Lines 19a / 19b / 19c */}
        <div className="field-group">
          <div className="grid-3">
            <div className="field">
              <label className="field-label">
                <span className="field-line-badge">19a</span>
                Interest payable to bondholders ($)
              </label>
              <input
                type="text"
                className={`form-input${errors.line19a ? ' form-input--error' : ''}`}
                value={formData.line19a || ''}
                onChange={handleDollar('line19a')}
                placeholder="0.00"
              />
              <span className="field-hint">On the interest payment date</span>
              {errors.line19a && <span className="field-error">{errors.line19a}</span>}
            </div>

            <div className="field">
              <label className="field-label">
                <span className="field-line-badge">19b</span>
                Applicable credit rate (%)
              </label>
              <div className={`input-with-unit${errors.line19b ? ' form-input--error' : ''}`}>
                <input
                  type="text"
                  className="form-input"
                  value={formData.line19b || ''}
                  onChange={e => onChange({ ...formData, line19b: e.target.value.replace(/[^0-9.]/g, '') })}
                  placeholder="0.00"
                />
                <span className="input-unit">%</span>
              </div>
              <span className="field-hint">
                Specified tax credit bonds only — see&nbsp;
                <a href="https://www.irs.gov/instructions/i8038cp" target="_blank" rel="noopener noreferrer" className="field-ref-link">IRS instructions ↗</a>.
                Rate must be in format ##.## (e.g., 5.25 or 12.50)
              </span>
              {errors.line19b && <span className="field-error">{errors.line19b}</span>}
            </div>

            <div className="field">
              <label className="field-label">
                <span className="field-line-badge">19c</span>
                Schedule A, line 3 amount ($)
              </label>
              <input
                type="text"
                className="form-input"
                value={usesScheduleA
                  ? (isNaN(calculations.line19c) ? '' : (calculations.line19c ?? ''))
                  : (formData.line19c || '')}
                onChange={usesScheduleA ? undefined : handleDollar('line19c')}
                readOnly={usesScheduleA}
                placeholder="0.00"
                style={usesScheduleA ? { background: '#F8FAFC', color: '#64748B', cursor: 'not-allowed' } : undefined}
              />
              <span className="field-hint">
                {usesScheduleA
                  ? 'Auto-computed from Schedule A rows above'
                  : 'Specified tax credit bonds only — complete Schedule A'}
              </span>
              {errors.line19c && <span className="field-error">{errors.line19c}</span>}
            </div>
          </div>
        </div>

        {/* Line 20 header */}
        <div className="subsection-header">
          Line 20 — Amount of credit allowed (complete ONLY ONE of lines 20a–20f based on your bond type)
        </div>

        {/* Line 20 cards */}
        <div className="line20-grid">
          {LINE20_ITEMS.map(item => {
            const isApplicable = bondType === item.bondCode;
            const amount = calcMap[item.calcKey] || 0;
            return (
              <div key={item.key} className={`line20-item${isApplicable ? ' applicable' : ''}`}>
                <div className="line20-item-header">
                  <span className="line20-badge">{item.key}</span>
                  {isApplicable && <span className="line20-applicable-tag">Applicable</span>}
                </div>
                <div className="line20-desc">
                  <strong>{item.label}</strong><br />{item.desc}
                </div>
                {isApplicable ? (
                  <div className="line20-amount">${fmtDollar(amount)}</div>
                ) : (
                  <div className="line20-amount inactive">
                    {bondType ? '— not applicable —' : '— select bond type in Part II —'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Line 22 — Total credit payment */}
        <div className="total-credit-box">
          <div className="total-credit-label">
            <span className="line-badge">22</span>
            Amount of credit payment requested — combine applicable line 20 amount with line 21a or 21b
          </div>
          <div className="total-credit-value">${fmtDollar(line22)}</div>
        </div>

        {/* Line 21 — Adjustment section */}
        <div className="field-group">
          <div className="subsection-header" style={{ margin: '0 -24px 16px', padding: '10px 24px' }}>
            Line 21 — Adjustment to previous credit payments (complete ONLY line 21a OR 21b)
          </div>

          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div className="field">
              <label className="field-label">
                <span className="field-line-badge">21a</span>
                Net increase to previous payments ($)
              </label>
              <input
                type="text"
                className={`form-input${errors.line21a ? ' form-input--error' : ''}`}
                value={formData.line21a || ''}
                onChange={handleDollar('line21a')}
                placeholder="0.00"
                disabled={!!formData.line21b}
              />
              {!!formData.line21b && (
                <span className="field-hint" style={{ color: '#F59E0B' }}>Clear line 21b to enter 21a</span>
              )}
              {errors.line21a && <span className="field-error">{errors.line21a}</span>}
            </div>

            <div className="field">
              <label className="field-label">
                <span className="field-line-badge">21b</span>
                Net decrease to previous payments ($)
              </label>
              <input
                type="text"
                className={`form-input${errors.line21b ? ' form-input--error' : ''}`}
                value={formData.line21b || ''}
                onChange={handleDollar('line21b')}
                placeholder="0.00"
                disabled={!!formData.line21a}
              />
              {!!formData.line21a && (
                <span className="field-hint" style={{ color: '#F59E0B' }}>Only enter this if 21a is empty</span>
              )}
              {errors.line21b && <span className="field-error">{errors.line21b}</span>}
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label className="field-label">
                <span className="field-line-badge">21c</span>
                Explanation code for lines 21a or 21b
              </label>
              <select
                className={`form-select${errors.line21c_code ? ' form-select--error' : ''}`}
                value={formData.line21c_code || ''}
                onChange={e => onChange({ ...formData, line21c_code: e.target.value })}
              >
                {EXPLANATION_CODES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              {errors.line21c_code && <span className="field-error">{errors.line21c_code}</span>}
            </div>

            <div className="field">
              <label className="field-label">
                <span className="field-line-badge">21c</span>
                Date for line 21c
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.line21c_date || ''}
                onChange={handleDate('line21c_date')}
              />
            </div>
          </div>
        </div>

        {/* Line 23a */}
        <div className="field-group">
          <div className="field">
            <label className="field-label">
              <span className="field-line-badge">23a</span>
              Has there been a change to the debt service schedule most recently filed with the IRS?
            </label>
            <div className="radio-group">
              <label className="radio-option">
                <input type="radio" name="line23a" value="true"
                  checked={formData.line23a === 'true'}
                  onChange={() => onChange({ ...formData, line23a: 'true' })}
                />
                Yes
              </label>
              <label className="radio-option">
                <input type="radio" name="line23a" value="false"
                  checked={formData.line23a === 'false'}
                  onChange={() => onChange({ ...formData, line23a: 'false' })}
                />
                No
              </label>
            </div>
            {errors.line23a && <span className="field-error">{errors.line23a}</span>}
          </div>

          {formData.line23a === 'true' && (
            <div className="conditional-reveal">
              <div className="field">
                <label className="field-label">
                  <span className="field-line-badge">23b</span>
                  Explanation code — attach revised debt service schedule
                </label>
                <input
                  type="text"
                  className={`form-input${errors.line23b ? ' form-input--error' : ''}`}
                  value={formData.line23b || ''}
                  onChange={e => {
                    let val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length > 3) val = val.slice(0, 3);
                    onChange({ ...formData, line23b: val });
                  }}
                  maxLength={3}
                  placeholder="231–239"
                  style={{ maxWidth: 160 }}
                />
                <span className="field-hint">Attach the revised debt service schedule to this return.</span>
                {errors.line23b && <span className="field-error">{errors.line23b}</span>}
              </div>
            </div>
          )}
        </div>

        {/* Line 24a */}
        <div className="field-group">
          <div className="field">
            <label className="field-label">
              <span className="field-line-badge">24a</span>
              Have you paid or will you pay all the interest from line 19a on or before the date from line 18?
            </label>
            <div className="radio-group">
              <label className="radio-option">
                <input type="radio" name="line24a" value="true"
                  checked={formData.line24a === 'true'}
                  onChange={() => onChange({ ...formData, line24a: 'true', line24b: '' })}
                />
                Yes
              </label>
              <label className="radio-option">
                <input type="radio" name="line24a" value="false"
                  checked={formData.line24a === 'false'}
                  onChange={() => onChange({ ...formData, line24a: 'false' })}
                />
                No
              </label>
            </div>
            {errors.line24a && <span className="field-error">{errors.line24a}</span>}
          </div>

          {formData.line24a === 'false' && (
            <div className="conditional-reveal">
              <div className="field">
                <label className="field-label">
                  <span className="field-line-badge">24b</span>
                  Explanation code
                </label>
                <select
                  className={`form-select${errors.line24b ? ' form-select--error' : ''}`}
                  value={formData.line24b || ''}
                  onChange={e => onChange({ ...formData, line24b: e.target.value })}
                >
                  {LINE24B_CODES.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
                {errors.line24b && <span className="field-error">{errors.line24b}</span>}
              </div>
            </div>
          )}
        </div>

        {/* Line 25 */}
        <div className="field-group">
          <div className="field">
            <label className="field-label">
              <span className="field-line-badge">25</span>
              Is this return submitted for the final interest payment date for the bonds?
            </label>
            <div className="radio-group">
              <label className="radio-option">
                <input type="radio" name="line25" value="true"
                  checked={formData.line25 === 'true'}
                  onChange={() => onChange({ ...formData, line25: 'true' })}
                />
                Yes
              </label>
              <label className="radio-option">
                <input type="radio" name="line25" value="false"
                  checked={formData.line25 === 'false'}
                  onChange={() => onChange({ ...formData, line25: 'false' })}
                />
                No
              </label>
            </div>
            {errors.line25 && <span className="field-error">{errors.line25}</span>}
          </div>
        </div>

      </div>
    </div>
  );
}

export default PartIII;
