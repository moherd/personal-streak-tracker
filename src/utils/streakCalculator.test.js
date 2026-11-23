/**
 * Automated test suite for Streak Calculator & Date Utilities
 * Run using: node src/utils/streakCalculator.test.js
 */

import {
  formatDate,
  parseDate,
  addDays,
  diffInDays,
  getStartOfWeek
} from './dateUtils.js';

import {
  calculateHabitStreak,
  calculateDashboardMetrics
} from './streakCalculator.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('\n--- Running Streak Calculator & Date Tests ---\n');

// Test 1: Date utilities
const todayStr = '2024-11-20';
assert(addDays(todayStr, 1) === '2024-11-21', 'addDays +1 matches');
assert(addDays(todayStr, -1) === '2024-11-19', 'addDays -1 matches');
assert(diffInDays('2024-11-20', '2024-11-25') === 5, 'diffInDays 5 matches');
assert(diffInDays('2024-11-25', '2024-11-20') === -5, 'diffInDays -5 matches');

// Test 2: Daily habit with consecutive days including today
const habit1 = {
  id: 'h1',
  name: 'Read 30 mins',
  frequency: 'daily',
  start_date: '2024-11-10'
};
const logs1 = ['2024-11-18', '2024-11-19', '2024-11-20'];
const res1 = calculateHabitStreak(habit1, logs1, '2024-11-20');
assert(res1.currentStreak === 3, 'Consecutive 3 days completed today yields currentStreak = 3');
assert(res1.longestStreak === 3, 'Longest streak is 3');
assert(res1.isCompletedToday === true, 'isCompletedToday is true');

// Test 3: Daily habit where today is not completed yet, but yesterday was
const res2 = calculateHabitStreak(habit1, ['2024-11-18', '2024-11-19'], '2024-11-20');
assert(res2.currentStreak === 2, 'Pending today with yesterday completed keeps streak alive at 2');
assert(res2.isCompletedToday === false, 'isCompletedToday is false');

// Test 4: Daily habit where yesterday was missed -> streak breaks to 0
const res3 = calculateHabitStreak(habit1, ['2024-11-15', '2024-11-16', '2024-11-17'], '2024-11-20');
assert(res3.currentStreak === 0, 'Missed days breaks currentStreak to 0');
assert(res3.longestStreak === 3, 'Longest streak (3) remains saved after streak break');

// Test 5: Past longer streak preserved when current streak is shorter
const logs4 = ['2024-11-01', '2024-11-02', '2024-11-03', '2024-11-04', '2024-11-05', '2024-11-19', '2024-11-20'];
const res4 = calculateHabitStreak(habit1, logs4, '2024-11-20');
assert(res4.currentStreak === 2, 'Current streak is 2');
assert(res4.longestStreak === 5, 'Longest streak of 5 is preserved');

// Test 6: Undoing a completion reduces streak immediately
const logsAfterUndo = logs4.filter(d => d !== '2024-11-20');
const resUndo = calculateHabitStreak(habit1, logsAfterUndo, '2024-11-20');
assert(resUndo.isCompletedToday === false, 'Undo marks isCompletedToday as false');
assert(resUndo.currentStreak === 1, 'Current streak drops to 1 (yesterday only)');

// Test 7: Weekly habit calculation
const weeklyHabit = {
  id: 'w1',
  name: 'Gym',
  frequency: 'weekly',
  target_days_per_week: 3,
  start_date: '2024-11-04' // Monday
};
// Week 1 (Nov 4-10): 3 completions -> success
// Week 2 (Nov 11-17): 3 completions -> success
// Week 3 (Nov 18-24): 3 completions -> success (reference is Nov 20, Wednesday)
const weeklyLogs = [
  '2024-11-04', '2024-11-06', '2024-11-08',
  '2024-11-11', '2024-11-13', '2024-11-15',
  '2024-11-18', '2024-11-19', '2024-11-20'
];
const weeklyRes = calculateHabitStreak(weeklyHabit, weeklyLogs, '2024-11-20');
assert(weeklyRes.currentStreak === 3, 'Weekly habit meets target for 3 consecutive weeks');
assert(weeklyRes.longestStreak === 3, 'Weekly longest streak is 3');

// Test 8: Dashboard metrics aggregation
const logsMap = new Map();
logsMap.set('h1', new Set(logs1));
logsMap.set('w1', new Set(weeklyLogs));
const dashMetrics = calculateDashboardMetrics([habit1, weeklyHabit], logsMap, '2024-11-20');

assert(dashMetrics.totalActiveHabits === 2, 'Total active habits is 2');
assert(dashMetrics.habitsCompletedToday === 2, 'Habits completed today is 2');
assert(dashMetrics.completionPercentageToday === 100, 'Today completion % is 100');

console.log(`\nResults: ${passedTests}/${totalTests} tests passed.\n`);
if (passedTests === totalTests) {
  console.log('🎉 All streak calculation tests passed!\n');
}
