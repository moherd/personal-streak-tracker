import {
  getTodayDate,
  addDays,
  diffInDays,
  getStartOfWeek,
  isBefore,
  isAfter
} from './dateUtils.js';

/**
 * Calculate streak and consistency metrics for a single habit
 * @param {Object} habit - Habit object { id, frequency, target_days_per_week, start_date, ... }
 * @param {Array<Object>|Set<string>} logs - Array of { completed_date } or Set of date strings
 * @param {string} [referenceDate] - Date to calculate from, defaults to today
 * @returns {Object} { currentStreak, longestStreak, isCompletedToday, totalCompletions, completionRate, lastCompletedDate }
 */
export function calculateHabitStreak(habit, logs, referenceDate = getTodayDate()) {
  if (!habit) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      isCompletedToday: false,
      totalCompletions: 0,
      completionRate: 0,
      lastCompletedDate: null
    };
  }

  // Normalize logs to a Set of 'YYYY-MM-DD' strings
  let dateSet = new Set();
  let sortedDates = [];

  if (logs instanceof Set) {
    dateSet = logs;
    sortedDates = Array.from(logs).sort();
  } else if (Array.isArray(logs)) {
    for (const log of logs) {
      if (typeof log === 'string') {
        dateSet.add(log);
      } else if (log && log.completed_date) {
        dateSet.add(log.completed_date);
      }
    }
    sortedDates = Array.from(dateSet).sort();
  }

  const isCompletedToday = dateSet.has(referenceDate);
  const totalCompletions = dateSet.size;
  const lastCompletedDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null;

  if (habit.frequency === 'weekly') {
    return calculateWeeklyStreak({
      habit,
      dateSet,
      sortedDates,
      referenceDate,
      isCompletedToday,
      totalCompletions,
      lastCompletedDate
    });
  }

  return calculateDailyStreak({
    habit,
    dateSet,
    sortedDates,
    referenceDate,
    isCompletedToday,
    totalCompletions,
    lastCompletedDate
  });
}

/**
 * Calculate streak for Daily Habit
 */
function calculateDailyStreak({
  habit,
  dateSet,
  sortedDates,
  referenceDate,
  isCompletedToday,
  totalCompletions,
  lastCompletedDate
}) {
  let currentStreak = 0;
  let longestStreak = 0;

  // 1. Calculate Longest Streak in history
  if (sortedDates.length > 0) {
    let tempStreak = 1;
    longestStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = sortedDates[i - 1];
      const currDate = sortedDates[i];
      const dayDiff = diffInDays(prevDate, currDate);

      if (dayDiff === 1) {
        tempStreak++;
      } else if (dayDiff > 1) {
        tempStreak = 1;
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }
  }

  // 2. Calculate Current Streak
  // Check if today is completed
  let checkDate = referenceDate;
  if (dateSet.has(checkDate)) {
    // Today completed: count backwards from today
    while (dateSet.has(checkDate)) {
      currentStreak++;
      checkDate = addDays(checkDate, -1);
    }
  } else {
    // Today not completed yet: check if yesterday was completed
    const yesterday = addDays(referenceDate, -1);
    if (dateSet.has(yesterday)) {
      checkDate = yesterday;
      while (dateSet.has(checkDate)) {
        currentStreak++;
        checkDate = addDays(checkDate, -1);
      }
    } else {
      // Neither today nor yesterday completed: streak is broken (0)
      currentStreak = 0;
    }
  }

  // Longest streak should always be at least currentStreak
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // 3. Completion Rate (%)
  // Total calendar days from habit start_date up to referenceDate (minimum 1 day)
  const habitStartDate = habit.start_date || referenceDate;
  let daysSinceStart = diffInDays(habitStartDate, referenceDate) + 1;
  if (daysSinceStart < 1) daysSinceStart = 1;

  // Only count completions that occurred on or after start_date and on or before referenceDate
  let validCompletions = 0;
  for (const d of sortedDates) {
    if (d >= habitStartDate && d <= referenceDate) {
      validCompletions++;
    }
  }

  const completionRate = Math.min(100, Math.round((validCompletions / daysSinceStart) * 100));

  return {
    currentStreak,
    longestStreak,
    isCompletedToday,
    totalCompletions,
    completionRate,
    lastCompletedDate
  };
}

/**
 * Calculate streak for Weekly Habit
 */
function calculateWeeklyStreak({
  habit,
  dateSet,
  sortedDates,
  referenceDate,
  isCompletedToday,
  totalCompletions,
  lastCompletedDate
}) {
  const targetDays = habit.target_days_per_week || 1;
  const habitStartDate = habit.start_date || referenceDate;

  // Group completions by week start (Monday)
  const weekCompletions = new Map();
  for (const d of sortedDates) {
    const weekStart = getStartOfWeek(d);
    weekCompletions.set(weekStart, (weekCompletions.get(weekStart) || 0) + 1);
  }

  // Get current week and start week
  const currentWeekStart = getStartOfWeek(referenceDate);
  const startWeekStart = getStartOfWeek(habitStartDate);

  // Generate list of all week starts from startWeekStart to currentWeekStart
  const allWeeks = [];
  let w = startWeekStart;
  while (w <= currentWeekStart) {
    allWeeks.push(w);
    w = addDays(w, 7);
  }

  // Identify successful weeks
  const isWeekSuccessful = (weekMonday) => {
    return (weekCompletions.get(weekMonday) || 0) >= targetDays;
  };

  // Calculate Longest Weekly Streak
  let longestStreak = 0;
  let tempStreak = 0;
  for (const weekMonday of allWeeks) {
    if (isWeekSuccessful(weekMonday)) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  // Calculate Current Weekly Streak
  let currentStreak = 0;
  const currentWeekCount = weekCompletions.get(currentWeekStart) || 0;
  const isCurrentWeekMet = currentWeekCount >= targetDays;

  if (isCurrentWeekMet) {
    // Current week target reached! Count backwards from current week
    let checkWeek = currentWeekStart;
    while (allWeeks.includes(checkWeek) && isWeekSuccessful(checkWeek)) {
      currentStreak++;
      checkWeek = addDays(checkWeek, -7);
    }
  } else {
    // Current week still in progress: if previous week was successful, streak is alive
    const prevWeek = addDays(currentWeekStart, -7);
    if (allWeeks.includes(prevWeek) && isWeekSuccessful(prevWeek)) {
      let checkWeek = prevWeek;
      while (allWeeks.includes(checkWeek) && isWeekSuccessful(checkWeek)) {
        currentStreak++;
        checkWeek = addDays(checkWeek, -7);
      }
    } else {
      currentStreak = 0;
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // Completion rate based on total target weeks
  const totalWeeks = Math.max(1, allWeeks.length);
  const successfulWeeksCount = allWeeks.filter(isWeekSuccessful).length;
  const completionRate = Math.min(100, Math.round((successfulWeeksCount / totalWeeks) * 100));

  return {
    currentStreak,
    longestStreak,
    isCompletedToday,
    totalCompletions,
    completionRate,
    lastCompletedDate,
    currentWeekCompletions: currentWeekCount,
    targetDaysPerWeek: targetDays
  };
}

/**
 * Calculate dashboard summary metrics across all active habits
 * @param {Array<Object>} habits
 * @param {Map<string, Set<string>>|Object} habitLogsMap - Map of habitId -> Set of completed_date strings
 * @param {string} [referenceDate]
 */
export function calculateDashboardMetrics(habits = [], habitLogsMap = new Map(), referenceDate = getTodayDate()) {
  const activeHabits = habits.filter((h) => !h.is_archived);
  const totalActiveHabits = activeHabits.length;

  if (totalActiveHabits === 0) {
    return {
      totalActiveHabits: 0,
      habitsCompletedToday: 0,
      completionPercentageToday: 0,
      totalCurrentStreaks: 0,
      longestStreakRecord: 0,
      weeklyConsistencyRate: 0,
      habitMetrics: []
    };
  }

  let completedTodayCount = 0;
  let totalCurrentStreaks = 0;
  let longestStreakRecord = 0;
  const habitMetrics = [];

  for (const habit of activeHabits) {
    const logs = habitLogsMap instanceof Map
      ? habitLogsMap.get(habit.id) || new Set()
      : (habitLogsMap[habit.id] || new Set());

    const metric = calculateHabitStreak(habit, logs, referenceDate);
    habitMetrics.push({
      habitId: habit.id,
      ...metric
    });

    if (metric.isCompletedToday) {
      completedTodayCount++;
    }
    totalCurrentStreaks += metric.currentStreak;
    if (metric.longestStreak > longestStreakRecord) {
      longestStreakRecord = metric.longestStreak;
    }
  }

  const completionPercentageToday = totalActiveHabits > 0
    ? Math.round((completedTodayCount / totalActiveHabits) * 100)
    : 0;

  // Calculate 7-day consistency overview
  // For each of the last 7 days, what percentage of active habits were completed?
  let sumDailyPercentages = 0;
  for (let i = 0; i < 7; i++) {
    const pastDate = addDays(referenceDate, -i);
    let dayCompleted = 0;
    for (const habit of activeHabits) {
      const logs = habitLogsMap instanceof Map
        ? habitLogsMap.get(habit.id) || new Set()
        : (habitLogsMap[habit.id] || new Set());
      if (logs.has(pastDate)) {
        dayCompleted++;
      }
    }
    sumDailyPercentages += (dayCompleted / totalActiveHabits);
  }
  const weeklyConsistencyRate = Math.round((sumDailyPercentages / 7) * 100);

  return {
    totalActiveHabits,
    habitsCompletedToday: completedTodayCount,
    completionPercentageToday,
    totalCurrentStreaks,
    longestStreakRecord,
    weeklyConsistencyRate,
    habitMetrics
  };
}
