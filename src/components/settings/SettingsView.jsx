import React, { useState } from 'react';
import {
  Settings,
  Database,
  Download,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SettingsView({ habits = [], logs = [], onOpenAuthModal }) {
  const { user, signOut, isConfigured } = useAuth();
  const [copied, setCopied] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'Not set';

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

  const copySqlSchema = () => {
    const sqlText = `-- Supabase SQL Schema for Personal Streak Tracker
-- Run this in your Supabase SQL Editor:
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text default '',
  category text not null default 'General',
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly')),
  target_days_per_week integer not null default 7 check (target_days_per_week between 1 and 7),
  start_date date not null default current_date,
  color text not null default '#3b82f6',
  icon text not null default 'check-circle',
  is_archived boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.habit_logs (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references public.habits(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  completed_date date not null,
  notes text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_habit_date unique (habit_id, completed_date)
);

alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Users can view their own habits" on public.habits for select using (auth.uid() = user_id);
create policy "Users can create their own habits" on public.habits for insert with check (auth.uid() = user_id);
create policy "Users can update their own habits" on public.habits for update using (auth.uid() = user_id);
create policy "Users can delete their own habits" on public.habits for delete using (auth.uid() = user_id);

create policy "Users can view their own habit logs" on public.habit_logs for select using (auth.uid() = user_id);
create policy "Users can log completions for their habits" on public.habit_logs for insert with check (
  auth.uid() = user_id and exists (select 1 from public.habits where habits.id = habit_logs.habit_id and habits.user_id = auth.uid())
);
create policy "Users can delete their own habit logs" on public.habit_logs for delete using (auth.uid() = user_id);
`;
    navigator.clipboard.writeText(sqlText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings & Database</h1>
          <p className="page-subtitle">Manage your account, database connection, and data backups</p>
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
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                <strong>{user.email}</strong>

                <span style={{ color: 'var(--text-muted)' }}>User ID:</span>
                <code style={{ fontSize: '0.8rem', background: 'var(--bg-subtle)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  {user.id}
                </code>

                <span style={{ color: 'var(--text-muted)' }}>Account Created:</span>
                <span>{new Date(user.created_at).toLocaleDateString()}</span>
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

        {/* Database Connection Card */}
        <div className="surface-card">
          <h3 className="section-title">
            <span>Supabase Database Connection</span>
            <Database size={18} style={{ color: 'var(--primary)' }} />
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            {isConfigured ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: 'var(--success-light)',
                  color: 'var(--success-text)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <CheckCircle2 size={14} />
                <span>Configured</span>
              </div>
            ) : (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: 'var(--danger-light)',
                  color: 'var(--danger-text)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <AlertCircle size={14} />
                <span>Configuration Needed</span>
              </div>
            )}
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Project: {supabaseUrl}
            </span>
          </div>

          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
            Your application connects directly to Supabase PostgreSQL with Row Level Security (RLS). All habit
            records are strictly isolated to your user account.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={copySqlSchema}>
              <Copy size={15} />
              <span>{copied ? 'SQL Schema Copied!' : 'Copy SQL Schema Script'}</span>
            </button>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ textDecoration: 'none' }}
            >
              <span>Open Supabase Console</span>
              <ExternalLink size={14} />
            </a>
          </div>
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
