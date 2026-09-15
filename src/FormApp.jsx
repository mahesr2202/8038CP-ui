import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import PartI from './components/PartI.jsx';
import PartII from './components/PartII.jsx';
import PartIII from './components/PartIII.jsx';
import DirectDeposit from './components/DirectDeposit.jsx';
import SignatureSection from './components/SignatureSection.jsx';
import PaidPreparer from './components/PaidPreparer.jsx';
import SubmissionFee from './components/SubmissionFee.jsx';
import SubmissionsSidebar from './components/SubmissionsSidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import SubmissionDetail from './components/SubmissionDetail.jsx';
import { useAuth } from './context/AuthContext.jsx';
import {
  logout, createDraft, getMyForms, getFormById, deleteForm,
  savePartI, savePartII, savePartIII,
  saveDeposit, saveSignature, savePreparer, saveScheduleA,
} from './lib/api.js';
import { validateStep1, validateStep2, validateStep3, validateStep4 } from './lib/validation.js';

function parseDollar(str) {
  if (!str) return 0;
  return parseFloat(String(str).replace(/,/g, '')) || 0;
}

const BOND_TYPE_TO_LINE20 = {
  '109': '20A', '110': '20B', '102': '20C',
  '103': '20D', '104': '20E', '105': '20F',
};

const SCHEDULE_A_BOND_TYPES = new Set(['102', '103', '104', '105']);

const INITIAL_STATE = {
  isAmended: false,
  line1: '', line2: '',
  line3_street: '', line3_room: '',
  line4_city: '', line4_state: '', line4_zip: '',
  line5_name: '', line5_title: '', line6: '',
  line7: '', line8: '', line9_street: '', line9_room: '',
  line10: '', line11_city: '', line11_state: '', line11_zip: '',
  line12: '', line13: '', line14: '', line14_is_none: false,
  line15_name: '', line15_title: '', line16: '', line17a: '', line17b: '', line17c: '',
  line18: '', line19a: '', line19b: '', line19c: '',
  line21a: '', line21b: '', line21c_code: '', line21c_date: '',
  line23a: '', line23b: '', line24a: '', line24b: '', line25: '',
  scheduleARows: [{ colAMaturityDate: '', colBActualInterest: '', colCCreditRateInterest: '' }],
  routing: Array(9).fill(''), accountType: '', accountNumber: '',
  sig_signature: '', sig_date: '', sig_name_title: '', taxpayer_pin: '',
  sig_first_name: '', sig_last_name: '',
  prep_name: '', prep_signature: '', prep_date: '',
  prep_self_employed: false, prep_ptin: '',
  prep_firm_name: '', prep_firm_ein: '', prep_phone: '', prep_firm_address: '',
};

function apiToFormData(sub) {
  let line4_city = '', line4_state = '', line4_zip = '';
  if (sub.line4) {
    const [city, stateZip = ''] = sub.line4.split(', ');
    const [st = '', zip = ''] = stateZip.split(' ');
    line4_city = city || ''; line4_state = st; line4_zip = zip;
  }
  let line11_city = '', line11_state = '', line11_zip = '';
  if (sub.line11) {
    const [city, stateZip = ''] = sub.line11.split(', ');
    const [st = '', zip = ''] = stateZip.split(' ');
    line11_city = city || ''; line11_state = st; line11_zip = zip;
  }
  return {
    isAmended:      sub.isAmended || false,
    line1:          sub.line1 || '',
    line2:          sub.line2 || '',
    line3_street:   sub.line3Street || '',
    line3_room:     sub.line3Room || '',
    line4_city, line4_state, line4_zip,
    line5_name:     sub.line5 || '',
    line5_title:    sub.line5Title || '',
    line6:          sub.line6 || '',
    line7:          sub.line7 || '',
    line8:          sub.line8 || '',
    line9_street:   sub.line9Street || '',
    line9_room:     sub.line9Room || '',
    line10:         sub.line10 || '',
    line11_city, line11_state, line11_zip,
    line12:         sub.line12 || '',
    line13:         sub.line13 || '',
    line14:         sub.line14 === 'NONE' ? '' : (sub.line14 || ''),
    line14_is_none: sub.line14 === 'NONE',
    line15_name:    sub.line15 || '',
    line15_title:   sub.line15Title || '',
    line16:         sub.line16 || '',
    line17a:        sub.line17a || '',
    line17b:        sub.line17b != null ? String(sub.line17b) : '',
    line17c:        sub.line17c || '',
    line18:         sub.line18 || '',
    line19a:        sub.line19a != null ? String(sub.line19a) : '',
    line19b:        sub.line19b != null ? String(sub.line19b) : '',
    line19c:        sub.line19c != null ? String(sub.line19c) : '',
    line21a:        sub.line21a != null ? String(sub.line21a) : '',
    line21b:        sub.line21b != null ? String(sub.line21b) : '',
    line21c_code:   sub.line21cCode || '',
    line21c_date:   '',
    line23a:        sub.line23a || '',
    line23b:        sub.line23b || '',
    line24a:        sub.line24a || '',
    line24b:        sub.line24b || '',
    line25:         sub.line25 || '',
    scheduleARows: sub.scheduleARows && sub.scheduleARows.length > 0
      ? sub.scheduleARows.map(r => ({
          colAMaturityDate:      r.colAMaturityDate || '',
          colBActualInterest:    r.colBActualInterest != null ? String(r.colBActualInterest) : '',
          colCCreditRateInterest:r.colCCreditRateInterest != null ? String(r.colCCreditRateInterest) : '',
        }))
      : [{ colAMaturityDate: '', colBActualInterest: '', colCCreditRateInterest: '' }],
    routing:         sub.routingNumber ? String(sub.routingNumber).split('') : Array(9).fill(''),
    accountType:     sub.accountType === '1' ? 'checking' : sub.accountType === '2' ? 'savings' : '',
    accountNumber:   sub.accountNumber || '',
    sig_signature:   sub.sigSignature || '',
    sig_date:        sub.sigDate || '',
    sig_name_title:  sub.sigNameTitle || '',
    taxpayer_pin:    sub.taxpayerPin || '',
    sig_first_name:  sub.sigFirstName || '',
    sig_last_name:   sub.sigLastName  || '',
    prep_name:       sub.prepName || '',
    prep_signature:  '',
    prep_date:       sub.prepDate || '',
    prep_self_employed: !!sub.prepSelfEmployed,
    prep_ptin:       sub.prepPtin || '',
    prep_firm_name:  sub.prepFirmName || '',
    prep_firm_ein:   sub.prepFirmEin || '',
    prep_phone:      sub.prepPhone || '',
    prep_firm_address: sub.prepFirmAddress || '',
  };
}

function computeLine19cFromRows(rows, bondType) {
  if (!rows || !SCHEDULE_A_BOND_TYPES.has(bondType)) return NaN;
  return rows.reduce((sum, row) => {
    const colB = parseDollar(row.colBActualInterest);
    const colC = parseDollar(row.colCCreditRateInterest);
    if (isNaN(colB) || isNaN(colC)) return sum;
    const colE = (bondType === '102' || bondType === '103')
      ? Math.min(colB, colC * 0.70)
      : Math.min(colB, colC);
    return sum + colE;
  }, 0);
}

function computeCalculations(fd) {
  const v19a = parseDollar(fd.line19a);
  const bondType = fd.line17c || '';
  const computedLine19c = SCHEDULE_A_BOND_TYPES.has(bondType)
    ? computeLine19cFromRows(fd.scheduleARows, bondType)
    : parseDollar(fd.line19c);
  const v19c = isNaN(computedLine19c) ? 0 : computedLine19c;
  const line20a = bondType === '109' ? v19a * 0.35 : 0;
  const line20b = bondType === '110' ? v19a * 0.45 : 0;
  const line20c = bondType === '102' ? Math.min(v19a, v19c) : 0;
  const line20d = bondType === '103' ? Math.min(v19a, v19c) : 0;
  const line20e = bondType === '104' ? Math.min(v19a, v19c) : 0;
  const line20f = bondType === '105' ? Math.min(v19a, v19c) : 0;
  const applicable20 = line20a || line20b || line20c || line20d || line20e || line20f;
  const v21a = parseDollar(fd.line21a);
  const v21b = parseDollar(fd.line21b);
  const line22 = applicable20 + (isNaN(v21a) ? 0 : v21a) - (isNaN(v21b) ? 0 : v21b);
  return { line20a, line20b, line20c, line20d, line20e, line20f, line22, line19c: computedLine19c };
}

const STEPS = [
  { id: 1, label: 'Part I',   title: 'Entity Receiving Payment' },
  { id: 2, label: 'Part II',  title: 'Reporting Authority' },
  { id: 3, label: 'Part III', title: 'Payment of Credit' },
  { id: 4, label: 'Part IV',  title: 'Signature & Deposit' },
  { id: 5, label: 'Step 5',   title: 'Submission Fee' },
];

function Stepper({ current }) {
  return (
    <div className="stepper">
      {STEPS.map((step, idx) => {
        const done   = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="stepper-item">
            {idx > 0 && (
              <div className={`stepper-line ${done || active ? 'stepper-line--done' : ''}`} />
            )}
            <div className={`stepper-circle ${active ? 'active' : done ? 'done' : ''}`}>
              {done ? '✓' : step.id}
            </div>
            <div className="stepper-labels">
              <span className={`stepper-step-label ${active ? 'active' : ''}`}>{step.label}</span>
              <span className="stepper-step-title">{step.title}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`stepper-line stepper-line--right ${done ? 'stepper-line--done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// View modes
const VIEW_DASHBOARD = 'dashboard';
const VIEW_EDITOR    = 'editor';
const VIEW_DETAIL    = 'detail';

export default function FormApp() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuth();

  // List state
  const [allForms,       setAllForms]       = useState([]);
  const [activeCategory, setActiveCategory] = useState('in-progress');

  // View routing
  const [viewMode,       setViewMode]       = useState(VIEW_DASHBOARD);
  const [viewingId,      setViewingId]      = useState(null); // for detail view

  // Editor state
  const [formData,       setFormData]       = useState(INITIAL_STATE);
  const [currentStep,    setCurrentStep]    = useState(1);
  const [draftId,        setDraftId]        = useState(null);
  const [saving,         setSaving]         = useState(false);
  const [saveError,      setSaveError]      = useState('');
  const [errors,         setErrors]         = useState({});

  const calculations = computeCalculations(formData);

  // Derived counts
  const inProgressCount  = allForms.filter(f => f.status === 'DRAFT').length;
  const transmittedCount = allForms.filter(f => f.status === 'SUBMITTED').length;
  const counts = { 'in-progress': inProgressCount, 'ready': 0, 'transmitted': transmittedCount };

  const categoryForms = {
    'in-progress': allForms.filter(f => f.status === 'DRAFT'),
    'ready':       [],
    'transmitted': allForms.filter(f => f.status === 'SUBMITTED'),
  }[activeCategory] || [];

  const refreshForms = () => {
    getMyForms().then(({ data }) => setAllForms(data)).catch(() => {});
  };

  useEffect(() => { refreshForms(); }, []);

  // Create a brand-new draft
  const startNewDraft = () => {
    setSaveError('');
    createDraft()
      .then(({ data }) => {
        setDraftId(data.id);
        setFormData(INITIAL_STATE);
        setCurrentStep(1);
        setErrors({});
        setViewMode(VIEW_EDITOR);
        refreshForms();
      })
      .catch(() => setSaveError('Could not start a new draft. Please refresh.'));
  };

  // Load an existing draft into the editor
  const continueForm = async id => {
    try {
      const { data: sub } = await getFormById(id);
      setFormData(apiToFormData(sub));
      setDraftId(id);
      setCurrentStep(1);
      setErrors({});
      setSaveError('');
      setViewMode(VIEW_EDITOR);
    } catch {
      setSaveError('Could not load this filing.');
    }
  };

  // View a submitted filing detail
  const viewDetail = id => {
    setViewingId(id);
    setViewMode(VIEW_DETAIL);
  };

  const exitToDashboard = () => {
    setViewMode(VIEW_DASHBOARD);
    setViewingId(null);
    refreshForms();
  };

  // Delete a draft
  const handleDeleteForm = async id => {
    try {
      await deleteForm(id);
      refreshForms();
    } catch {
      alert('Could not delete this filing.');
    }
  };

  const handleChange = updated => setFormData(updated);

  const goPrev = () => {
    setErrors({});
    setCurrentStep(s => Math.max(s - 1, 1));
  };

  const goNext = async () => {
    if (!draftId) return;
    let stepErrors = {};
    if (currentStep === 1) stepErrors = validateStep1(formData);
    else if (currentStep === 2) stepErrors = validateStep2(formData);
    else if (currentStep === 3) stepErrors = validateStep3(formData);
    else if (currentStep === 4) stepErrors = validateStep4(formData);
    if (Object.keys(stepErrors).length > 0) { setErrors(stepErrors); return; }
    setErrors({});
    setSaveError('');
    setSaving(true);
    try {
      const n  = v => (v === '' || v === null || v === undefined) ? null : v;
      const tf = v => v === 'true' || v === 'yes' ? 'true' : v === 'false' || v === 'no' ? 'false' : null;

      if (currentStep === 1) {
        const city4  = (formData.line4_city  || '').trim();
        const state4 = (formData.line4_state || '').trim();
        const zip4   = (formData.line4_zip   || '').trim();
        const line4  = [city4, state4 ? `${state4} ${zip4}` : zip4].filter(Boolean).join(', ');
        await savePartI(draftId, {
          line1: formData.line1, line2: formData.line2,
          line3Street: formData.line3_street, line3Room: n(formData.line3_room),
          line4, line5: n(formData.line5_name), line5Title: n(formData.line5_title),
          line6: formData.line6,
        });
      } else if (currentStep === 2) {
        const city11  = (formData.line11_city  || '').trim();
        const state11 = (formData.line11_state || '').trim();
        const zip11   = (formData.line11_zip   || '').trim();
        const line11  = [city11, state11 ? `${state11} ${zip11}` : zip11].filter(Boolean).join(', ');
        const line14  = formData.line14_is_none ? 'NONE' : formData.line14;
        await savePartII(draftId, {
          line7: n(formData.line7), line8: n(formData.line8),
          line9Street: n(formData.line9_street), line9Room: n(formData.line9_room),
          line10: formData.line10, line11: n(line11),
          line12: formData.line12, line13: formData.line13, line14,
          line15: n(formData.line15_name), line15Title: n(formData.line15_title),
          line16: n(formData.line16),
          line17a: formData.line17a, line17b: n(formData.line17b), line17c: formData.line17c,
        });
      } else if (currentStep === 3) {
        const usesSchedA = SCHEDULE_A_BOND_TYPES.has(formData.line17c);
        const line19cVal = usesSchedA
          ? (isNaN(calculations.line19c) ? null : String(calculations.line19c.toFixed(2)))
          : n(formData.line19c);
        await savePartIII(draftId, {
          line18: formData.line18, line19a: formData.line19a,
          line19b: n(formData.line19b), line19c: line19cVal,
          line20Type: BOND_TYPE_TO_LINE20[formData.line17c] || null,
          line21a: n(formData.line21a), line21b: n(formData.line21b),
          line21cCode: n(formData.line21c_code), line21cDate: n(formData.line21c_date),
          line22: calculations.line22 || null,
          line23a: tf(formData.line23a), line23b: n(formData.line23b),
          line24a: tf(formData.line24a), line24b: n(formData.line24b),
          line25: tf(formData.line25),
        });
        if (usesSchedA) {
          const rowsToSave = (formData.scheduleARows || [])
            .filter(r => r.colAMaturityDate || r.colBActualInterest || r.colCCreditRateInterest)
            .map(r => ({
              colAMaturityDate: r.colAMaturityDate || null,
              colBActualInterest: parseFloat(r.colBActualInterest) || 0,
              colCCreditRateInterest: parseFloat(r.colCCreditRateInterest) || 0,
            }));
          if (rowsToSave.length > 0) await saveScheduleA(draftId, rowsToSave);
        }
      } else if (currentStep === 4) {
        await Promise.all([
          saveDeposit(draftId, {
            routingNumber: (formData.routing || []).join('') || null,
            accountType: formData.accountType === 'checking' ? '1'
                       : formData.accountType === 'savings'  ? '2' : null,
            accountNumber: n(formData.accountNumber),
          }),
          saveSignature(draftId, {
            sigSignature: formData.sig_signature,
            sigDate: formData.sig_date,
            sigNameTitle: n(formData.sig_name_title),
            taxpayerPin: n(formData.taxpayer_pin),
            sigFirstName: n(formData.sig_first_name),
            sigLastName:  n(formData.sig_last_name),
          }),
          savePreparer(draftId, {
            prepName: n(formData.prep_name), prepSignature: n(formData.prep_signature),
            prepDate: n(formData.prep_date), prepSelfEmployed: !!formData.prep_self_employed,
            prepPtin: n(formData.prep_ptin), prepFirmName: n(formData.prep_firm_name),
            prepFirmEin: n(formData.prep_firm_ein), prepPhone: n(formData.prep_phone),
            prepFirmAddress: n(formData.prep_firm_address),
          }),
        ]);
      }
      setCurrentStep(s => Math.min(s + 1, 5));
    } catch (err) {
      const detail = err?.response?.data;
      if (detail?.errors?.length) {
        setSaveError(detail.errors.map(e => `${e.field}: ${e.message}`).join(' | '));
      } else if (detail?.message) {
        setSaveError(detail.message);
      } else {
        setSaveError('Failed to save this section. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    clearAuth();
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar no-print">
        <span className="navbar-title">
          Form 8038-CP — Return for Credit Payments to Issuers of Qualified Bonds
        </span>
        <div className="navbar-actions">
          {user && <span className="navbar-user">{user.fullName || user.email}</span>}
          <button className="btn-print" onClick={() => navigate('/app/change-password')}>
            Change Password
          </button>
          <button className="btn-print" onClick={() => window.print()}>
            Print / Save as PDF
          </button>
          <button className="btn-logout" onClick={handleLogout}>Sign out</button>
        </div>
      </nav>

      <div className="app-shell no-print">
        <SubmissionsSidebar
          activeCategory={activeCategory}
          onCategoryChange={cat => { setActiveCategory(cat); setViewMode(VIEW_DASHBOARD); }}
          counts={counts}
        />

        <div className="app-main">

          {/* Dashboard list view */}
          {viewMode === VIEW_DASHBOARD && (
            <Dashboard
              category={activeCategory}
              forms={categoryForms}
              onContinue={continueForm}
              onView={viewDetail}
              onDelete={handleDeleteForm}
              onCreate={startNewDraft}
            />
          )}

          {/* Read-only detail view for submitted forms */}
          {viewMode === VIEW_DETAIL && (
            <SubmissionDetail
              submissionId={viewingId}
              onClose={exitToDashboard}
            />
          )}

          {/* Form editor */}
          {viewMode === VIEW_EDITOR && (
            <>
              {/* Back to dashboard link */}
              <div className="editor-back-bar no-print">
                <button className="editor-back-btn" onClick={exitToDashboard}>
                  ← Back to Dashboard
                </button>
                <span className="editor-draft-id">Draft #{draftId}</span>
              </div>

              <div className="stepper-wrapper">
                <Stepper current={currentStep} />
                <div className="amended-row">
                  <div className="amended-check">
                    <input
                      type="checkbox"
                      id="amended"
                      checked={!!formData.isAmended}
                      onChange={e => setFormData({ ...formData, isAmended: e.target.checked })}
                    />
                    <label htmlFor="amended">Amended Return</label>
                  </div>
                </div>
              </div>

              {saveError && (
                <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '10px 20px', textAlign: 'center', fontSize: 14 }}>
                  {saveError}
                </div>
              )}

              <div className="form-page">
                <div className={currentStep === 1 ? 'step-panel step-panel--active' : 'step-panel print-show'}>
                  <PartI formData={formData} onChange={handleChange} errors={errors} />
                </div>
                <div className={currentStep === 2 ? 'step-panel step-panel--active' : 'step-panel print-show'}>
                  <PartII formData={formData} onChange={handleChange} errors={errors} />
                </div>
                <div className={currentStep === 3 ? 'step-panel step-panel--active' : 'step-panel print-show'}>
                  <PartIII formData={formData} onChange={handleChange} calculations={calculations} errors={errors} />
                </div>
                <div className={currentStep === 4 ? 'step-panel step-panel--active' : 'step-panel print-show'}>
                  <DirectDeposit formData={formData} onChange={handleChange} errors={errors} />
                  <SignatureSection formData={formData} onChange={handleChange} errors={errors} />
                  <PaidPreparer formData={formData} onChange={handleChange} errors={errors} />
                </div>
                <div className={currentStep === 5 ? 'step-panel step-panel--active' : 'step-panel'}>
                  <SubmissionFee
                    formData={formData}
                    draftId={draftId}
                    isActive={currentStep === 5}
                    onSuccess={() => { refreshForms(); exitToDashboard(); }}
                  />
                </div>

                <div className="step-nav no-print">
                  <button className="step-btn step-btn--prev" onClick={goPrev} disabled={currentStep === 1}>
                    ← Previous
                  </button>
                  <span className="step-indicator">Step {currentStep} of {STEPS.length}</span>
                  {currentStep < STEPS.length && (
                    <button
                      className="step-btn step-btn--next"
                      onClick={goNext}
                      disabled={saving || !draftId}
                    >
                      {saving ? 'Saving…' : 'Next →'}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
