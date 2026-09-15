import React from 'react';

function PaidPreparer({ formData, onChange, errors = {} }) {
  const handleEIN = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 9) val = val.slice(0, 9);
    if (val.length > 2) val = val.slice(0, 2) + '-' + val.slice(2);
    onChange({ ...formData, prep_firm_ein: val });
  };

  return (
    <div>
      <div className="section-card">
        <div className="section-header">
          <span className="section-header-title">Paid Preparer Use Only</span>
        </div>

        <div className="field-group">
          {/* Row 1: Preparer name + Signature */}
          <div className="grid-2" style={{ marginBottom: '20px' }}>
            <div className="field">
              <label className="field-label">Print / type preparer's name</label>
              <input
                type="text"
                className="form-input"
                value={formData.prep_name || ''}
                onChange={e => onChange({ ...formData, prep_name: e.target.value })}
                maxLength={60}
                placeholder="Preparer's full name"
              />
            </div>
            <div className="field">
              <label className="field-label">Preparer's signature</label>
              <input
                type="text"
                className="form-input"
                placeholder="Sign here"
                style={{ fontStyle: 'italic', fontFamily: 'cursive, Georgia, serif', fontSize: '15px' }}
                value={formData.prep_signature || ''}
                onChange={e => onChange({ ...formData, prep_signature: e.target.value })}
                maxLength={60}
              />
            </div>
          </div>

          {/* Row 2: Date + Self-employed + PTIN */}
          <div className="grid-3" style={{ marginBottom: '20px' }}>
            <div className="field">
              <label className="field-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.prep_date || ''}
                onChange={e => onChange({ ...formData, prep_date: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="field-label">PTIN</label>
              <input
                type="text"
                className={`form-input${errors.prep_ptin ? ' form-input--error' : ''}`}
                value={formData.prep_ptin || ''}
                onChange={e => onChange({ ...formData, prep_ptin: e.target.value })}
                maxLength={11}
                placeholder="P-XXXXXXXXX"
                style={{ fontFamily: 'monospace', letterSpacing: '1px' }}
              />
              {errors.prep_ptin && <span className="field-error">{errors.prep_ptin}</span>}
            </div>
            <div className="field">
              <label className="field-label">Employment status</label>
              <label className="styled-checkbox-row">
                <input
                  type="checkbox"
                  id="self-employed"
                  checked={!!formData.prep_self_employed}
                  onChange={e => onChange({ ...formData, prep_self_employed: e.target.checked })}
                />
                <span>Check if self-employed</span>
              </label>
            </div>
          </div>

          {/* Row 3: Firm name (full width) */}
          <div className="field" style={{ marginBottom: '20px' }}>
            <label className="field-label">Firm's name (or yours if self-employed)</label>
            <input
              type="text"
              className="form-input"
              value={formData.prep_firm_name || ''}
              onChange={e => onChange({ ...formData, prep_firm_name: e.target.value })}
              maxLength={60}
              placeholder="Firm or preparer name"
            />
          </div>

          {/* Row 4: Firm EIN + Phone */}
          <div className="grid-2" style={{ marginBottom: '20px' }}>
            <div className="field">
              <label className="field-label">Firm's EIN</label>
              <input
                type="text"
                className={`form-input${errors.prep_firm_ein ? ' form-input--error' : ''}`}
                placeholder="XX-XXXXXXX"
                value={formData.prep_firm_ein || ''}
                onChange={handleEIN}
                maxLength={10}
                style={{ fontFamily: 'monospace', letterSpacing: '1px' }}
              />
              {errors.prep_firm_ein && <span className="field-error">{errors.prep_firm_ein}</span>}
            </div>
            <div className="field">
              <label className="field-label">Phone number</label>
              <input
                type="text"
                className={`form-input${errors.prep_phone ? ' form-input--error' : ''}`}
                placeholder="(XXX) XXX-XXXX"
                value={formData.prep_phone || ''}
                onChange={e => onChange({ ...formData, prep_phone: e.target.value })}
                maxLength={20}
              />
              {errors.prep_phone && <span className="field-error">{errors.prep_phone}</span>}
            </div>
          </div>

          {/* Row 5: Firm address (full width) */}
          <div className="field">
            <label className="field-label">Firm's address (including ZIP code)</label>
            <input
              type="text"
              className="form-input"
              value={formData.prep_firm_address || ''}
              onChange={e => onChange({ ...formData, prep_firm_address: e.target.value })}
              maxLength={80}
              placeholder="Street address, city, state, ZIP"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaidPreparer;
