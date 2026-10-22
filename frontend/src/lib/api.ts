import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:4000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

//newly added------------------->>>>>
export const setAuthToken = (token: string) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// ─── TYPES ───────────────────────────────────────────────────────────────────
export interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  imageUrl?: string;
  tags?: string[];
  createdAt?: string;
}

export interface OrderProduct {
  productId: Product | string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  userId: { _id: string; name: string; email: string } | string;
  products: OrderProduct[];
  totalAmount: number;
  status: 'Pending' | 'Placed' | 'Accepted' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  deliveryAddress: string;
  deliveryCoords?: { lat?: number; lng?: number };
  deliveryBoyId?: { _id: string; name: string; email: string } | string | null;
  deliveryOtp?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

export interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Delivery Boy' | 'User';
  createdAt: string;
}

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
export const fetchProducts = (category?: string, search?: string) =>
  api.get<Product[]>('/api/products', { params: { ...(category ? { category } : {}), ...(search?.trim() ? { search: search.trim() } : {}) } }).then(r => r.data);

export const fetchProduct = (id: string) =>
  api.get<Product>(`/api/products/${id}`).then(r => r.data);

export const createProduct = (data: Partial<Product>) =>
  api.post<Product>('/api/products', data).then(r => r.data);

export const updateProduct = (id: string, data: Partial<Product>) =>
  api.put<Product>(`/api/products/${id}`, data).then(r => r.data);

export const deleteProduct = (id: string) =>
  api.delete(`/api/products/${id}`).then(r => r.data);

// ─── ORDERS ──────────────────────────────────────────────────────────────────
export const fetchAllOrders = (params?: { status?: string; deliveryBoyId?: string }) =>
  api.get<Order[]>('/api/orders', { params }).then(r => r.data);

export const fetchUserOrders = (userId: string) =>
  api.get<Order[]>(`/api/orders/user/${userId}`).then(r => r.data);

export const fetchOrder = (id: string) => api.get<Order>(`/api/orders/${id}`).then(r => r.data);

export interface CreateOrderPayload {
  userId: string;
  products: { productId: string; quantity: number; price: number }[];
  totalAmount: number;
  deliveryAddress: string;
  deliveryCoords: { lat: number; lng: number };
  paymentMethod: 'COD' | 'Online';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

export const createOrder = (data: CreateOrderPayload, idempotencyKey: string) =>
  api.post<Order>('/api/orders', data, { headers: { 'Idempotency-Key': idempotencyKey } }).then(r => r.data);

export const updateOrderStatus = (id: string, status: Order['status'], deliveryBoyId?: string, deliveryOtp?: string) =>
  api.patch<Order>(`/api/orders/${id}/status`, { status, deliveryBoyId, deliveryOtp }).then(r => r.data);

export const fetchAvailableOrders = () =>
  api.get<Order[]>('/api/orders/available').then(r => r.data);

export const verifyPayment = (data: { razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string }) =>
  api.post<{ success: boolean }>('/api/orders/verify-payment', data).then(r => r.data);

// ─── USERS ───────────────────────────────────────────────────────────────────
export const fetchAllUsers = () =>
  api.get<UserRecord[]>('/api/users').then(r => r.data);

export const updateUserRole = (id: string, role: UserRecord['role']) =>
  api.patch<UserRecord>(`/api/users/${id}/role`, { role }).then(r => r.data);

// ─── AI TIPS ─────────────────────────────────────────────────────────────────
export const fetchAITip = (deliveryAddress: string) =>
  api.post<{ tip: string }>('/api/ai/tips', { deliveryAddress }).then(r => r.data.tip);

export const sendAIMessage = (message: string, history: { role: 'user' | 'assistant'; content: string }[]) =>
  api.post<{ response: string }>('/api/ai/chat', { message, history }).then(r => r.data);

export default api;
// ─── ADMIN DATA ──────────────────────────────────────────────────────────────
export const fetchAdminStats = () =>
  api.get('/api/admin/stats').then(r => r.data);
