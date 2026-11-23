import React from 'react';
import {
  Download,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SettingsView({ habits = [], logs = [], onOpenAuthModal }) {
  const { user, signOut } = useAuth();

  const exportDataJson = () => {
    const exportPayload = {
      exportDate: new Date().toISOString(),
      userEmail: user?.email,
      habits,
      logs
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `personal-streak-tracker-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account preferences and personal data backups</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Account Details Card */}
        <div className="surface-card">
          <h3 className="section-title">
            <span>User Account</span>
            <User size={18} style={{ color: 'var(--text-subtle)' }} />
          </h3>

          {user ? (
            <div>
              <div className="account-details-grid">
                <span className="account-label">Email:</span>
                <strong className="account-val">{user.email}</strong>

                <span className="account-label">User ID:</span>
                <code className="account-code">
                  {user.id}
                </code>

                <span className="account-label">Account Created:</span>
                <span className="account-val">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <button className="btn btn-secondary" onClick={() => signOut()}>
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                You are currently browsing as a guest. Sign in or register to isolate and securely store your habit data.
              </p>
              <button className="btn btn-primary" onClick={onOpenAuthModal}>
                Sign In or Register
              </button>
            </div>
          )}
        </div>

        {/* Data Backup & Export Card */}
        <div className="surface-card">
          <h3 className="section-title">
            <span>Data Backup & Export</span>
            <Download size={18} style={{ color: 'var(--text-subtle)' }} />
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
            Export all your habits and complete streak records as a formatted JSON document for personal archives.
          </p>
          <button className="btn btn-secondary" onClick={exportDataJson} disabled={habits.length === 0}>
            <Download size={15} />
            <span>Export Habits & History (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
