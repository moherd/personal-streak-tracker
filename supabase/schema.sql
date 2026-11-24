-- ==============================================================================
-- PERSONAL STREAK TRACKER - SUPABASE SQL SCHEMA
-- Paste this entire script into your Supabase SQL Editor and click "Run".
-- ==============================================================================

create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. HABITS TABLE
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

-- 3. HABIT LOGS (COMPLETIONS) TABLE
create table if not exists public.habit_logs (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references public.habits(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  completed_date date not null,
  notes text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_habit_date unique (habit_id, completed_date)
);

-- INDEXES
create index if not exists idx_habits_user_id on public.habits(user_id);
create index if not exists idx_habits_archived on public.habits(user_id, is_archived);
create index if not exists idx_habit_logs_habit_id on public.habit_logs(habit_id);
create index if not exists idx_habit_logs_user_date on public.habit_logs(user_id, completed_date);

-- PERMISSIONS
grant usage on schema public to anon, authenticated;
grant all on table public.profiles to authenticated;
grant select on table public.profiles to anon;
grant all on table public.habits to authenticated;
grant select on table public.habits to anon;
grant all on table public.habit_logs to authenticated;
grant select on table public.habit_logs to anon;
grant all on all sequences in schema public to authenticated;

-- ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

-- PROFILES POLICIES
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

-- HABITS POLICIES
drop policy if exists "Users can view their own habits" on public.habits;
create policy "Users can view their own habits" on public.habits for select using (auth.uid() = user_id);

drop policy if exists "Users can create their own habits" on public.habits;
create policy "Users can create their own habits" on public.habits for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own habits" on public.habits;
create policy "Users can update their own habits" on public.habits for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own habits" on public.habits;
create policy "Users can delete their own habits" on public.habits for delete using (auth.uid() = user_id);

-- HABIT LOGS POLICIES
drop policy if exists "Users can view their own habit logs" on public.habit_logs;
create policy "Users can view their own habit logs" on public.habit_logs for select using (auth.uid() = user_id);

drop policy if exists "Users can log completions for their habits" on public.habit_logs;
create policy "Users can log completions for their habits" on public.habit_logs for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.habits
    where habits.id = habit_logs.habit_id
    and habits.user_id = auth.uid()
  )
);

drop policy if exists "Users can update their own habit logs" on public.habit_logs;
create policy "Users can update their own habit logs" on public.habit_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own habit logs" on public.habit_logs;
create policy "Users can delete their own habit logs" on public.habit_logs for delete using (auth.uid() = user_id);

-- TRIGGERS
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists set_habits_updated_at on public.habits;
create trigger set_habits_updated_at
  before update on public.habits for each row execute procedure public.handle_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles for each row execute procedure public.handle_updated_at();
