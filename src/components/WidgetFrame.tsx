import React, { useState } from 'react';
import { useDashboardStore, WidgetConfig } from '../store/useDashboardStore';
import { Settings, Trash2, Copy, GripVertical, X, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface WidgetFrameProps {
  config: WidgetConfig;
  children: React.ReactNode;
  onSettings: () => void;
  isEditing: boolean;
}

export const WidgetFrame: React.FC<WidgetFrameProps> = ({ config, children, onSettings, isEditing }) => {
  const { removeWidget, duplicateWidget } = useDashboardStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeWidget(config.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className={cn(
      "group relative bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full transition-all",
      isEditing && "hover:border-blue-400 hover:shadow-md"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          {isEditing && <GripVertical className="w-4 h-4 text-slate-400 cursor-grab active:cursor-grabbing drag-handle" />}
          <h3 className="text-xs font-semibold text-slate-700 truncate max-w-[150px]">{config.title}</h3>
        </div>
        
        <div className="flex items-center gap-1 transition-opacity opacity-100">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
              <span className="text-[10px] font-bold text-red-500 mr-1">Delete?</span>
              <button 
                onClick={handleDelete}
                className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                title="Confirm Delete"
              >
                <Check className="w-3 h-3" />
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="p-1.5 bg-slate-200 text-slate-600 rounded-md hover:bg-slate-300 transition-colors"
                title="Cancel"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => duplicateWidget(config.id)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                title="Duplicate"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={onSettings}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {children}
      </div>
    </div>
  );
};
