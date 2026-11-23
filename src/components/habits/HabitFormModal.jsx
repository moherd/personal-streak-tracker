import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { getTodayDate } from '../../utils/dateUtils';

const DEFAULT_CATEGORIES = [
  'General',
  'Health & Fitness',
  'Productivity',
  'Learning',
  'Mindfulness',
  'Finance',
  'Personal'
];

const PRESET_COLORS = [
  '#2563eb', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#ef4444'  // Rose
];

export default function HabitFormModal({
  isOpen,
  onClose,
  onSubmit,
  habitToEdit = null
}) {
  const isEditing = Boolean(habitToEdit);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [customCategory, setCustomCategory] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [targetDays, setTargetDays] = useState(3);
  const [startDate, setStartDate] = useState(getTodayDate());
  const [color, setColor] = useState('#2563eb');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name || '');
      setDescription(habitToEdit.description || '');
      if (DEFAULT_CATEGORIES.includes(habitToEdit.category)) {
        setCategory(habitToEdit.category);
        setCustomCategory('');
      } else {
        setCategory('Other');
        setCustomCategory(habitToEdit.category || '');
      }
      setFrequency(habitToEdit.frequency || 'daily');
      setTargetDays(habitToEdit.target_days_per_week || 3);
      setStartDate(habitToEdit.start_date || getTodayDate());
      setColor(habitToEdit.color || '#2563eb');
    } else {
      setName('');
      setDescription('');
      setCategory('General');
      setCustomCategory('');
      setFrequency('daily');
      setTargetDays(3);
      setStartDate(getTodayDate());
      setColor('#2563eb');
    }
    setError('');
  }, [habitToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a habit name');
      return;
    }

    const resolvedCategory = category === 'Other'
      ? customCategory.trim() || 'General'
      : category;

    setLoading(true);
    setError('');

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        category: resolvedCategory,
        frequency,
        target_days_per_week: frequency === 'weekly' ? Number(targetDays) : 7,
        start_date: startDate,
        color
      });
      onClose();
    } catch (err) {
      console.error('Save habit error:', err);
      setError(err.message || 'Failed to save habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Habit' : 'Create New Habit'}
      maxWidth="480px"
    >
      {error && (
        <div
          style={{
            padding: '0.65rem 0.85rem',
            marginBottom: '1rem',
            backgroundColor: 'var(--danger-light)',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger-text)',
            fontSize: '0.825rem'
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="habitName">
            Habit Name *
          </label>
          <input
            id="habitName"
            type="text"
            required
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Morning 20m Workout"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="habitDesc">
            Description (Optional)
          </label>
          <textarea
            id="habitDesc"
            rows={2}
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why is this habit important? Specific details..."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="habitCategory">
              Category
            </label>
            <select
              id="habitCategory"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="Other">Other (Custom)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="habitFrequency">
              Frequency
            </label>
            <select
              id="habitFrequency"
              className="form-select"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly Target</option>
            </select>
          </div>
        </div>

        {category === 'Other' && (
          <div className="form-group">
            <label className="form-label" htmlFor="customCategory">
              Custom Category Name
            </label>
            <input
              id="customCategory"
              type="text"
              className="form-input"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="e.g. Languages"
            />
          </div>
        )}

        {frequency === 'weekly' && (
          <div className="form-group">
            <label className="form-label" htmlFor="targetDays">
              Target Days per Week (1 to 7)
            </label>
            <input
              id="targetDays"
              type="number"
              min="1"
              max="7"
              className="form-input"
              value={targetDays}
              onChange={(e) => setTargetDays(Number(e.target.value))}
            />
            <span className="form-help">
              Streak increases when completed at least {targetDays} times during a calendar week.
            </span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="startDate">
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            required
            className="form-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Color Accent</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: c,
                  border: color === c ? '2px solid #0f172a' : '2px solid transparent',
                  cursor: 'pointer',
                  outline: 'none',
                  transform: color === c ? 'scale(1.15)' : 'none'
                }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Habit' : 'Create Habit'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
