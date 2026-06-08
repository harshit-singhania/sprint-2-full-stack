import { Pipe, PipeTransform } from '@angular/core';

const STATUS_LABELS: Record<string, string> = {
  PENDING_ADMIN_APPROVAL: 'Pending Review',
  PENDING_SELLER_APPROVAL: 'Awaiting Seller',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  SUCCESS: 'Payment Successful',
  FAILED: 'Payment Failed',
  OPEN: 'Open',
  CLOSED: 'Closed',
};

@Pipe({
  name: 'statusLabel',
  standalone: true
})
export class StatusLabelPipe implements PipeTransform {
  transform(value: string): string {
    return STATUS_LABELS[value] || value;
  }
}
