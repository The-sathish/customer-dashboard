import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Order, OrderService } from '../services/api';
import { 
  Plus, Search, MoreVertical, Edit2, Trash2, 
  ChevronLeft, ChevronRight, X, Filter, Download
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { toast } from 'sonner';

const orderSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number"),
  product: z.string().min(1, "Product is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit_price: z.number().min(0, "Price cannot be negative"),
  status: z.enum(['Pending', 'In Progress', 'Completed']),
});

type OrderFormData = z.infer<typeof orderSchema>;

export const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: { status: 'Pending', quantity: 1, unit_price: 0 }
  });

  const quantity = watch('quantity');
  const unitPrice = watch('unit_price');
  const product = watch('product');
  const total = (quantity || 0) * (unitPrice || 0);

  // Auto-fill unit price based on product
  useEffect(() => {
    const priceMap: Record<string, number> = {
      'Smartphone': 450,
      'Keyboard': 150,
      'Monitor': 300,
      'Laptop': 1200,
      'Tablet': 250,
      'Mouse': 25
    };

    if (product && priceMap[product] && !editingOrder) {
      setValue('unit_price', priceMap[product]);
    }
  }, [product, setValue, editingOrder]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await OrderService.getOrders();
      setOrders(data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingOrder) {
        await OrderService.updateOrder(editingOrder.id, data);
        toast.success('Order updated successfully');
      } else {
        await OrderService.createOrder({ ...data, created_by: 'Admin' });
        toast.success('Order created successfully');
      }
      setIsModalOpen(false);
      setEditingOrder(null);
      reset();
      fetchOrders();
    } catch (error) {
      toast.error('Failed to save order');
    }
  };

  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await OrderService.deleteOrder(id);
      toast.success('Order deleted successfully');
      setOrderToDelete(null);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to delete order');
    }
  };

  const filteredOrders = orders.filter(order => 
    Object.values(order).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm">
        <h1 className="text-lg font-bold text-slate-800">Order Management</h1>
        <button 
          onClick={() => {
            setEditingOrder(null);
            reset();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
        >
          <Plus className="w-4 h-4" />
          Create Order
        </button>
      </header>

      <main className="flex-1 p-6 overflow-hidden flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="p-4 border-b text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="p-4 border-b text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="p-4 border-b text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 border-b text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="p-4 border-b text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="p-4 border-b text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{order.first_name} {order.last_name}</span>
                        <span className="text-xs text-slate-500">{order.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 font-medium">{order.product}</td>
                    <td className="p-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        order.status === 'Completed' ? "bg-emerald-100 text-emerald-700" :
                        order.status === 'Pending' ? "bg-amber-100 text-amber-700" :
                        order.status === 'In Progress' ? "bg-blue-100 text-blue-700" :
                        "bg-slate-100 text-slate-700"
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-800">{formatCurrency(order.total)}</td>
                    <td className="p-4 text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingOrder(order);
                            reset(order);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setOrderToDelete(order.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Showing {filteredOrders.length} orders</span>
            <div className="flex gap-2">
              <button className="p-1.5 border border-slate-200 rounded-md bg-white text-slate-400 hover:text-slate-600 disabled:opacity-50" disabled>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 border border-slate-200 rounded-md bg-white text-slate-400 hover:text-slate-600 disabled:opacity-50" disabled>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">{editingOrder ? 'Edit Order' : 'Create New Order'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">First Name</label>
                  <input {...register('first_name')} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Last Name</label>
                  <input {...register('last_name')} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Email</label>
                  <input {...register('email')} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Phone</label>
                  <input {...register('phone')} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                </div>
                
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Product</label>
                  <select {...register('product')} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="">Select a product</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Smartphone">Smartphone</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Keyboard">Keyboard</option>
                    <option value="Mouse">Mouse</option>
                  </select>
                  {errors.product && <p className="text-xs text-red-500">{errors.product.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Quantity</label>
                  <input type="number" {...register('quantity', { valueAsNumber: true })} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Unit Price ($)</label>
                  <input type="number" step="0.01" {...register('unit_price', { valueAsNumber: true })} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  {errors.unit_price && <p className="text-xs text-red-500">{errors.unit_price.message}</p>}
                </div>

                <div className="col-span-1 md:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">Total Price Estimate</span>
                  <span className="text-xl font-black text-blue-600">{formatCurrency(total)}</span>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Order Status</label>
                  <select {...register('status')} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl flex items-center justify-between">
                <span className="text-sm font-bold text-blue-700 uppercase tracking-wider">Estimated Total</span>
                <span className="text-2xl font-black text-blue-800">{formatCurrency(total)}</span>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  {editingOrder ? 'Update Order' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800">Delete Order</h3>
                <p className="text-slate-500">Are you sure you want to delete this order? This action cannot be undone.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setOrderToDelete(null)}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(orderToDelete)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
