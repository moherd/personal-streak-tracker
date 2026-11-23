import React from 'react';
import {
  Flame,
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  Settings,
  LogIn,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, onOpenAuthModal }) {
  const { user, signOut, isConfigured } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'habits', label: 'Habits', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <header className="navbar">
      <div className="nav-wrapper">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div className="nav-brand" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
            <Flame className="nav-brand-icon" />
            <span>StreakTracker</span>
          </div>

          <nav className="nav-tabs" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="nav-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="user-badge" title={user.email}>
                <User size={14} />
                <span>{user.email?.split('@')[0]}</span>
              </div>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                onClick={() => signOut()}
                title="Sign Out"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
              onClick={onOpenAuthModal}
            >
              <LogIn size={15} />
              <span>{isConfigured ? 'Sign In / Register' : 'Setup Supabase'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
