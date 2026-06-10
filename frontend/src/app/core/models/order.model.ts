import { Car } from './car.model';

export interface OrderUser {
  id: number;
  username: string;
  name: string;
  phoneNumber: string;
  email: string;
  role: string;
}

export interface OrderPayment {
  id: string;
  status: 'SUCCESS' | 'FAILED';
  amount: number;
  method: string;
  gatewayName: string;
  gatewayTransactionId: string;
  failureReason: string | null;
  paidAt: string;
}

export interface Order {
  id: number;
  car: Car;
  buyer: OrderUser;
  seller: OrderUser;
  payment: OrderPayment;
  status: 'PENDING_ADMIN_APPROVAL' | 'PENDING_SELLER_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  fraudAlert: boolean;
  createdAt: string;
}
