import React from 'react';
import {
  Flame,
  CheckCircle2,
  TrendingUp,
  Award,
  ListTodo,
  CalendarCheck
} from 'lucide-react';
import StatCard from '../common/StatCard';
import TodayHabitsList from './TodayHabitsList';
import WeeklyConsistencyChart from './WeeklyConsistencyChart';
import { calculateDashboardMetrics } from '../../utils/streakCalculator';
import { getTodayDate, formatDisplayDate } from '../../utils/dateUtils';

export default function DashboardOverview({
  habits = [],
  habitLogsMap = new Map(),
  onToggleCompletion,
  onCreateHabit,
  isPending
}) {
  const todayStr = getTodayDate();
  const metrics = calculateDashboardMetrics(habits, habitLogsMap, todayStr);

  const formattedToday = formatDisplayDate(todayStr, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Personal Habit Dashboard</h1>
          <p className="page-subtitle">{formattedToday}</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Active Habits"
          value={metrics.totalActiveHabits}
          subtext="Tracking currently"
          icon={ListTodo}
          color="var(--primary)"
        />
        <StatCard
          label="Completed Today"
          value={`${metrics.habitsCompletedToday} / ${metrics.totalActiveHabits}`}
          subtext={`${metrics.completionPercentageToday}% completed`}
          icon={CheckCircle2}
          color="var(--success)"
        />
        <StatCard
          label="Today's Progress"
          value={`${metrics.completionPercentageToday}%`}
          subtext="Target: 100%"
          icon={TrendingUp}
          color="#3b82f6"
        />
        <StatCard
          label="Active Streaks"
          value={metrics.totalCurrentStreaks}
          subtext="Cumulative days active"
          icon={Flame}
          color="#f59e0b"
        />
        <StatCard
          label="Longest Streak"
          value={`${metrics.longestStreakRecord} d`}
          subtext="Personal record"
          icon={Award}
          color="#8b5cf6"
        />
        <StatCard
          label="Weekly Consistency"
          value={`${metrics.weeklyConsistencyRate}%`}
          subtext="Past 7 days average"
          icon={CalendarCheck}
          color="#10b981"
        />
      </div>

      <div className="dashboard-split">
        <div>
          <TodayHabitsList
            habits={habits}
            habitLogsMap={habitLogsMap}
            onToggleCompletion={onToggleCompletion}
            onCreateHabit={onCreateHabit}
            isPending={isPending}
          />
        </div>
        <div>
          <WeeklyConsistencyChart
            habits={habits}
            habitLogsMap={habitLogsMap}
          />
        </div>
      </div>
    </div>
  );
}
