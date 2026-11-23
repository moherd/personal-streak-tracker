import React from 'react';
import { Search, Filter, X } from 'lucide-react';

export default function HabitFilterBar({
  search,
  setSearch,
  category,
  setCategory,
  frequency,
  setFrequency,
  status,
  setStatus,
  categories = []
}) {
  const hasActiveFilters = search || category !== 'all' || frequency !== 'all' || status !== 'active';

  const resetFilters = () => {
    setSearch('');
    setCategory('all');
    setFrequency('all');
    setStatus('active');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center',
        marginBottom: '1.5rem',
        background: 'var(--bg-surface)',
        padding: '0.85rem 1rem',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)'
      }}
    >
      <div style={{ position: 'relative', flex: '1 1 200px' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-subtle)'
          }}
        />
        <input
          type="text"
          className="form-input"
          style={{ paddingLeft: '2.25rem', height: '36px' }}
          placeholder="Search habits..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          className="form-select"
          style={{ height: '36px', width: 'auto', fontSize: '0.825rem' }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ height: '36px', width: 'auto', fontSize: '0.825rem' }}
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          <option value="all">All Frequencies</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>

        <select
          className="form-select"
          style={{ height: '36px', width: 'auto', fontSize: '0.825rem' }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="active">Active Habits</option>
          <option value="archived">Archived Habits</option>
          <option value="all">All Habits</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ height: '36px', padding: '0 0.65rem', fontSize: '0.8rem' }}
            onClick={resetFilters}
            title="Reset Filters"
          >
            <X size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
