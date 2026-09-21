import React, { useState } from 'react';
import { Type, Download, Upload, Trash2, RefreshCw, Check, Info } from 'lucide-react';
import { AppSettings } from '../types';
import { loadAllPlans, saveDayPlan, DEFAULT_SETTINGS } from '../utils/storage';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onResetAllData: () => void;
  onRestoreSampleData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetAllData,
  onRestoreSampleData,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExportJSON = () => {
    const plans = loadAllPlans();
    const exportObject = {
      version: 1,
      appName: 'My Daily Plan',
      exportDate: new Date().toISOString(),
      settings,
      plans,
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-daily-plan-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.plans)) {
          parsed.plans.forEach((plan: any) => {
            if (plan.date) {
              saveDayPlan(plan);
            }
          });
          if (parsed.settings) {
            onUpdateSettings(parsed.settings);
          }
          setImportStatus(`Successfully restored ${parsed.plans.length} day plans!`);
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportStatus('Invalid backup file format.');
          setTimeout(() => setImportStatus(null), 4000);
        }
      } catch (err) {
        console.error(err);
        setImportStatus('Failed to read or parse file.');
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Title */}
      <div className="bg-white rounded-xl border-2 border-neutral-200 p-5 shadow-xs">
        <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-neutral-900 mb-1">
          APP SETTINGS
        </h2>
        <p className="text-xs text-neutral-500 font-medium">
          Customize your whiteboard experience and manage your data
        </p>
      </div>

      {/* Visual & Typography */}
      <div className="bg-white rounded-xl border-2 border-neutral-200 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
          <Type className="w-4 h-4 text-blue-600" />
          <span>Visual & Typography</span>
        </h3>

        {/* Handwriting Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-neutral-100">
          <div>
            <span className="block text-sm font-semibold text-neutral-900">
              Whiteboard Marker Handwriting
            </span>
            <span className="block text-xs text-neutral-500 font-medium">
              Use casual whiteboard marker handwriting font for headings and tasks
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                ...settings,
                handwritingFont: !settings.handwritingFont,
              })
            }
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              settings.handwritingFont ? 'bg-blue-600' : 'bg-neutral-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 left-0.5 ${
                settings.handwritingFont ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Carry Forward Tasks */}
        <div className="flex items-center justify-between py-2">
          <div>
            <span className="block text-sm font-semibold text-neutral-900">
              Carry-Forward Pending Tasks
            </span>
            <span className="block text-xs text-neutral-500 font-medium">
              Quickly carry unfinished tasks into the next day&apos;s plan
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                ...settings,
                carryForwardPending: !settings.carryForwardPending,
              })
            }
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              settings.carryForwardPending ? 'bg-blue-600' : 'bg-neutral-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 left-0.5 ${
                settings.carryForwardPending ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Data Backup & Export */}
      <div className="bg-white rounded-xl border-2 border-neutral-200 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Data Storage & Backup</span>
        </h3>

        <p className="text-xs text-neutral-600">
          All your daily plans are stored locally inside your browser&apos;s storage. You can export
          a full backup file to keep on your device or transfer to another browser.
        </p>

        {importStatus && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800">
            {importStatus}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs sm:text-sm font-bold transition-all cursor-pointer border border-neutral-300">
            <Upload className="w-4 h-4" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Danger Zone / Reset */}
      <div className="bg-white rounded-xl border-2 border-neutral-200 p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
          Data Management
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            type="button"
            onClick={onRestoreSampleData}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restore Demo Samples</span>
          </button>

          <button
            type="button"
            onClick={onResetAllData}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Plans</span>
          </button>
        </div>
      </div>

      {/* Physical Whiteboard Framework Guide */}
      <div className="bg-blue-50/60 rounded-xl border-2 border-blue-200 p-5 text-neutral-800">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-blue-700" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
            The Whiteboard Daily Framework
          </h4>
        </div>
        <p className="text-xs text-neutral-700 leading-relaxed">
          The goal of this system is simplicity and speed: plan your entire day in under 2 minutes.
          Focus on <strong>ONE main goal</strong> and <strong>ONLY 3 top priorities</strong>.
          Log quick follow-ups as they arise, and take 60 seconds at night to review your day and set
          tomorrow&apos;s #1 task.
        </p>
      </div>
    </div>
  );
};
