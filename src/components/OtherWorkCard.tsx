import React from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { TaskItem } from '../types';

interface OtherWorkCardProps {
  tasks: TaskItem[];
  onToggleTask: (index: number) => void;
  onUpdateTaskText: (index: number, text: string) => void;
  onAddTask: () => void;
  onDeleteTask: (index: number) => void;
  handwritingFont: boolean;
}

export const OtherWorkCard: React.FC<OtherWorkCardProps> = ({
  tasks,
  onToggleTask,
  onUpdateTaskText,
  onAddTask,
  onDeleteTask,
  handwritingFont,
}) => {
  return (
    <section className="bg-white rounded-xl border-2 border-neutral-200 p-4 sm:p-5 shadow-xs hover:border-neutral-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-label="Briefcase">
            💼
          </span>
          <h2
            className={`text-base sm:text-lg font-bold tracking-wide uppercase text-neutral-900 ${
              handwritingFont ? 'font-marker text-lg sm:text-xl' : 'font-sans'
            }`}
          >
            OTHER WORK
          </h2>
        </div>

        <button
          type="button"
          onClick={onAddTask}
          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {tasks.map((task, index) => {
          const isDone = task.completed;

          return (
            <div
              key={task.id || `other-task-${index}`}
              className={`group flex items-center gap-2.5 p-2 rounded-lg border transition-all ${
                isDone
                  ? 'bg-neutral-50/70 border-neutral-200 opacity-75'
                  : 'bg-white border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {/* Checkbox with comfortable touch area */}
              <button
                type="button"
                role="checkbox"
                aria-checked={isDone}
                aria-label={`Mark other task ${index + 1} as ${isDone ? 'incomplete' : 'complete'}`}
                onClick={() => onToggleTask(index)}
                className="shrink-0 min-w-9 min-h-9 flex items-center justify-center cursor-pointer focus:outline-hidden"
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-neutral-400 bg-white hover:border-blue-600'
                  }`}
                >
                  {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>

              {/* Task Text */}
              <input
                type="text"
                value={task.text}
                onChange={(e) => onUpdateTaskText(index, e.target.value)}
                placeholder={`Other task ${index + 1}...`}
                className={`flex-1 py-1 px-2 text-sm sm:text-base font-normal rounded focus:bg-amber-50/30 focus:outline-hidden transition-colors ${
                  isDone
                    ? 'line-through text-neutral-600'
                    : 'text-neutral-900 placeholder:text-neutral-500'
                } ${handwritingFont ? 'font-marker' : 'font-sans'}`}
              />

              {/* Delete button (allow removing if more than 1 or if user wants to clear) */}
              {tasks.length > 1 && (
                <button
                  type="button"
                  onClick={() => onDeleteTask(index)}
                  title="Remove task"
                  aria-label="Remove task"
                  className="opacity-40 group-hover:opacity-100 hover:text-red-600 text-neutral-500 p-1.5 rounded transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
