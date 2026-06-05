import api from './api';

export interface OrderPayload {
  customer_email: string;
  customer_name: string;
  street: string;
  street_number: string;
  complement?: string;
  city: string;
  state: string;
  zip_code: string;
  payment_method: 'credit_card' | 'pix' | 'boleto';
  installments?: number;
  amount: number;
}

export interface OrderResponse {
  id: number;
  customer_name: string;
  customer_email: string;
  payment_method: string;
  installments: number | null;
  amount: number;
  status: string;
  created_at: string;
}

export async function createOrder(payload: OrderPayload): Promise<OrderResponse> {
  const { data } = await api.post<OrderResponse>('/api/orders', payload);
  return data;
}
