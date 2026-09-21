import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, Sun, Moon } from 'lucide-react';
import { DayPlan } from '../types';
import { calculateProgress, formatDisplayDate, shiftDateString, getTodayDateString } from '../utils/storage';

interface WhiteboardHeaderProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
  plan: DayPlan;
  onCompleteDayClick: () => void;
  handwritingFont: boolean;
}

export const WhiteboardHeader: React.FC<WhiteboardHeaderProps> = ({
  currentDate,
  onDateChange,
  plan,
  onCompleteDayClick,
  handwritingFont,
}) => {
  const todayStr = getTodayDateString();
  const isCurrentToday = currentDate === todayStr;
  const progress = calculateProgress(plan);

  // Determine morning vs evening
  const currentHour = new Date().getHours();
  const isEvening = currentHour >= 18 || currentHour < 5;

  const handlePrevDay = () => {
    onDateChange(shiftDateString(currentDate, -1));
  };

  const handleNextDay = () => {
    onDateChange(shiftDateString(currentDate, 1));
  };

  const handleJumpToday = () => {
    onDateChange(todayStr);
  };

  return (
    <header className="border-b-2 border-neutral-200 bg-white/90 backdrop-blur-xs pb-4 pt-3 px-4 sm:px-6">
      {/* Top Board Frame Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Title and Date */}
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600 shadow-xs"></span>
            <h1
              className={`text-xl sm:text-2xl font-black tracking-wider uppercase text-neutral-900 ${
                handwritingFont ? 'font-marker' : 'font-sans'
              }`}
            >
              MY DAILY PLAN
            </h1>
            {!isCurrentToday && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                Viewing {currentDate}
              </span>
            )}
          </div>

          {/* Date Selector Navigation */}
          <div className="flex items-center gap-1.5 mt-1.5 text-neutral-700">
            <button
              type="button"
              onClick={handlePrevDay}
              aria-label="Previous day"
              className="p-1 rounded-md hover:bg-neutral-100 text-neutral-600 active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="relative flex items-center gap-1 text-sm font-semibold">
              <Calendar className="w-4 h-4 text-blue-600" />
              <input
                type="date"
                value={currentDate}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
                className="opacity-0 absolute inset-0 w-full cursor-pointer"
                title="Change date"
              />
              <span className="underline decoration-neutral-300 underline-offset-4 hover:text-blue-700 cursor-pointer">
                {formatDisplayDate(currentDate)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextDay}
              aria-label="Next day"
              className="p-1 rounded-md hover:bg-neutral-100 text-neutral-600 active:scale-95 transition-transform"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isCurrentToday && (
              <button
                type="button"
                onClick={handleJumpToday}
                className="ml-2 text-xs font-medium px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                Go to Today
              </button>
            )}
          </div>
        </div>

        {/* Action Button: Complete Day */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onCompleteDayClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold shadow-xs hover:shadow transition-all active:scale-98"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Complete Day</span>
          </button>
        </div>
      </div>

      {/* Contextual Morning/Evening Message Banner */}
      <div className="mt-3.5 p-2.5 rounded-lg bg-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-neutral-700">
          {isEvening ? (
            <Moon className="w-4 h-4 text-indigo-500 shrink-0" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 shrink-0" />
          )}
          <span>
            {isEvening ? (
              <>
                <strong className="font-semibold text-neutral-900">Day Review:</strong> What did
                you complete? What is tomorrow&apos;s #1 task?
              </>
            ) : (
              <>
                <strong className="font-semibold text-neutral-900">Good Morning:</strong> Let&apos;s
                plan your day in under 2 minutes.
              </>
            )}
          </span>
        </div>

        {/* Progress summary */}
        <div className="flex items-center gap-2 text-neutral-600 font-medium self-end sm:self-auto">
          <span>
            {progress.topDone} of {progress.topTotal} Top Tasks Done
          </span>
          {progress.totalCount > progress.topTotal && (
            <span className="text-neutral-400">({progress.totalDone} total)</span>
          )}
        </div>
      </div>

      {/* Whiteboard Marker Progress Bar */}
      <div className="mt-2.5">
        <div className="flex justify-between items-center text-xs font-semibold text-neutral-600 mb-1">
          <span className="tracking-wide uppercase text-[11px]">Today&apos;s Progress</span>
          <span className="text-blue-700 font-bold">{progress.percent}%</span>
        </div>
        <div className="w-full bg-neutral-200 h-2.5 rounded-full overflow-hidden p-0.5 border border-neutral-300">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out bg-linear-to-r from-blue-600 to-indigo-600"
            style={{ width: `${Math.min(100, progress.percent)}%` }}
          />
        </div>
      </div>
    </header>
  );
};
