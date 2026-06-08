import { Pipe, PipeTransform } from '@angular/core';

const STATUS_CLASSES: Record<string, string> = {
  PENDING_ADMIN_APPROVAL: 'chip-pending',
  PENDING_SELLER_APPROVAL: 'chip-pending-seller',
  APPROVED: 'chip-approved',
  REJECTED: 'chip-rejected',
  CANCELLED: 'chip-cancelled',
  SUCCESS: 'chip-success',
  FAILED: 'chip-failed',
  OPEN: 'chip-open',
  CLOSED: 'chip-closed',
};

@Pipe({
  name: 'statusClass',
  standalone: true
})
export class StatusClassPipe implements PipeTransform {
  transform(value: string): string {
    return STATUS_CLASSES[value] || 'chip-default';
  }
}
