import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { OrderManagement } from './components/OrderManagement';
import { SalesDashboard } from './components/SalesDashboard';
import { LoginPage } from './components/LoginPage';
import { LayoutDashboard, ShoppingCart, Settings as SettingsIcon, Bell, User, Search, TrendingUp, LogOut } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'sales'>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(authStatus === 'true');
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <LoginPage onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      <Toaster position="top-right" richColors />
      
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-slate-900 text-slate-400 flex flex-col shrink-0 transition-all duration-300">
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="hidden lg:block font-black text-white tracking-tight text-xl">DashCraft</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
              activeTab === 'dashboard' ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" : "hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="hidden lg:block font-bold">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('sales')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
              activeTab === 'sales' ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" : "hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="hidden lg:block font-bold">Sales Analytics</span>
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
              activeTab === 'orders' ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" : "hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden lg:block font-bold">Orders</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-slate-200 transition-all">
            <SettingsIcon className="w-5 h-5" />
            <span className="hidden lg:block font-bold">Settings</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-900/20 hover:text-red-400 transition-all text-slate-500"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden lg:block font-bold">Logout</span>
          </button>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">JD</div>
            <div className="hidden lg:flex flex-col">
              <span className="text-xs font-bold text-white">John Doe</span>
              <span className="text-[10px] text-slate-500">Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="relative w-96 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search anything..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <button className="flex items-center gap-2 p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' ? <Dashboard /> : activeTab === 'sales' ? <SalesDashboard /> : <OrderManagement />}
      </div>
    </div>
  );
}
