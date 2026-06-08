import { Car } from './car.model';

export interface Order {
  id: number;
  car: Car;
  buyer: { id: number; fullName: string; username: string; phoneNumber: string };
  seller: { id: number; fullName: string; username: string; phoneNumber: string };
  status: 'PENDING_ADMIN_APPROVAL' | 'PENDING_SELLER_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  paymentStatus: 'SUCCESS' | 'FAILED';
  paymentMethod: string;
  paymentToken: string;
  amount: number;
  fraudAlert: boolean;
  createdAt: string;
  updatedAt: string;
}
