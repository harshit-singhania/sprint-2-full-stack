export interface TicketReply {
  id: number;
  message: string;
  sender: { id: number; name: string; username: string; role: string };
  respondedAt: string;
}

export interface Ticket {
  id: number;
  subject: string;
  description: string;
  status: 'OPEN' | 'CLOSED';
  buyer: { id: number; name: string; username: string };
  responses: TicketReply[];
  createdAt: string;
}
