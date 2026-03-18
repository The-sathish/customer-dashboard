import React, { useState, useEffect, useRef } from 'react';
import { Responsive } from 'react-grid-layout';
import { useDashboardStore } from '../store/useDashboardStore';
import { WidgetFrame } from './WidgetFrame';
import { WidgetRenderer } from './WidgetRenderer';
import { WidgetSettings } from './WidgetSettings';
import { OrderService, DashboardService, Order } from '../services/api';
import { Plus, Save, Edit3, Undo2, Redo2, Filter, Layout as LayoutIcon, BarChart3, Table as TableIcon, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

export const Dashboard: React.FC = () => {
  const { 
    widgets, layout, isEditing, globalFilter, 
    setWidgets, setLayout, setEditing, setGlobalFilter, 
    addWidget, undo, redo 
  } = useDashboardStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, dashboardData] = await Promise.all([
          OrderService.getOrders(),
          DashboardService.getDashboard()
        ]);
        setOrders(ordersData);
        if (dashboardData) {
          setWidgets(dashboardData.widgets);
          setLayout(dashboardData.layout);
        }
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      await DashboardService.saveDashboard(layout, widgets);
      setEditing(false);
      toast.success('Dashboard saved successfully');
    } catch (error) {
      toast.error('Failed to save dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Toolbar */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <LayoutIcon className="w-6 h-6 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-800">Analytics Dashboard</h1>
          </div>
          
          <div className="h-8 w-px bg-slate-200" />
          
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <Filter className="w-4 h-4 text-slate-500 ml-2" />
            <select 
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-700 outline-none pr-2 py-1"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing && (
            <>
              <button onClick={undo} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title="Undo">
                <Undo2 className="w-5 h-5" />
              </button>
              <button onClick={redo} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title="Redo">
                <Redo2 className="w-5 h-5" />
              </button>
              <div className="h-8 w-px bg-slate-200 mx-1" />
            </>
          )}
          
          {!isEditing ? (
            <button 
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-all shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
              Configure
            </button>
          ) : (
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
            >
              <Save className="w-4 h-4" />
              Save Layout
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Widget Library */}
        {isEditing && (
          <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 animate-in slide-in-from-left duration-300">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Widget Library</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <section>
                <h3 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-3 h-3" /> Charts
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {['bar', 'line', 'area', 'pie', 'scatter'].map((type) => (
                    <button
                      key={type}
                      onClick={() => addWidget(type as any)}
                      className="p-3 border border-slate-100 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-600 hover:text-blue-600 transition-all flex flex-col items-center gap-2 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase">{type}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2">
                  <Hash className="w-3 h-3" /> Metrics
                </h3>
                <button
                  onClick={() => addWidget('kpi')}
                  className="w-full p-3 border border-slate-100 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-600 hover:text-blue-600 transition-all flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                    <Hash className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase">KPI Card</span>
                </button>
              </section>

              <section>
                <h3 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2">
                  <TableIcon className="w-3 h-3" /> Data
                </h3>
                <button
                  onClick={() => addWidget('table')}
                  className="w-full p-3 border border-slate-100 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-600 hover:text-blue-600 transition-all flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                    <TableIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase">Data Table</span>
                </button>
              </section>
            </div>
          </aside>
        )}

        {/* Main Canvas */}
        <main ref={containerRef} className="flex-1 overflow-y-auto p-6 relative">
          {widgets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <LayoutIcon className="w-10 h-10 text-slate-300" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Your dashboard is empty</h2>
              <p className="text-slate-500 mt-2 max-w-sm">
                Start by adding widgets from the library to visualize your order data.
              </p>
              {!isEditing && (
                <button 
                  onClick={() => setEditing(true)}
                  className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Widget
                </button>
              )}
            </div>
          ) : (
            <Responsive
              className="layout"
              width={containerWidth}
              layouts={{ lg: layout }}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 8, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={100}
              // @ts-ignore
              draggableHandle=".drag-handle"
              onLayoutChange={(currentLayout) => setLayout(currentLayout as any)}
              isDraggable={isEditing}
              isResizable={isEditing}
              margin={[16, 16]}
            >
              {widgets.map((widget) => (
                <div key={widget.id}>
                  <WidgetFrame 
                    config={widget} 
                    isEditing={isEditing}
                    onSettings={() => setSelectedWidgetId(widget.id)}
                  >
                    <WidgetRenderer config={widget} data={orders} globalFilter={globalFilter} />
                  </WidgetFrame>
                </div>
              ))}
            </Responsive>
          )}
        </main>

        {/* Right Panel: Settings */}
        {selectedWidgetId && (
          <WidgetSettings 
            widgetId={selectedWidgetId} 
            onClose={() => setSelectedWidgetId(null)} 
          />
        )}
      </div>
    </div>
  );
};
