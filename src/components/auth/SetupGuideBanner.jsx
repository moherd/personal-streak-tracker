import React from 'react';
import { Database, AlertTriangle, ExternalLink } from 'lucide-react';

export default function SetupGuideBanner({ onOpenSettings }) {
  return (
    <div className="setup-banner">
      <AlertTriangle className="setup-banner-icon" size={24} />
      <div className="setup-banner-content" style={{ flex: 1 }}>
        <h3>Connect Your Supabase Database</h3>
        <p>
          To persist your habits, streaks, and authentication data securely in PostgreSQL, configure your
          Supabase environment variables in <code>.env</code> and run the provided database migration.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            onClick={onOpenSettings}
          >
            <Database size={14} />
            <span>View Setup Instructions & SQL Schema</span>
          </button>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', textDecoration: 'none' }}
          >
            <span>Open Supabase Dashboard</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
