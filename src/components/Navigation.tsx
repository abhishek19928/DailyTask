import React from 'react';
import { Calendar, History, Settings } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  savedDaysCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  savedDaysCount = 0,
}) => {
  const navItems = [
    { id: 'today' as ActiveTab, label: 'Today', icon: Calendar },
    {
      id: 'history' as ActiveTab,
      label: 'History',
      icon: History,
      badge: savedDaysCount > 0 ? savedDaysCount : undefined,
    },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Top Navigation Tabs */}
      <nav className="hidden sm:flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200 shadow-2xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200/80'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-neutral-500'}`} />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-blue-100 text-blue-800' : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mobile Fixed Bottom Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-neutral-200 px-6 py-2 shadow-lg">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all cursor-pointer relative min-h-[48px] justify-center ${
                  isActive ? 'text-blue-600 font-bold' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-2 text-[9px] font-bold px-1 rounded-full bg-neutral-200 text-neutral-700">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px]">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-blue-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
