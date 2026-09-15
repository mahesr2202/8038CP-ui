import React from 'react';

function parseDollar(str) {
  if (str === '' || str === null || str === undefined) return NaN;
  return parseFloat(String(str).replace(/,/g, ''));
}

function fmtAmt(num) {
  if (isNaN(num) || num === null || num === undefined) return '—';
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const NEEDS_COL_D = new Set(['102', '103']);

function computeRow(row, bondType) {
  const colB = parseDollar(row.colBActualInterest);
  const colC = parseDollar(row.colCCreditRateInterest);
  const colD = NEEDS_COL_D.has(bondType) && !isNaN(colC) ? colC * 0.70 : null;
  let colE = NaN;
  if (!isNaN(colB) && !isNaN(colC)) {
    colE = NEEDS_COL_D.has(bondType) ? Math.min(colB, colD) : Math.min(colB, colC);
  }
  return { colB, colC, colD, colE };
}

function computeTotal(rows, bondType) {
  return rows.reduce((sum, row) => {
    const { colE } = computeRow(row, bondType);
    return isNaN(colE) ? sum : sum + colE;
  }, 0);
}

export { computeTotal };

const TH = ({ children, style = {} }) => (
  <th style={{
    padding: '8px 10px', fontSize: 11, fontWeight: 700, textAlign: 'center',
    background: '#F1F5F9', color: '#475569', borderBottom: '2px solid #CBD5E1',
    whiteSpace: 'normal', lineHeight: 1.3, ...style,
  }}>
    {children}
  </th>
);

const TD = ({ children, style = {} }) => (
  <td style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0', verticalAlign: 'middle', ...style }}>
    {children}
  </td>
);

export default function ScheduleA({ bondType, rows, onChange, errors = {} }) {
  const needsColD = NEEDS_COL_D.has(bondType);
  const total = computeTotal(rows, bondType);

  const addRow = () =>
    onChange([...rows, { colAMaturityDate: '', colBActualInterest: '', colCCreditRateInterest: '' }]);

  const removeRow = (idx) =>
    onChange(rows.filter((_, i) => i !== idx));

  const updateRow = (idx, field, value) =>
    onChange(rows.map((r, i) => i === idx ? { ...r, [field]: value } : r));

  return (
    <div style={{ margin: '0 0 24px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 10,
      }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
            Schedule A — Specified Tax Credit Bonds Interest Limit Computation
          </span>
          <span style={{ fontSize: 12, color: '#64748B', marginLeft: 8 }}>
            (required for bond type {bondType})
          </span>
        </div>
        <button
          type="button"
          onClick={addRow}
          style={{
            padding: '5px 14px', fontSize: 12, fontWeight: 600, borderRadius: 6,
            border: '1.5px solid #4F46E5', color: '#4F46E5', background: '#EEF2FF',
            cursor: 'pointer',
          }}
        >
          + Add row
        </button>
      </div>

      {errors.scheduleA && (
        <div style={{ color: '#DC2626', fontSize: 12, marginBottom: 8, fontWeight: 600 }}>
          {errors.scheduleA}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <TH style={{ width: 30 }}>#</TH>
              <TH style={{ minWidth: 130 }}>(a)<br />Bond maturity date</TH>
              <TH style={{ minWidth: 130 }}>(b)<br />Actual interest paid</TH>
              <TH style={{ minWidth: 130 }}>(c)<br />Interest at credit rate</TH>
              {needsColD && <TH style={{ minWidth: 120 }}>(d)<br />Col (c) × 70%</TH>}
              <TH style={{ minWidth: 120 }}>
                (e) Eligible interest
                {needsColD ? ' — min(b, d)' : ' — min(b, c)'}
              </TH>
              <TH style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={needsColD ? 7 : 6} style={{
                  padding: '16px', textAlign: 'center', color: '#94A3B8', fontSize: 13,
                }}>
                  No rows yet — click "+ Add row" to begin
                </td>
              </tr>
            )}
            {rows.map((row, idx) => {
              const { colB, colC, colD, colE } = computeRow(row, bondType);
              return (
                <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#F8FAFC' }}>
                  <TD style={{ textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>
                    {idx + 1}
                  </TD>
                  <TD>
                    <input
                      type="date"
                      value={row.colAMaturityDate || ''}
                      onChange={e => updateRow(idx, 'colAMaturityDate', e.target.value)}
                      style={{
                        width: '100%', padding: '5px 8px', fontSize: 12,
                        border: '1.5px solid #CBD5E1', borderRadius: 6, outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                  </TD>
                  <TD>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: '#64748B', fontSize: 12 }}>$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={row.colBActualInterest || ''}
                        onChange={e => updateRow(idx, 'colBActualInterest', e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="0.00"
                        style={{
                          width: '100%', padding: '5px 8px', fontSize: 12,
                          border: '1.5px solid #CBD5E1', borderRadius: 6, outline: 'none',
                          fontFamily: 'monospace',
                        }}
                      />
                    </div>
                  </TD>
                  <TD>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: '#64748B', fontSize: 12 }}>$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={row.colCCreditRateInterest || ''}
                        onChange={e => updateRow(idx, 'colCCreditRateInterest', e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="0.00"
                        style={{
                          width: '100%', padding: '5px 8px', fontSize: 12,
                          border: '1.5px solid #CBD5E1', borderRadius: 6, outline: 'none',
                          fontFamily: 'monospace',
                        }}
                      />
                    </div>
                  </TD>
                  {needsColD && (
                    <TD style={{ textAlign: 'right', fontFamily: 'monospace', color: '#475569' }}>
                      {!isNaN(colD) ? `$${fmtAmt(colD)}` : '—'}
                    </TD>
                  )}
                  <TD style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: !isNaN(colE) ? '#059669' : '#94A3B8' }}>
                    {!isNaN(colE) ? `$${fmtAmt(colE)}` : '—'}
                  </TD>
                  <TD style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      disabled={rows.length === 1}
                      style={{
                        border: 'none', background: 'none', cursor: rows.length === 1 ? 'not-allowed' : 'pointer',
                        color: rows.length === 1 ? '#CBD5E1' : '#EF4444', fontSize: 16, lineHeight: 1, padding: 2,
                      }}
                      title="Remove row"
                    >
                      ×
                    </button>
                  </TD>
                </tr>
              );
            })}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr style={{ background: '#F1F5F9' }}>
                <td colSpan={needsColD ? 5 : 4} style={{
                  padding: '8px 10px', fontSize: 12, fontWeight: 700, color: '#475569', textAlign: 'right',
                }}>
                  Total (line 3 → Form 8038-CP line 19c)
                </td>
                <td style={{
                  padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace',
                  fontWeight: 700, fontSize: 14, color: '#1E293B',
                }}>
                  ${fmtAmt(total)}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>
        {needsColD
          ? 'Col (d) = col (c) × 70%. Col (e) = smaller of col (b) or col (d).'
          : 'Col (e) = smaller of col (b) or col (c). Col (d) does not apply for this bond type.'}
        {' '}Total flows automatically to line 19c.
      </div>
    </div>
  );
}
