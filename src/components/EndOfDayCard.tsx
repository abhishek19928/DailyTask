import React from 'react';
import { Check, X, CheckCircle2, Sparkles } from 'lucide-react';
import { DayPlan } from '../types';
import { calculateProgress } from '../utils/storage';

interface EndOfDayCardProps {
  plan: DayPlan;
  onUpdateDoneToday: (value: boolean | null) => void;
  onUpdateTomorrowTask: (text: string) => void;
  onUpdateScore: (score: number | null) => void;
  onCompleteDay: () => void;
  handwritingFont: boolean;
}

export const EndOfDayCard: React.FC<EndOfDayCardProps> = ({
  plan,
  onUpdateDoneToday,
  onUpdateTomorrowTask,
  onUpdateScore,
  onCompleteDay,
  handwritingFont,
}) => {
  const stats = calculateProgress(plan);

  return (
    <section className="bg-white rounded-xl border-2 border-neutral-200 p-4 sm:p-5 shadow-xs hover:border-neutral-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-label="Crescent Moon">
            🌙
          </span>
          <h2
            className={`text-base sm:text-lg font-bold tracking-wide uppercase text-neutral-900 ${
              handwritingFont ? 'font-marker text-lg sm:text-xl' : 'font-sans'
            }`}
          >
            END OF DAY
          </h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
          Evening Review
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column: Done Today Yes/No & Task Tally */}
        <div className="space-y-3.5">
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              DONE TODAY:
            </span>
            <div className="flex items-center gap-3">
              {/* YES Option */}
              <button
                type="button"
                onClick={() => onUpdateDoneToday(plan.doneToday === true ? null : true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border-2 font-semibold text-sm transition-all cursor-pointer ${
                  plan.doneToday === true
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-2xs'
                    : 'bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center ${
                    plan.doneToday === true
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-neutral-400 bg-white'
                  }`}
                >
                  {plan.doneToday === true && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span>Yes</span>
              </button>

              {/* NO Option */}
              <button
                type="button"
                onClick={() => onUpdateDoneToday(plan.doneToday === false ? null : false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border-2 font-semibold text-sm transition-all cursor-pointer ${
                  plan.doneToday === false
                    ? 'bg-rose-50 border-rose-600 text-rose-800 shadow-2xs'
                    : 'bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center ${
                    plan.doneToday === false
                      ? 'bg-rose-600 border-rose-600 text-white'
                      : 'border-neutral-400 bg-white'
                  }`}
                >
                  {plan.doneToday === false && <X className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span>No</span>
              </button>
            </div>
          </div>

          {/* Completed Tasks Tally */}
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
              Completed Tasks:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-neutral-900">
                {stats.totalDone} / {stats.totalCount}
              </span>
              <span className="text-xs text-neutral-500 font-medium">
                ({stats.topDone}/3 Top)
              </span>
            </div>
          </div>
        </div>

        {/* Right column: Tomorrow's #1 Task */}
        <div>
          <label
            htmlFor="tomorrow-task-input"
            className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5"
          >
            TOMORROW&apos;S #1 TASK:
          </label>
          <textarea
            id="tomorrow-task-input"
            rows={3}
            value={plan.tomorrowTask}
            onChange={(e) => onUpdateTomorrowTask(e.target.value)}
            placeholder="What is the single most important task for tomorrow morning?"
            className={`w-full p-2.5 text-sm sm:text-base font-medium text-neutral-900 placeholder:text-neutral-500 bg-neutral-50/50 rounded-lg border border-neutral-300 focus:bg-white focus:border-blue-500 focus:outline-hidden transition-colors resize-none ${
              handwritingFont ? 'font-marker' : 'font-sans'
            }`}
          />
        </div>
      </div>

      {/* Productivity Score 1-10 */}
      <div className="mt-4 pt-3.5 border-t border-neutral-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Productivity Score (1–10):</span>
          </span>
          {plan.productivityScore && (
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Score: {plan.productivityScore}/10
            </span>
          )}
        </div>

        <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
            const isSelected = plan.productivityScore === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => onUpdateScore(isSelected ? null : num)}
                className={`py-1.5 rounded-md text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-900 border-neutral-900 text-white shadow-xs scale-105'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* End of day primary action */}
      <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-end">
        <button
          type="button"
          onClick={onCompleteDay}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-xs hover:shadow transition-all active:scale-98 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Save & Complete Day Review</span>
        </button>
      </div>
    </section>
  );
};
