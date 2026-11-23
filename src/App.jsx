import React, { useState } from 'react';
import Navbar from './components/common/Navbar';
import DashboardOverview from './components/dashboard/DashboardOverview';
import HabitsView from './components/habits/HabitsView';
import CalendarView from './components/calendar/CalendarView';
import AnalyticsOverview from './components/statistics/AnalyticsOverview';
import SettingsView from './components/settings/SettingsView';
import AuthModal from './components/auth/AuthModal';
import SetupGuideBanner from './components/auth/SetupGuideBanner';
import HabitFormModal from './components/habits/HabitFormModal';
import { useAuth } from './context/AuthContext';
import { useHabits } from './hooks/useHabits';
import { useHabitLogs } from './hooks/useHabitLogs';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  const { user, isConfigured, loading: authLoading } = useAuth();
  const {
    habits,
    loading: habitsLoading,
    createHabit,
    updateHabit,
    toggleArchiveHabit,
    deleteHabit
  } = useHabits();

  const {
    logs,
    habitLogsMap,
    loading: logsLoading,
    toggleCompletion
  } = useHabitLogs();

  const handleQuickCreate = async (formData) => {
    await createHabit(formData);
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      <main className="main-content">
        {!isConfigured && (
          <SetupGuideBanner onOpenSettings={() => setActiveTab('settings')} />
        )}

        {activeTab === 'dashboard' && (
          <DashboardOverview
            habits={habits}
            habitLogsMap={habitLogsMap}
            onToggleCompletion={toggleCompletion}
            onCreateHabit={() => setIsQuickCreateOpen(true)}
          />
        )}

        {activeTab === 'habits' && (
          <HabitsView
            habits={habits}
            habitLogsMap={habitLogsMap}
            onCreateHabit={createHabit}
            onUpdateHabit={updateHabit}
            onToggleArchive={toggleArchiveHabit}
            onDeleteHabit={deleteHabit}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            habits={habits}
            habitLogsMap={habitLogsMap}
            onToggleCompletion={toggleCompletion}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsOverview
            habits={habits}
            habitLogsMap={habitLogsMap}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            habits={habits}
            logs={logs}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Quick Habit Creation Modal */}
      <HabitFormModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        onSubmit={handleQuickCreate}
      />
    </div>
  );
}
