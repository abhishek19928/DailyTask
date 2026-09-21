import React from 'react';
import { Target } from 'lucide-react';

interface GoalCardProps {
  goal: string;
  onChange: (value: string) => void;
  handwritingFont: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onChange,
  handwritingFont,
}) => {
  return (
    <section className="bg-white rounded-xl border-2 border-neutral-200 p-4 sm:p-5 shadow-xs hover:border-neutral-300 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-label="Goal target">
            🎯
          </span>
          <h2
            className={`text-base sm:text-lg font-bold tracking-wide uppercase text-neutral-900 ${
              handwritingFont ? 'font-marker text-lg sm:text-xl' : 'font-sans'
            }`}
          >
            TODAY&apos;S #1 GOAL
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
          Single Priority
        </span>
      </div>

      <p className="text-xs text-neutral-500 mb-2 font-medium">
        What&apos;s the ONE most important result I want today?
      </p>

      <div className="relative">
        <textarea
          rows={2}
          value={goal}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Finalize wholesale pricing sheet & send to distributor..."
          className={`w-full text-base sm:text-lg font-medium text-neutral-900 placeholder:text-neutral-500 bg-amber-50/20 rounded-lg border border-neutral-200 focus:border-blue-500 focus:bg-white focus:outline-hidden p-3 transition-colors resize-none ${
            handwritingFont ? 'font-marker leading-relaxed' : 'font-sans'
          }`}
        />
        {goal.trim().length > 0 && (
          <div className="absolute right-3 bottom-3 text-xs text-neutral-400 font-medium">
            1 Goal Focused
          </div>
        )}
      </div>
    </section>
  );
};
