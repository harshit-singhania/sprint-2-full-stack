export interface Feedback {
  id: number;
  message: string;
  user: { id: number; name: string; username: string };
  createdAt: string;
}
