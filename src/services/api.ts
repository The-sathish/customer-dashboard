import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export interface Order {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  product: string;
  quantity: number;
  unit_price: number;
  total: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  created_by: string;
  created_at: string;
}

export const OrderService = {
  getOrders: async () => {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },
  createOrder: async (order: Partial<Order>) => {
    const response = await api.post('/orders', order);
    return response.data;
  },
  updateOrder: async (id: string, order: Partial<Order>) => {
    const response = await api.put(`/orders/${id}`, order);
    return response.data;
  },
  deleteOrder: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};

export const DashboardService = {
  getDashboard: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
  saveDashboard: async (layout: any, widgets: any) => {
    const response = await api.post('/dashboard', { layout, widgets });
    return response.data;
  },
};
