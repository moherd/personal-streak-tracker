import React from 'react';
import { Search, X } from 'lucide-react';

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
    <div className="habit-filter-bar">
      <div className="filter-search-box">
        <Search
          size={16}
          className="filter-search-icon"
        />
        <input
          type="text"
          className="form-input filter-search-input"
          placeholder="Search habits..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-select-group">
        <select
          className="form-select filter-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="form-select filter-select"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          aria-label="Filter by frequency"
        >
          <option value="all">All Frequencies</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>

        <select
          className="form-select filter-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="active">Active Habits</option>
          <option value="archived">Archived Habits</option>
          <option value="all">All Habits</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-secondary filter-reset-btn"
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
