import React, { useState } from 'react';
import { Calendar, CheckCircle2, CircleDot, ArrowRight, Trash2, Search, ArrowUpDown } from 'lucide-react';
import { DayPlan } from '../types';
import { formatDisplayDate, formatShortDate, calculateProgress, deleteDayPlan } from '../utils/storage';

interface HistoryViewProps {
  plans: DayPlan[];
  onSelectDate: (dateStr: string) => void;
  onRefreshPlans: () => void;
  handwritingFont: boolean;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  plans,
  onSelectDate,
  onRefreshPlans,
  handwritingFont,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  // Filter plans
  const filteredPlans = plans.filter((plan) => {
    // Search query matching date, goal, or tasks
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const matchDate = plan.date.includes(query);
      const matchGoal = plan.goal.toLowerCase().includes(query);
      const matchTomorrow = plan.tomorrowTask.toLowerCase().includes(query);
      const matchTasks = [
        ...plan.topTasks.map((t) => t.text.toLowerCase()),
        ...plan.otherTasks.map((t) => t.text.toLowerCase()),
      ].some((t) => t.includes(query));

      if (!matchDate && !matchGoal && !matchTomorrow && !matchTasks) {
        return false;
      }
    }

    if (filter === 'completed') {
      return plan.doneToday === true;
    }
    if (filter === 'pending') {
      return plan.doneToday !== true;
    }

    return true;
  });

  const handleDelete = (dateStr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the plan for ${formatShortDate(dateStr)}?`)) {
      deleteDayPlan(dateStr);
      onRefreshPlans();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="bg-white rounded-xl border-2 border-neutral-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <h2
              className={`text-lg sm:text-xl font-bold uppercase tracking-wider text-neutral-900 ${
                handwritingFont ? 'font-marker' : 'font-sans'
              }`}
            >
              DAY PLANS ARCHIVE
            </h2>
            <p className="text-xs text-neutral-500 font-medium">
              Review, edit, or track consistency across previous days
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              All ({plans.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filter === 'completed'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Done Today
            </button>
            <button
              type="button"
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filter === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              In Progress
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dates, goals, tasks, or follow-ups..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-neutral-200 focus:outline-hidden focus:border-blue-500 bg-neutral-50 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Plans List */}
      {filteredPlans.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-neutral-300 p-8 text-center">
          <Calendar className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-neutral-700">No matching day plans found</p>
          <p className="text-xs text-neutral-500 mt-1">
            {searchQuery
              ? 'Try adjusting your search criteria.'
              : 'Plans will appear here as you create and save them.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPlans.map((plan) => {
            const stats = calculateProgress(plan);
            const activeTop = plan.topTasks.filter((t) => t.text.trim());
            const completedTop = activeTop.filter((t) => t.completed);
            const pendingTop = activeTop.filter((t) => !t.completed);

            const activeOther = plan.otherTasks.filter((t) => t.text.trim());
            const completedOther = activeOther.filter((t) => t.completed);
            const pendingOther = activeOther.filter((t) => !t.completed);

            const totalCompleted = completedTop.length + completedOther.length;
            const totalPending = pendingTop.length + pendingOther.length;

            return (
              <div
                key={plan.date}
                onClick={() => onSelectDate(plan.date)}
                className="group bg-white rounded-xl border-2 border-neutral-200 hover:border-blue-400 p-4 sm:p-5 shadow-xs transition-all cursor-pointer relative"
              >
                {/* Top Row: Date & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-base font-bold text-neutral-900">
                      {formatDisplayDate(plan.date)}
                    </span>
                    <span className="text-xs font-mono text-neutral-400">({plan.date})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {plan.doneToday === true && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        Day Complete
                      </span>
                    )}
                    {plan.productivityScore && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        ⭐ {plan.productivityScore}/10
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleDelete(plan.date, e)}
                      title="Delete this day's record"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-neutral-400 hover:text-rose-600 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Goal */}
                <div className="mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                    🎯 Main Goal
                  </span>
                  <p
                    className={`text-sm sm:text-base font-semibold text-neutral-900 mt-0.5 ${
                      handwritingFont ? 'font-marker' : 'font-sans'
                    }`}
                  >
                    {plan.goal.trim() || <span className="italic text-neutral-500 font-normal">No goal set</span>}
                  </p>
                </div>

                {/* Tasks Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-xs">
                  {/* Completed summary */}
                  <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/60">
                    <span className="font-bold text-emerald-800 block mb-1">
                      Completed Tasks ({totalCompleted})
                    </span>
                    {totalCompleted === 0 ? (
                      <span className="text-neutral-600 italic">None completed</span>
                    ) : (
                      <ul className="space-y-0.5 max-h-24 overflow-y-auto">
                        {[...completedTop, ...completedOther].slice(0, 3).map((t) => (
                          <li key={t.id} className="truncate line-through text-neutral-600">
                            • {t.text}
                          </li>
                        ))}
                        {totalCompleted > 3 && (
                          <li className="text-[11px] text-emerald-800 font-medium">
                            +{totalCompleted - 3} more completed
                          </li>
                        )}
                      </ul>
                    )}
                  </div>

                  {/* Incomplete / Pending summary */}
                  <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
                    <span className="font-bold text-neutral-700 block mb-1">
                      Incomplete Tasks ({totalPending})
                    </span>
                    {totalPending === 0 ? (
                      <span className="text-emerald-700 font-medium">All tasks cleared ✓</span>
                    ) : (
                      <ul className="space-y-0.5 max-h-24 overflow-y-auto">
                        {[...pendingTop, ...pendingOther].slice(0, 3).map((t) => (
                          <li key={t.id} className="truncate text-neutral-700">
                            • {t.text}
                          </li>
                        ))}
                        {totalPending > 3 && (
                          <li className="text-[11px] text-neutral-500 font-medium">
                            +{totalPending - 3} more pending
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Tomorrow's Task if present */}
                {plan.tomorrowTask.trim() && (
                  <div className="pt-2 border-t border-neutral-100 flex items-center gap-2 text-xs text-neutral-700">
                    <span className="font-bold text-blue-700 shrink-0">Tomorrow #1:</span>
                    <span className="truncate">{plan.tomorrowTask}</span>
                  </div>
                )}

                {/* Footer Action indicator */}
                <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-blue-700 group-hover:text-blue-800">
                  <span>
                    Progress: {stats.percent}% ({stats.topDone}/3 Top Priorities)
                  </span>
                  <span className="flex items-center gap-1">
                    <span>Open & Edit Plan</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
