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
        <div
          className="nav-brand"
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveTab('dashboard')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setActiveTab('dashboard');
          }}
        >
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
                type="button"
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="nav-actions">
          {user ? (
            <div className="nav-user-group">
              <div className="user-badge" title={user.email}>
                <User size={14} />
                <span className="user-email-text">{user.email?.split('@')[0]}</span>
              </div>
              <button
                className="btn btn-secondary nav-action-btn"
                onClick={() => signOut()}
                title="Sign Out"
                type="button"
              >
                <LogOut size={14} />
                <span className="nav-action-text">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary nav-action-btn"
              onClick={onOpenAuthModal}
              type="button"
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
