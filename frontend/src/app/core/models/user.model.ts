export interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: 'USER' | 'ADMIN';
}
