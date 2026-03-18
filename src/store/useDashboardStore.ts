import { create } from 'zustand';
import { Layout } from 'react-grid-layout';

export type WidgetType = 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'table' | 'kpi';

export interface GridLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  metric?: string;
  aggregation?: 'sum' | 'avg' | 'count';
  xAxis?: string;
  yAxis?: string;
  color?: string;
  showLabels?: boolean;
  showLegend?: boolean;
  columns?: string[];
  fontSize?: number;
  headerColor?: string;
  precision?: number;
  format?: 'number' | 'currency';
}

interface DashboardState {
  widgets: WidgetConfig[];
  layout: Layout;
  isEditing: boolean;
  globalFilter: string;
  history: { widgets: WidgetConfig[]; layout: Layout }[];
  historyIndex: number;

  setWidgets: (widgets: WidgetConfig[]) => void;
  setLayout: (layout: Layout) => void;
  setEditing: (isEditing: boolean) => void;
  setGlobalFilter: (filter: string) => void;
  addWidget: (type: WidgetType) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, config: Partial<WidgetConfig>) => void;
  duplicateWidget: (id: string) => void;
  
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  widgets: [],
  layout: [],
  isEditing: false,
  globalFilter: 'all',
  history: [],
  historyIndex: -1,

  setWidgets: (widgets) => set({ widgets }),
  setLayout: (layout) => set({ layout }),
  setEditing: (isEditing) => set({ isEditing }),
  setGlobalFilter: (globalFilter) => set({ globalFilter }),

  saveToHistory: () => {
    const { widgets, layout, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ widgets: JSON.parse(JSON.stringify(widgets)), layout: JSON.parse(JSON.stringify(layout)) });
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  addWidget: (type) => {
    const id = `widget-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newWidget: WidgetConfig = {
      id,
      type,
      title: `New ${type.toUpperCase()}`,
      color: '#3b82f6',
      showLabels: true,
      showLegend: true,
      fontSize: 14,
      headerColor: '#f3f4f6',
      precision: 2,
      format: 'number',
    };
    
    const newLayoutItem = {
      i: id,
      x: (get().layout.length * 4) % 12,
      y: Infinity,
      w: type === 'kpi' ? 3 : 6,
      h: type === 'kpi' ? 2 : 4,
    };

    set((state) => ({
      widgets: [...state.widgets, newWidget],
      layout: [...state.layout, newLayoutItem],
    }));
    get().saveToHistory();
  },

  removeWidget: (id) => {
    set((state) => ({
      widgets: state.widgets.filter((w) => w.id !== id),
      layout: state.layout.filter((l) => l.i !== id),
    }));
    get().saveToHistory();
  },

  updateWidget: (id, config) => {
    set((state) => ({
      widgets: state.widgets.map((w) => (w.id === id ? { ...w, ...config } : w)),
    }));
    get().saveToHistory();
  },

  duplicateWidget: (id) => {
    const widget = get().widgets.find((w) => w.id === id);
    if (!widget) return;
    const newId = `widget-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newWidget = { ...widget, id: newId, title: `${widget.title} (Copy)` };
    const layoutItem = get().layout.find((l) => l.i === id);
    const newLayoutItem = layoutItem 
      ? { ...layoutItem, i: newId, x: (layoutItem.x + 2) % 12, y: layoutItem.y + 1 } 
      : { i: newId, x: 0, y: Infinity, w: 4, h: 4 };
    
    set((state) => ({
      widgets: [...state.widgets, newWidget],
      layout: [...state.layout, newLayoutItem],
    }));
    get().saveToHistory();
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      set({
        widgets: prevState.widgets,
        layout: prevState.layout,
        historyIndex: historyIndex - 1,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      set({
        widgets: nextState.widgets,
        layout: nextState.layout,
        historyIndex: historyIndex + 1,
      });
    }
  },
}));
