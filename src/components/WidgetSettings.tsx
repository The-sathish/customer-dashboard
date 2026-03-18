import React from 'react';
import { useDashboardStore, WidgetConfig } from '../store/useDashboardStore';
import { X } from 'lucide-react';

interface WidgetSettingsProps {
  widgetId: string | null;
  onClose: () => void;
}

export const WidgetSettings: React.FC<WidgetSettingsProps> = ({ widgetId, onClose }) => {
  const { widgets, updateWidget } = useDashboardStore();
  const widget = widgets.find(w => w.id === widgetId);

  if (!widget) return null;

  const handleChange = (key: keyof WidgetConfig, value: any) => {
    updateWidget(widget.id, { [key]: value });
  };

  return (
    <div className="w-80 border-l border-slate-200 bg-white h-full flex flex-col shadow-xl animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h2 className="font-bold text-slate-800">Widget Settings</h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <section className="space-y-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">General</label>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Title</label>
            <input 
              type="text" 
              value={widget.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </section>

        {widget.type === 'kpi' && (
          <section className="space-y-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">KPI Config</label>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Metric</label>
                <select 
                  value={widget.metric}
                  onChange={(e) => handleChange('metric', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                >
                  <option value="total">Total Revenue</option>
                  <option value="quantity">Quantity Sold</option>
                  <option value="unit_price">Unit Price</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Aggregation</label>
                <select 
                  value={widget.aggregation}
                  onChange={(e) => handleChange('aggregation', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                >
                  <option value="sum">Sum</option>
                  <option value="avg">Average</option>
                  <option value="count">Count</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Format</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleChange('format', 'number')}
                    className={cn("flex-1 py-2 text-xs font-bold rounded-lg border", widget.format === 'number' ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-white border-slate-200")}
                  >Number</button>
                  <button 
                    onClick={() => handleChange('format', 'currency')}
                    className={cn("flex-1 py-2 text-xs font-bold rounded-lg border", widget.format === 'currency' ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-white border-slate-200")}
                  >Currency</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {['bar', 'line', 'area', 'scatter'].includes(widget.type) && (
          <section className="space-y-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Visuals</label>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Primary Color</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="color" 
                    value={widget.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-none"
                  />
                  <span className="text-xs font-mono text-slate-500 uppercase">{widget.color}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Show Legend</label>
                <input 
                  type="checkbox" 
                  checked={widget.showLegend}
                  onChange={(e) => handleChange('showLegend', e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
              </div>
            </div>
          </section>
        )}

        {widget.type === 'table' && (
          <section className="space-y-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Table Config</label>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Font Size ({widget.fontSize}px)</label>
                <input 
                  type="range" min="12" max="18" 
                  value={widget.fontSize}
                  onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Header Color</label>
                <input 
                  type="color" 
                  value={widget.headerColor}
                  onChange={(e) => handleChange('headerColor', e.target.value)}
                  className="w-full h-10 rounded cursor-pointer border-none"
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

import { cn } from '../lib/utils';
