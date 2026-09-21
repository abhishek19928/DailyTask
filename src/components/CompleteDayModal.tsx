import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, ArrowRight, X } from 'lucide-react';
import { DayPlan } from '../types';
import { formatDisplayDate, shiftDateString, loadDayPlan, saveDayPlan, generateId } from '../utils/storage';

interface CompleteDayModalProps {
  plan: DayPlan;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDate: (dateStr: string) => void;
  handwritingFont: boolean;
}

export const CompleteDayModal: React.FC<CompleteDayModalProps> = ({
  plan,
  isOpen,
  onClose,
  onNavigateToDate,
  handwritingFont,
}) => {
  const [copied, setCopied] = useState(false);
  const [carriedOver, setCarriedOver] = useState(false);

  if (!isOpen) return null;

  // Compute lists
  const completedTop = plan.topTasks.filter((t) => t.completed && t.text.trim());
  const pendingTop = plan.topTasks.filter((t) => !t.completed && t.text.trim());

  const completedOther = plan.otherTasks.filter((t) => t.completed && t.text.trim());
  const pendingOther = plan.otherTasks.filter((t) => !t.completed && t.text.trim());

  const completedFollowUps = plan.followUps.filter((f) => f.completed && (f.contact.trim() || f.action.trim()));
  const pendingFollowUps = plan.followUps.filter((f) => !f.completed && (f.contact.trim() || f.action.trim()));

  const allCompletedTasks = [...completedTop, ...completedOther];
  const allPendingTasks = [...pendingTop, ...pendingOther];

  // Prepare text for copying
  const generateSummaryText = () => {
    let text = `📋 MY DAILY PLAN SUMMARY – ${formatDisplayDate(plan.date)}\n\n`;
    text += `🎯 MAIN GOAL:\n${plan.goal.trim() || '(No goal set)'}\n\n`;

    text += `✅ COMPLETED TASKS (${allCompletedTasks.length}):\n`;
    if (allCompletedTasks.length === 0) {
      text += `• None recorded\n`;
    } else {
      allCompletedTasks.forEach((t) => {
        text += `• ${t.text}\n`;
      });
    }

    text += `\n⏳ PENDING TASKS (${allPendingTasks.length}):\n`;
    if (allPendingTasks.length === 0) {
      text += `• None – All clear!\n`;
    } else {
      allPendingTasks.forEach((t) => {
        text += `• ${t.text}\n`;
      });
    }

    if (plan.followUps.length > 0) {
      text += `\n📞 FOLLOW-UPS:\n`;
      plan.followUps.forEach((f) => {
        if (f.contact.trim() || f.action.trim()) {
          text += `• ${f.completed ? '[DONE] ' : '[PENDING] '}${f.contact}: ${f.action}\n`;
        }
      });
    }

    text += `\n🚀 TOMORROW'S #1 TASK:\n${plan.tomorrowTask.trim() || '(Not set yet)'}\n`;
    if (plan.productivityScore) {
      text += `\n⭐ PRODUCTIVITY SCORE: ${plan.productivityScore}/10\n`;
    }
    return text;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateSummaryText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleCarryForwardToTomorrow = () => {
    const tomorrowStr = shiftDateString(plan.date, 1);
    const tomorrowPlan = loadDayPlan(tomorrowStr);

    // If tomorrow doesn't have goal yet, set from tomorrowTask
    if (!tomorrowPlan.goal.trim() && plan.tomorrowTask.trim()) {
      tomorrowPlan.goal = plan.tomorrowTask.trim();
    }

    // Add pending tasks to tomorrow's tasks if not already present
    const existingTexts = new Set([
      ...tomorrowPlan.topTasks.map((t) => t.text.trim().toLowerCase()),
      ...tomorrowPlan.otherTasks.map((t) => t.text.trim().toLowerCase()),
    ]);

    // Fill top tasks if slots are empty
    allPendingTasks.forEach((pending) => {
      if (!existingTexts.has(pending.text.trim().toLowerCase())) {
        const emptyTopIdx = tomorrowPlan.topTasks.findIndex((t) => !t.text.trim());
        if (emptyTopIdx !== -1) {
          tomorrowPlan.topTasks[emptyTopIdx] = {
            id: generateId(),
            text: pending.text,
            completed: false,
          };
          existingTexts.add(pending.text.trim().toLowerCase());
        } else {
          tomorrowPlan.otherTasks.push({
            id: generateId(),
            text: pending.text,
            completed: false,
          });
          existingTexts.add(pending.text.trim().toLowerCase());
        }
      }
    });

    // Also carry forward pending follow-ups
    pendingFollowUps.forEach((pf) => {
      const exists = tomorrowPlan.followUps.some(
        (f) => f.contact.trim().toLowerCase() === pf.contact.trim().toLowerCase()
      );
      if (!exists) {
        tomorrowPlan.followUps.push({
          id: generateId(),
          contact: pf.contact,
          action: pf.action,
          completed: false,
        });
      }
    });

    saveDayPlan(tomorrowPlan);
    setCarriedOver(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fade-in">
      <div className="bg-white rounded-2xl border-2 border-neutral-300 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-200 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2
                className={`text-lg sm:text-xl font-bold text-neutral-900 ${
                  handwritingFont ? 'font-marker' : 'font-sans'
                }`}
              >
                Day Review Complete
              </h2>
              <p className="text-xs text-neutral-500 font-medium">
                {formatDisplayDate(plan.date)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Summary */}
        <div className="space-y-4 text-sm">
          {/* Main Goal */}
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
              🎯 Main Goal
            </span>
            <p className="font-semibold text-neutral-900">
              {plan.goal.trim() || <span className="italic text-neutral-500">No goal entered</span>}
            </p>
          </div>

          {/* Completed Tasks */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                Completed Tasks ({allCompletedTasks.length})
              </span>
            </div>
            {allCompletedTasks.length === 0 ? (
              <p className="text-xs text-neutral-500 italic">No tasks completed yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {allCompletedTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-2 text-xs sm:text-sm text-neutral-800"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span className="line-through text-neutral-600">{task.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pending Tasks */}
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-amber-800 mb-1.5">
              ⏳ Pending Tasks ({allPendingTasks.length})
            </span>
            {allPendingTasks.length === 0 ? (
              <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-2 rounded border border-emerald-200">
                🎉 All tasks completed! Great focus today.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {allPendingTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-2 text-xs sm:text-sm text-neutral-700 font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>{task.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Tomorrow's #1 Task */}
          <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-blue-900 mb-1">
              🚀 Tomorrow&apos;s #1 Task
            </span>
            <p className="font-semibold text-neutral-900">
              {plan.tomorrowTask.trim() || (
                <span className="italic text-neutral-500">Not specified yet</span>
              )}
            </p>
          </div>

          {/* Productivity Score */}
          {plan.productivityScore && (
            <div className="flex items-center justify-between text-xs font-semibold px-3 py-2 rounded-lg bg-neutral-100 text-neutral-800">
              <span>Day Productivity Score</span>
              <span className="text-sm font-bold text-blue-700">
                {plan.productivityScore} / 10
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-neutral-200 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Summary Copied!' : 'Copy Summary'}</span>
          </button>

          {allPendingTasks.length > 0 && (
            <button
              type="button"
              onClick={handleCarryForwardToTomorrow}
              disabled={carriedOver}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                carriedOver
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <span>{carriedOver ? 'Carried to Tomorrow ✓' : 'Carry to Tomorrow'}</span>
              {!carriedOver && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
