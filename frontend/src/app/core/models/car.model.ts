export interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  description?: string;
  available: boolean;
  approvalStatus: 'PENDING_ADMIN_APPROVAL' | 'APPROVED' | 'REJECTED';
  seller: { id: number; fullName: string; username: string; phoneNumber: string };
  viewCount: number;
  createdAt: string;
}
