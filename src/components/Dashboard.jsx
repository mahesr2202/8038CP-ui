import { useState, useMemo } from 'react';

const BOND_FULL = {
  '102': 'New Clean Renewable Energy Bonds',
  '103': 'Qualified Energy Conservation Bonds',
  '104': 'Qualified Zone Academy Bonds',
  '105': 'Qualified School Construction Bonds',
  '109': 'Build America Bonds',
  '110': 'Recovery Zone Economic Development Bonds',
};

const STATUS_BADGE = {
  DRAFT:       { label: 'Yet To Audit', color: '#D97706', bg: '#FEF3C7', border: '#FCD34D' },
  DRAFT_BLANK: { label: 'Incomplete',   color: '#9333EA', bg: '#F3E8FF', border: '#D8B4FE' },
  SUBMITTED:   { label: 'Transmitted',  color: '#059669', bg: '#D1FAE5', border: '#6EE7B7' },
};

function isBlankDraft(sub) {
  return sub.status === 'DRAFT' && !sub.line1 && !sub.line7 && !sub.line13;
}

const CATEGORY_LABELS = {
  'in-progress': 'In-Progress Returns',
  'ready':       'Ready to E-file',
  'transmitted': 'Transmitted Returns',
};

const CATEGORY_DESC = {
  'in-progress': "Here are the 8038-CP returns that you've started but haven't completed yet. Click 'Continue Filing' to proceed further.",
  'ready':       'These returns are complete and ready to be e-filed.',
  'transmitted': 'These 8038-CP returns have been successfully transmitted.',
};

function fmtDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function getYear(dateStr) {
  if (!dateStr) return '';
  const m = String(dateStr).match(/(\d{4})/);
  return m ? m[1] : '';
}

function returnNum(id) {
  return `8038CP-${String(id).padStart(8, '0')}`;
}

const COLS = [
  { key: 'line7',  label: 'Reporting Authority',       tip: 'Saved at Step 2 — Part II' },
  { key: 'line1',  label: 'Entity to Receive Payment', tip: 'Saved at Step 1 — Part I' },
  { key: 'line13', label: 'Name of Issue',             tip: 'Saved at Step 2 — Part II' },
  { key: 'line10', label: 'Report Number',             tip: 'Saved at Step 2 — Part II' },
  { key: 'line18', label: 'Interest Payment Year',     tip: 'Saved at Step 3 — Part III' },
  { key: 'id',     label: 'Return Number',             tip: null },
  { key: 'status', label: 'Status',                    tip: null },
  { key: null,     label: 'Action',                    tip: null },
];

export default function Dashboard({ category, forms, onContinue, onView, onDelete, onCreate }) {
  const [filterAuthority, setFilterAuthority] = useState('');
  const [filterYear,      setFilterYear]      = useState('');
  const [filterBond,      setFilterBond]      = useState('');
  const [searchText,      setSearchText]      = useState('');
  const [pageSize,        setPageSize]        = useState(10);
  const [sortKey,         setSortKey]         = useState(null);
  const [sortDir,         setSortDir]         = useState('asc');
  const [applied,         setApplied]         = useState({ authority: '', year: '', bond: '' });

  const authorities = useMemo(() => [...new Set(forms.map(f => f.line7).filter(Boolean))], [forms]);
  const years       = useMemo(() => [...new Set(forms.map(f => getYear(f.line18)).filter(Boolean))].sort().reverse(), [forms]);

  const filtered = useMemo(() => {
    let list = [...forms];
    if (applied.authority) list = list.filter(f => f.line7 === applied.authority);
    if (applied.year)      list = list.filter(f => getYear(f.line18) === applied.year);
    if (applied.bond)      list = list.filter(f => f.line17c === applied.bond);
    if (searchText) {
      const q = searchText.toLowerCase();
      list = list.filter(f =>
        (f.line7  || '').toLowerCase().includes(q) ||
        (f.line1  || '').toLowerCase().includes(q) ||
        (f.line13 || '').toLowerCase().includes(q) ||
        (f.line10 || '').toLowerCase().includes(q)
      );
    }
    if (sortKey) {
      list.sort((a, b) => {
        const va = String(a[sortKey] ?? '');
        const vb = String(b[sortKey] ?? '');
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }
    return list.slice(0, pageSize);
  }, [forms, applied, searchText, sortKey, sortDir, pageSize]);

  const handleSort = key => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this draft filing? This cannot be undone.')) return;
    onDelete(id);
  };

  const SortArrow = ({ k }) => {
    if (!k) return null;
    if (sortKey !== k) return <span style={{ color: '#CBD5E1', marginLeft: 4, fontSize: 11 }}>⇅</span>;
    return <span style={{ color: '#4F46E5', marginLeft: 4, fontSize: 11 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">{CATEGORY_LABELS[category] || 'Returns'}</h2>
          <p className="dashboard-desc">{CATEGORY_DESC[category] || ''}</p>
        </div>
        <button className="dashboard-create-btn" onClick={onCreate}>
          Create New Form 8038CP
        </button>
      </div>

      {/* Filters */}
      <div className="dashboard-filters">
        <div className="dashboard-filter-group">
          <label className="dashboard-filter-label">Reporting Authority:</label>
          <select className="dashboard-filter-select" value={filterAuthority} onChange={e => setFilterAuthority(e.target.value)}>
            <option value="">All Organizations</option>
            {authorities.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="dashboard-filter-group">
          <label className="dashboard-filter-label">Interest Payment Year:</label>
          <select className="dashboard-filter-select" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
            <option value="">All Interest Payment Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="dashboard-filter-group">
          <label className="dashboard-filter-label">Type of Bond:</label>
          <select className="dashboard-filter-select" value={filterBond} onChange={e => setFilterBond(e.target.value)}>
            <option value="">All</option>
            {Object.entries(BOND_FULL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <button
          className="dashboard-go-btn"
          onClick={() => setApplied({ authority: filterAuthority, year: filterYear, bond: filterBond })}
        >
          Go
        </button>
      </div>

      {/* Table toolbar */}
      <div className="dashboard-table-controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#64748B' }}>Showing</span>
          <select className="dashboard-page-size" value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span style={{ fontSize: 13, color: '#64748B' }}>Entries</span>
        </div>
        <div className="dashboard-search-wrap">
          <input
            className="dashboard-search"
            type="text"
            placeholder="Search…"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          <span className="dashboard-search-icon">🔍</span>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="dashboard-table">
          <thead>
            <tr>
              {COLS.map(col => (
                <th
                  key={col.label}
                  className="dashboard-th"
                  onClick={col.key ? () => handleSort(col.key) : undefined}
                  title={col.tip || undefined}
                  style={{ cursor: col.key ? 'pointer' : 'default', userSelect: 'none' }}
                >
                  {col.label}<SortArrow k={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div style={{ textAlign: 'center', padding: '48px 16px' }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>
                      {category === 'in-progress' ? '📋' : category === 'transmitted' ? '📤' : '📄'}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                      {category === 'in-progress' && 'No in-progress returns'}
                      {category === 'ready'       && 'No returns ready to e-file'}
                      {category === 'transmitted' && 'No transmitted returns'}
                    </div>
                    <div style={{ fontSize: 13, color: '#94A3B8' }}>
                      {category === 'in-progress' && 'Click "Create New Form 8038CP" to start a new filing.'}
                      {category === 'transmitted' && 'Submitted filings will appear here after payment.'}
                    </div>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map(sub => {
              const blank = isBlankDraft(sub);
              const badge = blank ? STATUS_BADGE.DRAFT_BLANK
                          : STATUS_BADGE[sub.status] || STATUS_BADGE.DRAFT;
              const empty = val => val
                ? <span>{val}</span>
                : <span style={{ color: '#CBD5E1', fontSize: 12, fontStyle: 'italic' }}>—</span>;
              return (
                <tr key={sub.id} className="dashboard-tr">
                  <td className="dashboard-td">
                    {sub.line7
                      ? <span className="dashboard-link">{sub.line7}</span>
                      : <span style={{ color: '#CBD5E1', fontSize: 12, fontStyle: 'italic' }}>Not saved yet</span>}
                  </td>
                  <td className="dashboard-td">
                    {sub.line1
                      ? <span className="dashboard-link">{sub.line1}</span>
                      : <span style={{ color: '#CBD5E1', fontSize: 12, fontStyle: 'italic' }}>Not saved yet</span>}
                  </td>
                  <td className="dashboard-td">{empty(sub.line13)}</td>
                  <td className="dashboard-td">{empty(sub.line10)}</td>
                  <td className="dashboard-td">{empty(getYear(sub.line18))}</td>
                  <td className="dashboard-td">
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1E293B' }}>{returnNum(sub.id)}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{fmtDateTime(sub.createdAt)}</div>
                  </td>
                  <td className="dashboard-td">
                    <span className="dashboard-status-badge" style={{ color: badge.color, background: badge.bg, border: `1px solid ${badge.border}` }}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="dashboard-td">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {sub.status === 'DRAFT' && (
                        <button className="dashboard-continue-btn" onClick={() => onContinue(sub.id)}>
                          {blank ? 'Start Filing ›' : 'Continue Filing ›'}
                        </button>
                      )}
                      {sub.status === 'SUBMITTED' && (
                        <button className="dashboard-continue-btn dashboard-continue-btn--view" onClick={() => onView(sub.id)}>
                          View ›
                        </button>
                      )}
                      {sub.status === 'DRAFT' && (
                        <button className="dashboard-delete-btn" onClick={() => handleDelete(sub.id)} title="Delete">
                          🗑
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div className="dashboard-footer">
        Showing 1 to {filtered.length} of {forms.length} Entries
      </div>
    </div>
  );
}
