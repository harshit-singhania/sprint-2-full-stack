import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrency } from '@angular/common';

@Pipe({
  name: 'inrCurrency',
  standalone: true
})
export class InrCurrencyPipe implements PipeTransform {
  transform(value: number): string {
    if (value == null) return '';
    return formatCurrency(value, 'en-IN', '₹', 'INR', '1.0-0');
  }
}
