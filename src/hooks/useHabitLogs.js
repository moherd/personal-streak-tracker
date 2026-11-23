import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getTodayDate } from '../utils/dateUtils';

export function useHabitLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Complete a habit on a given date (default today)
  const completeHabit = async (habitId, completedDate = getTodayDate(), notes = '') => {
    if (!user) throw new Error('User not authenticated');

    // Check if already completed locally
    const existingDates = habitLogsMap.get(habitId);
    if (existingDates && existingDates.has(completedDate)) {
      return; // Already completed, avoid duplicate
    }

    // Optimistic log entry
    const tempId = `temp-${Date.now()}`;
    const optimisticLog = {
      id: tempId,
      habit_id: habitId,
      user_id: user.id,
      completed_date: completedDate,
      notes,
      created_at: new Date().toISOString()
    };

    setLogs((prev) => [optimisticLog, ...prev]);

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
        // If it's a unique constraint violation, it's already there
        if (insertError.code === '23505') {
          return;
        }
        throw insertError;
      }

      // Replace temp log with real server data
      setLogs((prev) => prev.map((l) => (l.id === tempId ? data : l)));
      return data;
    } catch (err) {
      console.error('Error completing habit:', err);
      // Revert optimistic update
      setLogs((prev) => prev.filter((l) => l.id !== tempId));
      throw err;
    }
  };

  // Undo a habit completion
  const undoCompletion = async (habitId, completedDate = getTodayDate()) => {
    if (!user) throw new Error('User not authenticated');

    const removedLogs = logs.filter(
      (l) => l.habit_id === habitId && l.completed_date === completedDate
    );

    // Optimistically remove from state
    setLogs((prev) =>
      prev.filter((l) => !(l.habit_id === habitId && l.completed_date === completedDate))
    );

    try {
      const { error: deleteError } = await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId)
        .eq('completed_date', completedDate)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
    } catch (err) {
      console.error('Error undoing completion:', err);
      // Revert optimistic deletion
      setLogs((prev) => [...removedLogs, ...prev]);
      throw err;
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
    toggleCompletion
  };
}
