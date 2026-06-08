export interface Feedback {
  id: number;
  rating: number;
  comment?: string;
  createdBy: { id: number; fullName: string; username: string };
  createdAt: string;
}
