import React, { useState, useMemo } from 'react';
import { Plus, CheckSquare } from 'lucide-react';
import HabitCard from './HabitCard';
import HabitFilterBar from './HabitFilterBar';
import HabitFormModal from './HabitFormModal';
import ConfirmDialog from '../common/ConfirmDialog';

export default function HabitsView({
  habits = [],
  habitLogsMap = new Map(),
  onCreateHabit,
  onUpdateHabit,
  onToggleArchive,
  onDeleteHabit
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [frequency, setFrequency] = useState('all');
  const [status, setStatus] = useState('active');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [deletingHabit, setDeletingHabit] = useState(null);

  // Extract unique categories from current habits
  const uniqueCategories = useMemo(() => {
    const set = new Set();
    for (const h of habits) {
      if (h.category) set.add(h.category);
    }
    return Array.from(set).sort();
  }, [habits]);

  // Filter habits
  const filteredHabits = useMemo(() => {
    return habits.filter((h) => {
      // Status filter
      if (status === 'active' && h.is_archived) return false;
      if (status === 'archived' && !h.is_archived) return false;

      // Category filter
      if (category !== 'all' && h.category !== category) return false;

      // Frequency filter
      if (frequency !== 'all' && h.frequency !== frequency) return false;

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = h.name.toLowerCase().includes(q);
        const matchesDesc = (h.description || '').toLowerCase().includes(q);
        const matchesCategory = (h.category || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCategory) return false;
      }

      return true;
    });
  }, [habits, status, category, frequency, search]);

  const handleCreateClick = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (habit) => {
    setDeletingHabit(habit);
  };

  const handleFormSubmit = async (formData) => {
    if (editingHabit) {
      await onUpdateHabit(editingHabit.id, formData);
    } else {
      await onCreateHabit(formData);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Habit Management</h1>
          <p className="page-subtitle">Create, organize, and monitor your personal habit commitments</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreateClick}>
          <Plus size={16} />
          <span>New Habit</span>
        </button>
      </div>

      <HabitFilterBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        frequency={frequency}
        setFrequency={setFrequency}
        status={status}
        setStatus={setStatus}
        categories={uniqueCategories}
      />

      {filteredHabits.length === 0 ? (
        <div className="empty-state">
          <CheckSquare className="empty-icon" />
          <h4 className="empty-title">No habits found</h4>
          <p className="empty-text">
            {habits.length === 0
              ? 'Get started by creating your first daily or weekly habit.'
              : 'No habits match your current search and filter criteria.'}
          </p>
          {habits.length === 0 && (
            <button className="btn btn-primary" onClick={handleCreateClick}>
              <Plus size={16} />
              <span>Create Habit</span>
            </button>
          )}
        </div>
      ) : (
        <div className="habits-grid">
          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              logs={habitLogsMap.get(habit.id) || new Set()}
              onEdit={handleEditClick}
              onToggleArchive={onToggleArchive}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Habit Form Modal */}
      <HabitFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        habitToEdit={editingHabit}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingHabit)}
        onClose={() => setDeletingHabit(null)}
        onConfirm={() => {
          if (deletingHabit) {
            onDeleteHabit(deletingHabit.id);
          }
        }}
        title="Delete Habit"
        message={`Are you sure you want to permanently delete "${deletingHabit?.name}"? All associated completion history and streak records will be removed.`}
        confirmText="Delete Habit"
        isDanger={true}
      />
    </div>
  );
}
