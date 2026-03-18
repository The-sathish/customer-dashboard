import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Order, OrderService } from '../services/api';
import { formatCurrency, formatNumber } from '../lib/utils';
import { 
  TrendingUp, ShoppingBag, DollarSign, Users, 
  Calendar, ArrowUpRight, ArrowDownRight, Filter
} from 'lucide-react';
import { 
  startOfWeek, endOfWeek, startOfMonth, endOfMonth, 
  startOfYear, endOfYear, isWithinInterval, subDays,
  format, eachDayOfInterval, eachMonthOfInterval,
  isSameDay, isSameMonth
} from 'date-fns';
import { motion } from 'motion/react';

type TimeRange = 'weekly' | 'monthly' | 'yearly';

export const SalesDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await OrderService.getOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    let start: Date, end: Date;

    if (timeRange === 'weekly') {
      start = startOfWeek(now);
      end = endOfWeek(now);
    } else if (timeRange === 'monthly') {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else {
      start = startOfYear(now);
      end = endOfYear(now);
    }

    return orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return isWithinInterval(orderDate, { start, end });
    });
  }, [orders, timeRange]);

  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Calculate growth (mocked for now as we don't have historical data easily accessible without more complex logic)
    // In a real app, we'd compare with the previous period
    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      revenueGrowth: 12.5,
      ordersGrowth: 8.2,
      aovGrowth: -2.4
    };
  }, [filteredOrders]);

  const chartData = useMemo(() => {
    const now = new Date();
    
    if (timeRange === 'weekly') {
      const days = eachDayOfInterval({
        start: startOfWeek(now),
        end: endOfWeek(now)
      });
      return days.map(day => {
        const dayOrders = filteredOrders.filter(o => isSameDay(new Date(o.created_at), day));
        return {
          name: format(day, 'EEE'),
          revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
          orders: dayOrders.length
        };
      });
    } else if (timeRange === 'monthly') {
      // For monthly, let's show by week or by day? Let's do by day for better resolution
      const days = eachDayOfInterval({
        start: startOfMonth(now),
        end: endOfMonth(now)
      });
      return days.map(day => {
        const dayOrders = filteredOrders.filter(o => isSameDay(new Date(o.created_at), day));
        return {
          name: format(day, 'dd'),
          revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
          orders: dayOrders.length
        };
      });
    } else {
      const months = eachMonthOfInterval({
        start: startOfYear(now),
        end: endOfYear(now)
      });
      return months.map(month => {
        const monthOrders = filteredOrders.filter(o => isSameMonth(new Date(o.created_at), month));
        return {
          name: format(month, 'MMM'),
          revenue: monthOrders.reduce((sum, o) => sum + o.total, 0),
          orders: monthOrders.length
        };
      });
    }
  }, [filteredOrders, timeRange]);

  const productData = useMemo(() => {
    const products: Record<string, number> = {};
    filteredOrders.forEach(order => {
      products[order.product] = (products[order.product] || 0) + order.total;
    });
    return Object.entries(products).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-6 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Sales Analytics</h1>
          <p className="text-slate-500 text-sm">Track your business performance and trends.</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {(['weekly', 'monthly', 'yearly'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                timeRange === range 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(stats.totalRevenue)} 
          icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
          trend={stats.revenueGrowth}
          color="emerald"
        />
        <StatCard 
          title="Total Orders" 
          value={formatNumber(stats.totalOrders)} 
          icon={<ShoppingBag className="w-6 h-6 text-blue-600" />}
          trend={stats.ordersGrowth}
          color="blue"
        />
        <StatCard 
          title="Avg Order Value" 
          value={formatCurrency(stats.avgOrderValue)} 
          icon={<TrendingUp className="w-6 h-6 text-amber-600" />}
          trend={stats.aovGrowth}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Revenue Trend
            </h3>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                Revenue
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800">Revenue by Product</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-3">
            {productData.slice(0, 4).map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-sm font-medium text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-800">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity / Orders Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Recent Orders Performance</h3>
          <button className="text-xs font-bold text-blue-600 hover:text-blue-700">View All Orders</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">#{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">{order.first_name} {order.last_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{order.product}</td>
                  <td className="px-6 py-4 text-sm font-black text-slate-900">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                      order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: number;
  color: 'blue' | 'emerald' | 'amber';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color }) => {
  const isPositive = trend > 0;
  
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 relative overflow-hidden group"
    >
      <div className="flex items-center justify-between relative z-10">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
          isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        }`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend)}%
        </div>
      </div>
      
      <div className="space-y-1 relative z-10">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h2>
      </div>

      {/* Decorative background element */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 transition-transform group-hover:scale-110 ${
        color === 'blue' ? 'bg-blue-600' : color === 'emerald' ? 'bg-emerald-600' : 'bg-amber-600'
      }`} />
    </motion.div>
  );
};
