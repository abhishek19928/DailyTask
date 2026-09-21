import React from 'react';
import { Plus, Trash2, Check, PhoneCall } from 'lucide-react';
import { FollowUpItem } from '../types';

interface FollowUpCardProps {
  followUps: FollowUpItem[];
  onUpdateFollowUp: (index: number, field: 'contact' | 'action', value: string) => void;
  onToggleFollowUp: (index: number) => void;
  onAddFollowUp: () => void;
  onDeleteFollowUp: (index: number) => void;
  handwritingFont: boolean;
}

const QUICK_TAGS = ['Supplier', 'Customer', 'Payment', 'Order', 'Logistics'];

export const FollowUpCard: React.FC<FollowUpCardProps> = ({
  followUps,
  onUpdateFollowUp,
  onToggleFollowUp,
  onAddFollowUp,
  onDeleteFollowUp,
  handwritingFont,
}) => {
  return (
    <section className="bg-white rounded-xl border-2 border-neutral-200 p-4 sm:p-5 shadow-xs hover:border-neutral-300 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-label="Phone">
            📞
          </span>
          <h2
            className={`text-base sm:text-lg font-bold tracking-wide uppercase text-neutral-900 ${
              handwritingFont ? 'font-marker text-lg sm:text-xl' : 'font-sans'
            }`}
          >
            FOLLOW-UP
          </h2>
        </div>

        <button
          type="button"
          onClick={onAddFollowUp}
          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Follow-Up</span>
        </button>
      </div>

      <p className="text-xs text-neutral-500 mb-3 font-medium">
        Key stakeholders to contact today (Suppliers, Customers, Orders, Payments)
      </p>

      {/* Quick Insert Tags */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wide mr-1">
          Quick:
        </span>
        {QUICK_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              // Find first empty follow up or add one
              const emptyIdx = followUps.findIndex((f) => !f.contact.trim());
              if (emptyIdx !== -1) {
                onUpdateFollowUp(emptyIdx, 'contact', tag);
              } else {
                onAddFollowUp();
                setTimeout(() => {
                  onUpdateFollowUp(followUps.length, 'contact', tag);
                }, 50);
              }
            }}
            className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition-colors cursor-pointer"
          >
            +{tag}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {followUps.map((item, index) => {
          const isDone = !!item.completed;

          return (
            <div
              key={item.id || `followup-${index}`}
              className={`group p-3 rounded-lg border transition-all ${
                isDone
                  ? 'bg-neutral-50 border-neutral-200 opacity-75'
                  : 'bg-white border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                {/* Complete checkbox */}
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isDone}
                  aria-label={`Mark follow-up ${index + 1} as done`}
                  onClick={() => onToggleFollowUp(index)}
                  className="shrink-0 min-w-8 min-h-8 flex items-center justify-center cursor-pointer mt-1"
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

                {/* 2 Field Layout: Person/Company and Action */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-0.5">
                      Person / Company
                    </label>
                    <input
                      type="text"
                      value={item.contact}
                      onChange={(e) => onUpdateFollowUp(index, 'contact', e.target.value)}
                      placeholder="e.g. Supplier / Acme Corp"
                      className={`w-full py-1.5 px-2.5 text-sm font-medium rounded-md border border-neutral-200 focus:bg-amber-50/20 focus:border-blue-500 focus:outline-hidden transition-colors ${
                        isDone ? 'line-through text-neutral-600' : 'text-neutral-900 placeholder:text-neutral-500'
                      } ${handwritingFont ? 'font-marker' : 'font-sans'}`}
                    />
                  </div>

                  <div className="sm:col-span-7">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-0.5">
                      Action
                    </label>
                    <input
                      type="text"
                      value={item.action}
                      onChange={(e) => onUpdateFollowUp(index, 'action', e.target.value)}
                      placeholder="e.g. Confirm container dispatch & tracking code"
                      className={`w-full py-1.5 px-2.5 text-sm font-medium rounded-md border border-neutral-200 focus:bg-amber-50/20 focus:border-blue-500 focus:outline-hidden transition-colors ${
                        isDone ? 'line-through text-neutral-600' : 'text-neutral-900 placeholder:text-neutral-500'
                      } ${handwritingFont ? 'font-marker' : 'font-sans'}`}
                    />
                  </div>
                </div>

                {/* Delete */}
                {followUps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeleteFollowUp(index)}
                    title="Remove follow up"
                    aria-label="Remove follow up"
                    className="opacity-40 group-hover:opacity-100 hover:text-red-600 text-neutral-500 p-1.5 mt-4 rounded transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
