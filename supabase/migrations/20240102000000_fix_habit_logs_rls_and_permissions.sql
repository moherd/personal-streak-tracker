-- ==============================================================================
-- MIGRATION: Fix habit_logs Table Permissions and Row Level Security (RLS)
-- File: supabase/migrations/20240102000000_fix_habit_logs_rls_and_permissions.sql
-- ==============================================================================

-- 1. Grant table and schema usage permissions to authenticated and anon roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT ALL ON TABLE public.habit_logs TO authenticated;
GRANT SELECT ON TABLE public.habit_logs TO anon;

GRANT ALL ON TABLE public.habits TO authenticated;
GRANT SELECT ON TABLE public.habits TO anon;

GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.profiles TO anon;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 2. Ensure Row Level Security is active
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Reset and recreate strict RLS policies on habit_logs
DROP POLICY IF EXISTS "Users can view their own habit logs" ON public.habit_logs;
CREATE POLICY "Users can view their own habit logs"
  ON public.habit_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can log completions for their habits" ON public.habit_logs;
CREATE POLICY "Users can log completions for their habits"
  ON public.habit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.habits h
      WHERE h.id = habit_id
      AND h.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own habit logs" ON public.habit_logs;
CREATE POLICY "Users can update their own habit logs"
  ON public.habit_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own habit logs" ON public.habit_logs;
CREATE POLICY "Users can delete their own habit logs"
  ON public.habit_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Ensure unique constraint exists on (habit_id, completed_date)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_habit_date'
  ) THEN
    ALTER TABLE public.habit_logs ADD CONSTRAINT unique_habit_date UNIQUE (habit_id, completed_date);
  END IF;
END $$;
