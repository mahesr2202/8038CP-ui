const CATEGORIES = [
  { key: 'in-progress', label: 'In-Progress Returns',  icon: '📋' },
  { key: 'ready',       label: 'Ready to E-file',      icon: '📄' },
  { key: 'transmitted', label: 'Transmitted Returns',   icon: '📤' },
];

export default function SubmissionsSidebar({ activeCategory, onCategoryChange, counts }) {
  return (
    <aside className="submissions-sidebar">
      <div className="sidebar-list">
        <div className="sidebar-section-label">My Filings</div>
        {CATEGORIES.map(cat => (
          <div
            key={cat.key}
            className={`sidebar-cat-item${activeCategory === cat.key ? ' sidebar-cat-item--active' : ''}`}
            onClick={() => onCategoryChange(cat.key)}
          >
            <span className="sidebar-cat-icon">{cat.icon}</span>
            <span className="sidebar-cat-label">{cat.label}</span>
            <span
              className="sidebar-cat-count"
              style={{
                background: counts[cat.key] > 0 ? '#3B82F6' : '#E2E8F0',
                color: counts[cat.key] > 0 ? '#fff' : '#94A3B8',
              }}
            >
              {counts[cat.key] ?? 0}
            </span>
          </div>
        ))}

        <div className="sidebar-divider" />

        <div className="sidebar-cat-item sidebar-cat-item--link">
          <span className="sidebar-cat-icon">📅</span>
          <span className="sidebar-cat-label">Know your due date</span>
        </div>
      </div>
    </aside>
  );
}
