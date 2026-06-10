import { OrderUser } from './order.model';

export interface SellerReview {
  id: number;
  reviewer: OrderUser;
  seller: OrderUser;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface SellerAverageRating {
  sellerId: number;
  averageRating: number;
}
