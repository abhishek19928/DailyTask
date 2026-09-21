import React, { useState, useEffect, useCallback } from 'react';
import { DayPlan, ActiveTab, AppSettings } from './types';
import {
  getTodayDateString,
  loadDayPlan,
  saveDayPlan,
  loadAllPlans,
  loadSettings,
  saveSettings,
  initializeSampleDataIfEmpty,
  DEFAULT_SETTINGS,
  generateId,
} from './utils/storage';
import { WhiteboardHeader } from './components/WhiteboardHeader';
import { GoalCard } from './components/GoalCard';
import { TopTasksCard } from './components/TopTasksCard';
import { OtherWorkCard } from './components/OtherWorkCard';
import { FollowUpCard } from './components/FollowUpCard';
import { EndOfDayCard } from './components/EndOfDayCard';
import { CompleteDayModal } from './components/CompleteDayModal';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { Navigation } from './components/Navigation';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [currentDate, setCurrentDate] = useState<string>(getTodayDateString());
  const [plan, setPlan] = useState<DayPlan>(() => {
    initializeSampleDataIfEmpty();
    return loadDayPlan(getTodayDateString());
  });
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [allPlans, setAllPlans] = useState<DayPlan[]>([]);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // Refresh plans list for history
  const refreshAllPlans = useCallback(() => {
    setAllPlans(loadAllPlans());
  }, []);

  // On mount
  useEffect(() => {
    initializeSampleDataIfEmpty();
    refreshAllPlans();
  }, [refreshAllPlans]);

  // When currentDate changes, load that day's plan
  useEffect(() => {
    const loaded = loadDayPlan(currentDate);
    setPlan(loaded);
  }, [currentDate]);

  // Automatically save plan whenever it changes
  const handleUpdatePlan = useCallback((updated: DayPlan) => {
    setPlan(updated);
    saveDayPlan(updated);
    // update allPlans in memory
    setAllPlans((prev) => {
      const idx = prev.findIndex((p) => p.date === updated.date);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [updated, ...prev].sort((a, b) => b.date.localeCompare(a.date));
    });
  }, []);

  // Update Goal
  const handleGoalChange = (newGoal: string) => {
    handleUpdatePlan({
      ...plan,
      goal: newGoal,
    });
  };

  // Top tasks handlers
  const handleToggleTopTask = (index: number) => {
    const newTop = [...plan.topTasks];
    newTop[index] = {
      ...newTop[index],
      completed: !newTop[index].completed,
    };
    handleUpdatePlan({
      ...plan,
      topTasks: newTop,
    });
  };

  const handleUpdateTopTaskText = (index: number, text: string) => {
    const newTop = [...plan.topTasks];
    newTop[index] = {
      ...newTop[index],
      text,
    };
    handleUpdatePlan({
      ...plan,
      topTasks: newTop,
    });
  };

  // Other tasks handlers
  const handleToggleOtherTask = (index: number) => {
    const newOther = [...plan.otherTasks];
    newOther[index] = {
      ...newOther[index],
      completed: !newOther[index].completed,
    };
    handleUpdatePlan({
      ...plan,
      otherTasks: newOther,
    });
  };

  const handleUpdateOtherTaskText = (index: number, text: string) => {
    const newOther = [...plan.otherTasks];
    newOther[index] = {
      ...newOther[index],
      text,
    };
    handleUpdatePlan({
      ...plan,
      otherTasks: newOther,
    });
  };

  const handleAddOtherTask = () => {
    handleUpdatePlan({
      ...plan,
      otherTasks: [
        ...plan.otherTasks,
        { id: generateId(), text: '', completed: false },
      ],
    });
  };

  const handleDeleteOtherTask = (index: number) => {
    const newOther = plan.otherTasks.filter((_, i) => i !== index);
    handleUpdatePlan({
      ...plan,
      otherTasks: newOther,
    });
  };

  // Follow-up handlers
  const handleUpdateFollowUp = (
    index: number,
    field: 'contact' | 'action',
    value: string
  ) => {
    const newFollowUps = [...plan.followUps];
    if (newFollowUps[index]) {
      newFollowUps[index] = {
        ...newFollowUps[index],
        [field]: value,
      };
      handleUpdatePlan({
        ...plan,
        followUps: newFollowUps,
      });
    }
  };

  const handleToggleFollowUp = (index: number) => {
    const newFollowUps = [...plan.followUps];
    if (newFollowUps[index]) {
      newFollowUps[index] = {
        ...newFollowUps[index],
        completed: !newFollowUps[index].completed,
      };
      handleUpdatePlan({
        ...plan,
        followUps: newFollowUps,
      });
    }
  };

  const handleAddFollowUp = () => {
    handleUpdatePlan({
      ...plan,
      followUps: [
        ...plan.followUps,
        { id: generateId(), contact: '', action: '', completed: false },
      ],
    });
  };

  const handleDeleteFollowUp = (index: number) => {
    const newFollowUps = plan.followUps.filter((_, i) => i !== index);
    handleUpdatePlan({
      ...plan,
      followUps: newFollowUps,
    });
  };

  // End of day handlers
  const handleUpdateDoneToday = (value: boolean | null) => {
    handleUpdatePlan({
      ...plan,
      doneToday: value,
      completedAt: value === true ? new Date().toISOString() : plan.completedAt,
    });
  };

  const handleUpdateTomorrowTask = (text: string) => {
    handleUpdatePlan({
      ...plan,
      tomorrowTask: text,
    });
  };

  const handleUpdateScore = (score: number | null) => {
    handleUpdatePlan({
      ...plan,
      productivityScore: score,
    });
  };

  // Settings
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleResetAllData = () => {
    if (
      confirm(
        'Are you sure you want to erase all plans and start completely fresh? This cannot be undone.'
      )
    ) {
      localStorage.clear();
      setSettings(DEFAULT_SETTINGS);
      saveSettings(DEFAULT_SETTINGS);
      const empty = loadDayPlan(getTodayDateString());
      setPlan(empty);
      setAllPlans([]);
    }
  };

  const handleRestoreSampleData = () => {
    localStorage.clear();
    initializeSampleDataIfEmpty();
    refreshAllPlans();
    const today = loadDayPlan(getTodayDateString());
    setPlan(today);
  };

  const handleSelectDateFromHistory = (dateStr: string) => {
    setCurrentDate(dateStr);
    setActiveTab('today');
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 pb-20 sm:pb-12 pt-2 sm:pt-6 px-2.5 sm:px-4">
      {/* Centered Whiteboard Frame */}
      <main className="max-w-3xl mx-auto">
        {/* Top App Bar & Navigation */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 shadow-xs" />
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
              Whiteboard Daily System
            </span>
          </div>

          <Navigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            savedDaysCount={allPlans.length}
          />
        </div>

        {/* TAB 1: TODAY'S WHITEBOARD */}
        {activeTab === 'today' && (
          <div className="bg-white rounded-2xl border-4 border-neutral-300 shadow-xl overflow-hidden">
            {/* Whiteboard Header */}
            <WhiteboardHeader
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              plan={plan}
              onCompleteDayClick={() => setIsCompleteModalOpen(true)}
              handwritingFont={settings.handwritingFont}
            />

            {/* Whiteboard Surface Sections in Strict Order */}
            <div className="p-4 sm:p-6 space-y-5 whiteboard-surface">
              {/* 1. TODAY'S #1 GOAL */}
              <GoalCard
                goal={plan.goal}
                onChange={handleGoalChange}
                handwritingFont={settings.handwritingFont}
              />

              {/* 2. TOP 3 TASKS */}
              <TopTasksCard
                tasks={plan.topTasks}
                onToggleTask={handleToggleTopTask}
                onUpdateTaskText={handleUpdateTopTaskText}
                handwritingFont={settings.handwritingFont}
              />

              {/* 3. OTHER WORK */}
              <OtherWorkCard
                tasks={plan.otherTasks}
                onToggleTask={handleToggleOtherTask}
                onUpdateTaskText={handleUpdateOtherTaskText}
                onAddTask={handleAddOtherTask}
                onDeleteTask={handleDeleteOtherTask}
                handwritingFont={settings.handwritingFont}
              />

              {/* 4. FOLLOW-UP */}
              <FollowUpCard
                followUps={plan.followUps}
                onUpdateFollowUp={handleUpdateFollowUp}
                onToggleFollowUp={handleToggleFollowUp}
                onAddFollowUp={handleAddFollowUp}
                onDeleteFollowUp={handleDeleteFollowUp}
                handwritingFont={settings.handwritingFont}
              />

              {/* 5. END OF DAY */}
              <EndOfDayCard
                plan={plan}
                onUpdateDoneToday={handleUpdateDoneToday}
                onUpdateTomorrowTask={handleUpdateTomorrowTask}
                onUpdateScore={handleUpdateScore}
                onCompleteDay={() => setIsCompleteModalOpen(true)}
                handwritingFont={settings.handwritingFont}
              />
            </div>

            {/* Bottom Marker Tray / Board Edge visual touch */}
            <div className="bg-neutral-200 border-t-2 border-neutral-300 px-4 py-2 flex items-center justify-between text-[11px] text-neutral-500 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" title="Black marker" />
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" title="Blue marker" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" title="Green marker" />
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" title="Red marker" />
                <span className="ml-1 text-neutral-600 font-semibold">Dry-Erase Plan</span>
              </div>
              <span>Auto-saved to device</span>
            </div>
          </div>
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === 'history' && (
          <HistoryView
            plans={allPlans}
            onSelectDate={handleSelectDateFromHistory}
            onRefreshPlans={refreshAllPlans}
            handwritingFont={settings.handwritingFont}
          />
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetAllData={handleResetAllData}
            onRestoreSampleData={handleRestoreSampleData}
          />
        )}
      </main>

      {/* Complete Day Summary Modal */}
      <CompleteDayModal
        plan={plan}
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        onNavigateToDate={(newDate) => {
          setCurrentDate(newDate);
          setIsCompleteModalOpen(false);
        }}
        handwritingFont={settings.handwritingFont}
      />
    </div>
  );
}
