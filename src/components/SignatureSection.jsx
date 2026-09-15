import React from 'react';

function SignatureSection({ formData, onChange, errors = {} }) {
  return (
    <div>
      <div className="section-card">
        <div className="section-header">
          <span className="section-header-title">Signature</span>
          <span className="section-header-subtitle">Under penalties of perjury</span>
        </div>

        <div className="field-group">
          {/* Legal declaration */}
          <div className="sig-legal-box">
            Under penalties of perjury, I declare that I have examined this return, including accompanying
            schedules and statements, and to the best of my knowledge and belief, it is true, correct, and
            complete. Declaration of preparer (other than officer) is based on all information of which
            preparer has any knowledge.
          </div>

          {/* Signature, Date, Name/Title — 3-column grid */}
          <div className="grid-3">
            <div className="field">
              <label className="field-label">Signature of issuer or authorized representative</label>
              <input
                type="text"
                className={`form-input${errors.sig_signature ? ' form-input--error' : ''}`}
                placeholder="Sign here"
                style={{ fontStyle: 'italic', fontFamily: 'cursive, Georgia, serif', fontSize: '15px' }}
                value={formData.sig_signature || ''}
                onChange={e => onChange({ ...formData, sig_signature: e.target.value })}
              />
              {errors.sig_signature && <span className="field-error">{errors.sig_signature}</span>}
            </div>
            <div className="field">
              <label className="field-label">Date</label>
              <input
                type="date"
                className={`form-input${errors.sig_date ? ' form-input--error' : ''}`}
                value={formData.sig_date || ''}
                onChange={e => onChange({ ...formData, sig_date: e.target.value })}
              />
              {errors.sig_date && <span className="field-error">{errors.sig_date}</span>}
            </div>
            <div className="field">
              <label className="field-label">Type or print name and title</label>
              <input
                type="text"
                className="form-input"
                value={formData.sig_name_title || ''}
                onChange={e => onChange({ ...formData, sig_name_title: e.target.value })}
                maxLength={80}
                placeholder="Full name and title"
              />
            </div>
          </div>

          {/* Officer name (first + last) and Taxpayer PIN */}
          <div className="grid-3" style={{ marginTop: '12px' }}>
            <div className="field">
              <label className="field-label">Officer First Name <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                className={`form-input${errors.sig_first_name ? ' form-input--error' : ''}`}
                placeholder="First name"
                value={formData.sig_first_name || ''}
                onChange={e => onChange({ ...formData, sig_first_name: e.target.value })}
                maxLength={35}
              />
              {errors.sig_first_name && <span className="field-error">{errors.sig_first_name}</span>}
            </div>
            <div className="field">
              <label className="field-label">Officer Last Name <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                className={`form-input${errors.sig_last_name ? ' form-input--error' : ''}`}
                placeholder="Last name"
                value={formData.sig_last_name || ''}
                onChange={e => onChange({ ...formData, sig_last_name: e.target.value })}
                maxLength={35}
              />
              {errors.sig_last_name && <span className="field-error">{errors.sig_last_name}</span>}
            </div>
            <div className="field">
              <label className="field-label">Taxpayer PIN <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                className={`form-input${errors.taxpayer_pin ? ' form-input--error' : ''}`}
                placeholder="5-digit self-selected PIN"
                value={formData.taxpayer_pin || ''}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                  onChange({ ...formData, taxpayer_pin: val });
                }}
                maxLength={5}
                inputMode="numeric"
              />
              {errors.taxpayer_pin && <span className="field-error">{errors.taxpayer_pin}</span>}
            </div>
          </div>

          {/* Privacy note */}
          <div className="sig-legal-box" style={{ marginTop: '16px' }}>
            <strong>Privacy Act and Paperwork Reduction Act Notice:</strong> The information requested
            on this form is required under sections 6011 and 6049 of the Internal Revenue Code.
            See the Instructions for Form 8038-CP for further information. Cat. No. 37759H
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignatureSection;
