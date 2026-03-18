import React, { useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { WidgetConfig } from '../store/useDashboardStore';
import { Order } from '../services/api';
import { cn, formatCurrency, formatNumber } from '../lib/utils';
import { subDays, isAfter, startOfDay } from 'date-fns';

interface WidgetRendererProps {
  config: WidgetConfig;
  data: Order[];
  globalFilter: string;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ config, data, globalFilter }) => {
  const filteredData = useMemo(() => {
    if (globalFilter === 'all') return data;
    const now = new Date();
    let cutoff: Date;
    switch (globalFilter) {
      case 'today': cutoff = startOfDay(now); break;
      case '7': cutoff = subDays(now, 7); break;
      case '30': cutoff = subDays(now, 30); break;
      case '90': cutoff = subDays(now, 90); break;
      default: return data;
    }
    return data.filter(order => isAfter(new Date(order.created_at), cutoff));
  }, [data, globalFilter]);

  const chartData = useMemo(() => {
    if (config.type === 'kpi') return null;
    
    // Simple aggregation by product for charts
    const groups: Record<string, any> = {};
    filteredData.forEach(order => {
      const key = order.product;
      if (!groups[key]) groups[key] = { name: key, value: 0, count: 0 };
      groups[key].value += order.total;
      groups[key].count += 1;
    });
    return Object.values(groups);
  }, [filteredData, config.type]);

  const kpiValue = useMemo(() => {
    if (config.type !== 'kpi') return null;
    const metric = config.metric || 'total';
    const values = filteredData.map(d => (d as any)[metric] as number);
    
    if (config.aggregation === 'sum') return values.reduce((a, b) => a + b, 0);
    if (config.aggregation === 'avg') return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    if (config.aggregation === 'count') return values.length;
    return 0;
  }, [filteredData, config]);

  if (config.type === 'kpi') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{config.title}</p>
        <p className="text-3xl font-bold mt-1">
          {config.format === 'currency' ? formatCurrency(kpiValue!) : formatNumber(kpiValue!, config.precision)}
        </p>
      </div>
    );
  }

  if (config.type === 'table') {
    return (
      <div className="h-full overflow-auto p-2">
        <table className="w-full text-left border-collapse">
          <thead style={{ backgroundColor: config.headerColor }}>
            <tr>
              <th className="p-2 border-b text-xs font-semibold uppercase">Product</th>
              <th className="p-2 border-b text-xs font-semibold uppercase">Status</th>
              <th className="p-2 border-b text-xs font-semibold uppercase">Total</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: `${config.fontSize}px` }}>
            {filteredData.slice(0, 10).map(order => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="p-2 border-b">{order.product}</td>
                <td className="p-2 border-b">
                   <span className={cn(
                     "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                     order.status === 'Completed' ? "bg-emerald-100 text-emerald-700" :
                     order.status === 'Pending' ? "bg-amber-100 text-amber-700" :
                     order.status === 'In Progress' ? "bg-blue-100 text-blue-700" :
                     "bg-slate-100 text-slate-700"
                   )}>
                     {order.status}
                   </span>
                </td>
                <td className="p-2 border-b">{formatCurrency(order.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-2">
      <ResponsiveContainer width="100%" height="100%">
        {config.type === 'bar' ? (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip />
            {config.showLegend && <Legend />}
            <Bar dataKey="value" fill={config.color} radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : config.type === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip />
            {config.showLegend && <Legend />}
            <Line type="monotone" dataKey="value" stroke={config.color} strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        ) : config.type === 'area' ? (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip />
            {config.showLegend && <Legend />}
            <Area type="monotone" dataKey="value" stroke={config.color} fill={config.color} fillOpacity={0.1} />
          </AreaChart>
        ) : config.type === 'pie' ? (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            {config.showLegend && <Legend />}
          </PieChart>
        ) : (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="count" name="Orders" />
            <YAxis dataKey="value" name="Revenue" unit="$" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Products" data={chartData} fill={config.color} />
          </ScatterChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
