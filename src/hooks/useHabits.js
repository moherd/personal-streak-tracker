import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHabits = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) {
      setHabits([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setHabits(data || []);
    } catch (err) {
      console.error('Error fetching habits:', err);
      setError(err.message || 'Failed to fetch habits');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const createHabit = async (habitData) => {
    if (!user) throw new Error('User not authenticated');

    const newHabitPayload = {
      user_id: user.id,
      name: habitData.name.trim(),
      description: habitData.description?.trim() || '',
      category: habitData.category || 'General',
      frequency: habitData.frequency || 'daily',
      target_days_per_week: habitData.frequency === 'weekly' ? Number(habitData.target_days_per_week || 3) : 7,
      start_date: habitData.start_date,
      color: habitData.color || '#2563eb',
      icon: habitData.icon || 'check-circle',
      is_archived: false
    };

    const { data, error } = await supabase
      .from('habits')
      .insert([newHabitPayload])
      .select()
      .single();

    if (error) throw error;
    setHabits((prev) => [data, ...prev]);
    return data;
  };

  const updateHabit = async (id, habitData) => {
    if (!user) throw new Error('User not authenticated');

    const updatePayload = {
      name: habitData.name.trim(),
      description: habitData.description?.trim() || '',
      category: habitData.category,
      frequency: habitData.frequency,
      target_days_per_week: habitData.frequency === 'weekly' ? Number(habitData.target_days_per_week || 3) : 7,
      start_date: habitData.start_date,
      color: habitData.color,
      icon: habitData.icon,
      is_archived: habitData.is_archived ?? false
    };

    const { data, error } = await supabase
      .from('habits')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    setHabits((prev) => prev.map((h) => (h.id === id ? data : h)));
    return data;
  };

  const toggleArchiveHabit = async (id, shouldArchive) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('habits')
      .update({ is_archived: shouldArchive })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    setHabits((prev) => prev.map((h) => (h.id === id ? data : h)));
    return data;
  };

  const deleteHabit = async (id) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  return {
    habits,
    loading,
    error,
    refreshHabits: fetchHabits,
    createHabit,
    updateHabit,
    toggleArchiveHabit,
    deleteHabit
  };
}
