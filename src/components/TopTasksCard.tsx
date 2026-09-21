import React from 'react';
import { Check } from 'lucide-react';
import { TaskItem } from '../types';

interface TopTasksCardProps {
  tasks: TaskItem[];
  onToggleTask: (index: number) => void;
  onUpdateTaskText: (index: number, text: string) => void;
  handwritingFont: boolean;
}

export const TopTasksCard: React.FC<TopTasksCardProps> = ({
  tasks,
  onToggleTask,
  onUpdateTaskText,
  handwritingFont,
}) => {
  const completedCount = tasks.filter((t) => t.completed && t.text.trim().length > 0).length;
  const activeCount = tasks.filter((t) => t.text.trim().length > 0).length;

  return (
    <section className="bg-white rounded-xl border-2 border-neutral-200 p-4 sm:p-5 shadow-xs hover:border-neutral-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-label="Star">
            ⭐
          </span>
          <h2
            className={`text-base sm:text-lg font-bold tracking-wide uppercase text-neutral-900 ${
              handwritingFont ? 'font-marker text-lg sm:text-xl' : 'font-sans'
            }`}
          >
            TOP 3 TASKS
          </h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
          {completedCount} of {activeCount || 3} Completed
        </span>
      </div>

      <div className="space-y-3">
        {tasks.slice(0, 3).map((task, index) => {
          const numberLabel = index + 1;
          const isDone = task.completed;

          return (
            <div
              key={task.id || `top-task-${index}`}
              className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all ${
                isDone
                  ? 'bg-neutral-50/80 border-neutral-200 opacity-80'
                  : 'bg-white border-neutral-200/90 hover:border-neutral-300 shadow-2xs'
              }`}
            >
              {/* Large Dry-Erase Whiteboard Checkbox with 44px touch container */}
              <button
                type="button"
                role="checkbox"
                aria-checked={isDone}
                aria-label={`Mark task ${numberLabel} as ${isDone ? 'incomplete' : 'complete'}`}
                onClick={() => onToggleTask(index)}
                className="shrink-0 min-w-10 min-h-10 flex items-center justify-center -ml-1 -mt-1 cursor-pointer focus:outline-hidden"
              >
                <div
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                      : 'border-neutral-400 bg-white hover:border-blue-600'
                  }`}
                >
                  {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </button>

              {/* Number Badge */}
              <span className="text-sm font-bold text-neutral-600 mt-2 shrink-0">
                {numberLabel}.
              </span>

              {/* Task Text Input */}
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={task.text}
                  onChange={(e) => onUpdateTaskText(index, e.target.value)}
                  placeholder={`Important task ${numberLabel}...`}
                  className={`w-full py-1.5 px-2 text-sm sm:text-base font-medium rounded-md focus:bg-amber-50/30 focus:outline-hidden transition-colors ${
                    isDone
                      ? 'line-through text-neutral-600'
                      : 'text-neutral-900 placeholder:text-neutral-500'
                  } ${handwritingFont ? 'font-marker' : 'font-sans'}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
