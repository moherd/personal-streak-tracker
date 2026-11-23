import React from 'react';

export default function StatCard({ label, value, subtext, icon: Icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        {Icon && <Icon className="stat-icon" style={{ color: color || 'var(--text-subtle)' }} />}
      </div>
      <div className="stat-value">{value}</div>
      {subtext && <div className="stat-subtext">{subtext}</div>}
    </div>
  );
}
