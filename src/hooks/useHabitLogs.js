import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getTodayDate } from '../utils/dateUtils';

export function useHabitLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingKeys, setPendingKeys] = useState(new Set());

  const fetchLogs = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) {
      setLogs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_date', { ascending: false });

      if (fetchError) throw fetchError;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching habit logs:', err);
      setError(err.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Memoized Map of habitId -> Set of completed_date strings for O(1) checks
  const habitLogsMap = useMemo(() => {
    const map = new Map();
    for (const log of logs) {
      if (!map.has(log.habit_id)) {
        map.set(log.habit_id, new Set());
      }
      map.get(log.habit_id).add(log.completed_date);
    }
    return map;
  }, [logs]);

  const isPending = useCallback(
    (habitId, completedDate = getTodayDate()) => {
      return pendingKeys.has(`${habitId}_${completedDate}`);
    },
    [pendingKeys]
  );

  // Complete a habit on a given date (default today)
  // Strictly waits for Supabase confirmation before updating state
  const completeHabit = async (habitId, completedDate = getTodayDate(), notes = '') => {
    if (!user) throw new Error('User not authenticated');
    const opKey = `${habitId}_${completedDate}`;

    // Prevent duplicate concurrent requests
    if (pendingKeys.has(opKey)) return;

    // Check if already completed locally
    const existingDates = habitLogsMap.get(habitId);
    if (existingDates && existingDates.has(completedDate)) {
      return; // Already completed, avoid duplicate
    }

    setPendingKeys((prev) => new Set(prev).add(opKey));
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('habit_logs')
        .insert([
          {
            habit_id: habitId,
            user_id: user.id,
            completed_date: completedDate,
            notes
          }
        ])
        .select()
        .single();

      if (insertError) {
        // If it's a unique constraint violation, retrieve the record
        if (insertError.code === '23505') {
          const { data: existingLog } = await supabase
            .from('habit_logs')
            .select('*')
            .eq('habit_id', habitId)
            .eq('completed_date', completedDate)
            .eq('user_id', user.id)
            .maybeSingle();

          if (existingLog) {
            setLogs((prev) => {
              if (prev.some((l) => l.id === existingLog.id || (l.habit_id === habitId && l.completed_date === completedDate))) {
                return prev;
              }
              return [existingLog, ...prev];
            });
            return existingLog;
          }
          return;
        }
        throw insertError;
      }

      // Only update local state AFTER Supabase confirms successful insertion
      if (data) {
        setLogs((prev) => {
          if (prev.some((l) => l.id === data.id || (l.habit_id === habitId && l.completed_date === completedDate))) {
            return prev;
          }
          return [data, ...prev];
        });
      }
      return data;
    } catch (err) {
      console.error('Error completing habit:', err);
      setError(err.message || 'Failed to complete habit');
      throw err;
    } finally {
      setPendingKeys((prev) => {
        const next = new Set(prev);
        next.delete(opKey);
        return next;
      });
    }
  };

  // Undo a habit completion
  // Strictly waits for Supabase confirmation before updating state
  const undoCompletion = async (habitId, completedDate = getTodayDate()) => {
    if (!user) throw new Error('User not authenticated');
    const opKey = `${habitId}_${completedDate}`;

    if (pendingKeys.has(opKey)) return;

    setPendingKeys((prev) => new Set(prev).add(opKey));
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId)
        .eq('completed_date', completedDate)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Only update state AFTER Supabase confirms successful deletion
      setLogs((prev) =>
        prev.filter((l) => !(l.habit_id === habitId && l.completed_date === completedDate))
      );
    } catch (err) {
      console.error('Error undoing completion:', err);
      setError(err.message || 'Failed to undo completion');
      throw err;
    } finally {
      setPendingKeys((prev) => {
        const next = new Set(prev);
        next.delete(opKey);
        return next;
      });
    }
  };

  // Toggle habit completion on a given date
  const toggleCompletion = async (habitId, completedDate = getTodayDate()) => {
    const dates = habitLogsMap.get(habitId);
    if (dates && dates.has(completedDate)) {
      return undoCompletion(habitId, completedDate);
    } else {
      return completeHabit(habitId, completedDate);
    }
  };

  return {
    logs,
    habitLogsMap,
    loading,
    error,
    refreshLogs: fetchLogs,
    completeHabit,
    undoCompletion,
    toggleCompletion,
    isPending
  };
}
