import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { Order } from '../../../core/models/order.model';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { InrCurrencyPipe } from '../../../core/pipes/inr-currency.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { getCarPrimaryImage } from '../../../core/utils/car-images';

@Component({
  selector: 'app-admin-all-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusChipComponent, InrCurrencyPipe, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './admin-all-orders.component.html',
  styleUrl: './admin-all-orders.component.scss'
})
export class AdminAllOrdersComponent implements OnInit {
  orders: Order[] = [];
  filtered: Order[] = [];
  isLoading = true;
  error = '';
  search = '';
  statusFilter = '';
  downloadingId: number | null = null;

  readonly skeletonRows = Array.from({ length: 5 });

  readonly statuses = [
    { value: '', label: 'All statuses' },
    { value: 'PENDING_ADMIN_APPROVAL', label: 'Pending Admin' },
    { value: 'PENDING_SELLER_APPROVAL', label: 'Pending Seller' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  constructor(
    private adminService: AdminService,
    private orderService: OrderService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.adminService.getAllOrders().subscribe({
      next: (orders) => { this.orders = orders; this.applyFilter(); this.isLoading = false; },
      error: () => { this.error = 'Failed to load orders.'; this.isLoading = false; }
    });
  }

  applyFilter() {
    let result = [...this.orders];
    if (this.statusFilter) result = result.filter(o => o.status === this.statusFilter);
    if (this.search.trim()) {
      const term = this.search.trim().toLowerCase();
      result = result.filter(o =>
        `${o.car?.make} ${o.car?.model}`.toLowerCase().includes(term) ||
        o.buyer?.name?.toLowerCase().includes(term) ||
        o.buyer?.username?.toLowerCase().includes(term) ||
        o.seller?.name?.toLowerCase().includes(term) ||
        String(o.id).includes(term)
      );
    }
    this.filtered = result;
  }

  carThumb(order: Order): string {
    return order.car ? getCarPrimaryImage(order.car) : '';
  }

  downloadReceipt(order: Order) {
    if (order.status !== 'APPROVED') { this.toast.error('Receipt only available for approved orders.'); return; }
    this.downloadingId = order.id;
    this.adminService.getAdminReceipt(order.id).subscribe({
      next: (receipt) => { this.downloadingId = null; this.printReceipt(receipt); },
      error: (err) => { this.downloadingId = null; this.toast.error(err.error?.message || 'Failed to load receipt.'); }
    });
  }

  private printReceipt(r: any) {
    const fmt = (n: number) =>
      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
    const fmtDate = (s: string) =>
      new Date(s).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Receipt ${r.receiptNumber}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',sans-serif;background:#fff;color:#111;padding:32px}.receipt{max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden}.header{background:#0A84FF;color:#fff;padding:24px 28px}.header h1{font-size:20px;font-weight:700}.header p{font-size:12px;opacity:.85;margin-top:4px}.rn{font-size:11px;font-family:monospace;background:rgba(255,255,255,.2);display:inline-block;padding:2px 10px;border-radius:99px;margin-top:8px}.body{padding:24px 28px;display:flex;flex-direction:column;gap:20px}.st{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#888;margin-bottom:8px}.row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:13px}.row:last-child{border-bottom:0}.label{color:#555}.value{font-weight:500;font-family:monospace}.big .value{font-size:18px;font-weight:700;color:#0A84FF}.footer{background:#f9f9f9;padding:14px 28px;text-align:center;font-size:11px;color:#888;border-top:1px solid #e0e0e0}@media print{body{padding:0}.receipt{border:none;border-radius:0}}</style>
</head><body><div class="receipt">
<div class="header"><h1>Carbon Market</h1><p>Vehicle Purchase Receipt</p><div class="rn">${r.receiptNumber}</div></div>
<div class="body">
<div><div class="st">Vehicle</div>
<div class="row"><span class="label">Make &amp; Model</span><span class="value">${r.carMake} ${r.carModel}</span></div>
<div class="row"><span class="label">Year</span><span class="value">${r.carYear}</span></div>
<div class="row"><span class="label">Colour</span><span class="value">${r.carColor}</span></div>
<div class="row"><span class="label">Mileage</span><span class="value">${r.carMileage?.toLocaleString('en-IN')} km</span></div></div>
<div><div class="st">Buyer</div>
<div class="row"><span class="label">Name</span><span class="value">${r.buyerName}</span></div>
<div class="row"><span class="label">Email</span><span class="value">${r.buyerEmail || '—'}</span></div>
<div class="row"><span class="label">Phone</span><span class="value">${r.buyerPhone}</span></div></div>
<div><div class="st">Seller</div>
<div class="row"><span class="label">Name</span><span class="value">${r.sellerName}</span></div>
<div class="row"><span class="label">Email</span><span class="value">${r.sellerEmail || '—'}</span></div></div>
<div><div class="st">Payment</div>
<div class="row big"><span class="label">Amount</span><span class="value">${fmt(r.amount)}</span></div>
<div class="row"><span class="label">Method</span><span class="value">${r.paymentMethod}</span></div>
<div class="row"><span class="label">Transaction ID</span><span class="value">${r.gatewayTransactionId}</span></div>
<div class="row"><span class="label">Date</span><span class="value">${fmtDate(r.orderDate)}</span></div></div>
</div>
<div class="footer">Generated ${fmtDate(r.generatedAt)} · Carbon Market · Order #${r.orderId}</div>
</div></body></html>`;
    const win = window.open('', '_blank', 'width=720,height=900');
    if (win) { win.document.write(html); win.document.close(); win.onload = () => win.print(); }
  }
}
