import { useState, useEffect } from 'react';
import { getFormById, previewXml, downloadFormPdf, downloadScheduleAPdf } from '../lib/api.js';

const STATUS_CFG = {
  SUBMITTED: { label: 'Submitted', color: '#059669', bg: '#D1FAE5', border: '#6EE7B7' },
  DRAFT:     { label: 'Draft',     color: '#D97706', bg: '#FEF3C7', border: '#FCD34D' },
};

const BOND_LABELS = {
  '102': 'New Clean Renewable Energy Bonds (102)',
  '103': 'Qualified Energy Conservation Bonds (103)',
  '104': 'Qualified Zone Academy Bonds (104)',
  '105': 'Qualified School Construction Bonds (105)',
  '109': 'Build America Bonds (109)',
  '110': 'Recovery Zone Economic Development Bonds (110)',
};

const LINE20_LABELS = {
  '20A': 'Build America Bonds',
  '20B': 'Recovery Zone Economic Dev. Bonds',
  '20C': 'New Clean Renewable Energy Bonds',
  '20D': 'Qualified Energy Conservation Bonds',
  '20E': 'Qualified Zone Academy Bonds',
  '20F': 'Qualified School Construction Bonds',
};

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtAmt(val) {
  if (val === null || val === undefined || val === '') return '—';
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Row({ label, value }) {
  if (!value && value !== 0 && value !== false) return null;
  return (
    <div style={{ display: 'flex', gap: 12, padding: '7px 0', borderBottom: '1px solid #F1F5F9', alignItems: 'flex-start' }}>
      <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500, minWidth: 200, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#1E293B', fontWeight: 500, wordBreak: 'break-word' }}>{String(value)}</span>
    </div>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: 16, border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        borderLeft: '4px solid #4F46E5', background: '#EEF2FF',
        padding: '10px 18px',
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{title}</span>
        {subtitle && <span style={{ fontSize: 12, color: '#64748B', marginLeft: 'auto' }}>{subtitle}</span>}
      </div>
      <div style={{ padding: '4px 18px 10px' }}>{children}</div>
    </div>
  );
}

export default function SubmissionDetail({ submissionId, onClose }) {
  const [sub, setSub]             = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [xmlLoading, setXmlLoading]           = useState(false);
  const [pdfLoading, setPdfLoading]           = useState(false);
  const [scheduleALoading, setScheduleALoading] = useState(false);

  useEffect(() => {
    if (!submissionId) return;
    setLoading(true);
    setError(null);
    getFormById(submissionId)
      .then(({ data }) => setSub(data))
      .catch(() => setError('Could not load this submission.'))
      .finally(() => setLoading(false));
  }, [submissionId]);

  const downloadXml = async () => {
    setXmlLoading(true);
    try {
      const { data } = await previewXml(submissionId);
      const blob = new Blob([data], { type: 'application/xml' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `Form8038CP_${submissionId}.xml`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
    finally { setXmlLoading(false); }
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const res = await downloadFormPdf(submissionId);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `Form8038CP_${submissionId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert('Failed to download Form 8038-CP PDF.'); }
    finally { setPdfLoading(false); }
  };

  const handleDownloadScheduleAPdf = async () => {
    setScheduleALoading(true);
    try {
      const res = await downloadScheduleAPdf(submissionId);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `ScheduleA_8038CP_${submissionId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert('No Schedule A data found for this submission.'); }
    finally { setScheduleALoading(false); }
  };

  if (loading) return (
    <div style={{ padding: 48, textAlign: 'center', color: '#64748B', fontSize: 14 }}>
      Loading submission…
    </div>
  );

  if (error) return (
    <div style={{ padding: 48, textAlign: 'center', color: '#DC2626', fontSize: 14 }}>
      {error}
    </div>
  );

  if (!sub) return null;

  const cfg = STATUS_CFG[sub.status] || STATUS_CFG.DRAFT;
  const hasPartI        = sub.line1 || sub.line2;
  const hasPartII       = sub.line13 || sub.line10;
  const hasPartIII      = sub.line18 || sub.line19a;
  const hasDeposit      = sub.routingNumber;
  const hasSig          = sub.sigSignature;
  const hasPreparer     = sub.prepName;
  const hasScheduleA    = sub.scheduleARows && sub.scheduleARows.length > 0;

  return (
    <div style={{ maxWidth: 860, margin: '24px auto 60px', padding: '0 16px' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={onClose}
            style={{
              border: '1.5px solid #CBD5E1', background: '#fff', borderRadius: 8,
              padding: '6px 14px', fontSize: 13, fontWeight: 600, color: '#475569',
              cursor: 'pointer',
            }}
          >
            ← Back
          </button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1E293B' }}>
              Form 8038-CP &nbsp;
              <span style={{ fontSize: 13, fontWeight: 500, color: '#64748B' }}>
                #{sub.id}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
              Created {fmt(sub.createdAt)}
              {sub.submittedAt && <span> · Submitted {fmt(sub.submittedAt)}</span>}
              {sub.isAmended && <span style={{ color: '#D97706', fontWeight: 600 }}> · Amended</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{
            fontSize: 13, fontWeight: 700, borderRadius: 6, padding: '5px 14px',
            color: cfg.color, background: cfg.bg, border: `1.5px solid ${cfg.border}`,
          }}>
            {cfg.label}
          </span>
          {sub.status === 'SUBMITTED' && (
            <>
              <button
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
                style={{
                  background: '#4F46E5', color: '#fff', border: 'none', borderRadius: 7,
                  padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {pdfLoading ? 'Generating…' : 'Download PDF'}
              </button>
              <button
                onClick={handleDownloadScheduleAPdf}
                disabled={scheduleALoading}
                style={{
                  background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 7,
                  padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {scheduleALoading ? 'Generating…' : 'Download Schedule A PDF'}
              </button>
              <button
                onClick={downloadXml}
                disabled={xmlLoading}
                style={{
                  background: '#0F766E', color: '#fff', border: 'none', borderRadius: 7,
                  padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {xmlLoading ? 'Downloading…' : 'Download XML'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Part I */}
      {hasPartI && (
        <SectionCard title="Part I — Entity Receiving Payment" subtitle="Lines 1–6">
          <Row label="Line 1 — Entity name"        value={sub.line1} />
          <Row label="Line 2 — EIN"                value={sub.line2} />
          <Row label="Line 3 — Street address"     value={[sub.line3Street, sub.line3Room].filter(Boolean).join(', ')} />
          <Row label="Line 4 — City / State / ZIP" value={sub.line4} />
          <Row label="Line 5 — Contact person"     value={[sub.line5, sub.line5Title].filter(Boolean).join(' — ')} />
          <Row label="Line 6 — Phone"              value={sub.line6} />
        </SectionCard>
      )}

      {/* Part II */}
      {hasPartII && (
        <SectionCard title="Part II — Reporting Authority" subtitle="Lines 7–17c">
          <Row label="Line 7 — Issuer name"            value={sub.line7} />
          <Row label="Line 8 — Issuer EIN"             value={sub.line8} />
          <Row label="Line 9 — Street address"         value={[sub.line9Street, sub.line9Room].filter(Boolean).join(', ')} />
          <Row label="Line 10 — Report number"         value={sub.line10} />
          <Row label="Line 11 — City / State / ZIP"    value={sub.line11} />
          <Row label="Line 12 — Date of issue"         value={sub.line12} />
          <Row label="Line 13 — Name of issue"         value={sub.line13} />
          <Row label="Line 14 — CUSIP number"          value={sub.line14} />
          <Row label="Line 15 — Contact person"        value={[sub.line15, sub.line15Title].filter(Boolean).join(' — ')} />
          <Row label="Line 16 — Contact phone"         value={sub.line16} />
          <Row label="Line 17a — Bond rate type"       value={sub.line17a} />
          <Row label="Line 17b — Issue price"          value={sub.line17b ? fmtAmt(sub.line17b) : null} />
          <Row label="Line 17c — Bond type"            value={sub.line17c ? BOND_LABELS[sub.line17c] || sub.line17c : null} />
        </SectionCard>
      )}

      {/* Schedule A */}
      {hasScheduleA && (
        <SectionCard title="Schedule A — Interest Limit Computation" subtitle={`${sub.scheduleARows.length} row(s)`}>
          <div style={{ overflowX: 'auto', marginTop: 6 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {['#', '(a) Maturity date', '(b) Actual interest', '(c) Credit-rate interest', '(d) ×70%', '(e) Eligible'].map(h => (
                    <th key={h} style={{ padding: '6px 10px', borderBottom: '2px solid #E2E8F0', textAlign: h === '#' ? 'center' : 'right', color: '#475569', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sub.scheduleARows.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#F8FAFC' }}>
                    <td style={{ padding: '5px 10px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ padding: '5px 10px', textAlign: 'right' }}>{row.colAMaturityDate || '—'}</td>
                    <td style={{ padding: '5px 10px', textAlign: 'right', fontFamily: 'monospace' }}>{fmtAmt(row.colBActualInterest)}</td>
                    <td style={{ padding: '5px 10px', textAlign: 'right', fontFamily: 'monospace' }}>{fmtAmt(row.colCCreditRateInterest)}</td>
                    <td style={{ padding: '5px 10px', textAlign: 'right', fontFamily: 'monospace', color: '#64748B' }}>{row.colD70PctAmount != null ? fmtAmt(row.colD70PctAmount) : '—'}</td>
                    <td style={{ padding: '5px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#059669' }}>{fmtAmt(row.colEEligibleInterest)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#EEF2FF' }}>
                  <td colSpan={5} style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, fontSize: 12, color: '#475569' }}>
                    Total — Form 8038-CP line 19c
                  </td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: '#4F46E5' }}>
                    {fmtAmt(sub.scheduleARows.at(-1)?.line19cTotal ?? sub.line19c)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </SectionCard>
      )}

      {/* Part III */}
      {hasPartIII && (
        <SectionCard title="Part III — Payment of Credit" subtitle="Lines 18–25">
          <Row label="Line 18 — Interest payment date"        value={sub.line18} />
          <Row label="Line 19a — Interest payable"            value={fmtAmt(sub.line19a)} />
          <Row label="Line 19b — Applicable credit rate"      value={sub.line19b ? `${sub.line19b}%` : null} />
          <Row label="Line 19c — Schedule A total"            value={fmtAmt(sub.line19c)} />
          <Row label="Line 20 — Credit line"                  value={sub.line20Type ? `${sub.line20Type} — ${LINE20_LABELS[sub.line20Type] || ''}` : null} />
          <Row label="Line 21a — Net increase"                value={fmtAmt(sub.line21a)} />
          <Row label="Line 21b — Net decrease"                value={fmtAmt(sub.line21b)} />
          <Row label="Line 21c — Explanation code"            value={sub.line21cCode} />
          <Row label="Line 22 — Credit payment requested"     value={fmtAmt(sub.line22)} />
          <Row label="Line 23a — Debt service schedule change" value={sub.line23a === 'true' ? 'Yes' : sub.line23a === 'false' ? 'No' : null} />
          <Row label="Line 23b — Explanation code"            value={sub.line23b} />
          <Row label="Line 24a — Interest paid on time"       value={sub.line24a === 'true' ? 'Yes' : sub.line24a === 'false' ? 'No' : null} />
          <Row label="Line 24b — Explanation code"            value={sub.line24b} />
          <Row label="Line 25 — Final interest payment date"  value={sub.line25 === 'true' ? 'Yes' : sub.line25 === 'false' ? 'No' : null} />
        </SectionCard>
      )}

      {/* Direct Deposit */}
      {hasDeposit && (
        <SectionCard title="Direct Deposit">
          <Row label="Routing number"  value={sub.routingNumber} />
          <Row label="Account type"    value={sub.accountType === '1' ? 'Checking' : sub.accountType === '2' ? 'Savings' : sub.accountType} />
          <Row label="Account number"  value={sub.accountNumber ? `••••${sub.accountNumber.slice(-4)}` : null} />
        </SectionCard>
      )}

      {/* Signature */}
      {hasSig && (
        <SectionCard title="Signature">
          <Row label="Authorized signer"  value={sub.sigSignature} />
          <Row label="Title"              value={sub.sigNameTitle} />
          <Row label="Signature date"     value={sub.sigDate} />
        </SectionCard>
      )}

      {/* Paid Preparer */}
      {hasPreparer && (
        <SectionCard title="Paid Preparer">
          <Row label="Name"              value={sub.prepName} />
          <Row label="PTIN"              value={sub.prepPtin} />
          <Row label="Date"              value={sub.prepDate} />
          <Row label="Self-employed"     value={sub.prepSelfEmployed ? 'Yes' : null} />
          <Row label="Firm name"         value={sub.prepFirmName} />
          <Row label="Firm EIN"          value={sub.prepFirmEin} />
          <Row label="Phone"             value={sub.prepPhone} />
          <Row label="Firm address"      value={sub.prepFirmAddress} />
        </SectionCard>
      )}

    </div>
  );
}
