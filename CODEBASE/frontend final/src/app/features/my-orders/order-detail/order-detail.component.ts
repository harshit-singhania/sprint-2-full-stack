import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Order } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ReviewService } from '../../../core/services/review.service';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { InrCurrencyPipe } from '../../../core/pipes/inr-currency.pipe';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { getCarPrimaryImage } from '../../../core/utils/car-images';
import { SellerReview } from '../../../core/models/review.model';

type StepState = 'done' | 'active' | 'upcoming' | 'danger';

export interface StepNode {
  label: string;
  sub?: string;
  state: StepState;
}

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatDialogModule,
    StatusChipComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    InrCurrencyPipe,
    ConfirmDialogComponent
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  isLoading = true;
  error = '';
  currentUsername = '';
  isApproving = false;
  isRejecting = false;
  isDownloadingReceipt = false;

  // Review state
  existingReview: SellerReview | null = null;
  isSubmittingReview = false;
  reviewSubmitted = false;
  hoverRating = 0;

  reviewForm = this.fb.group({
    rating: [0],   // validated manually — Angular min() doesn't suit star pickers
    comment: ['', [Validators.maxLength(1000)]]
  });

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private auth: AuthService,
    private toast: ToastService,
    private dialog: MatDialog,
    private reviewService: ReviewService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.currentUsername = this.auth.getUsername() || '';
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getOrderById(id).subscribe({
      next: (order) => {
        this.order = order;
        this.isLoading = false;
        // Re-evaluate isBuyer now that order is loaded
        // canReview = isBuyer && status === APPROVED
        if (this.canReview) {
          this.loadExistingReview(order.seller.id);
        }
      },
      error: () => { this.error = 'Order not found.'; this.isLoading = false; }
    });
  }

  loadExistingReview(sellerId: number) {
    if (!sellerId) return;
    this.reviewService.getSellerReviews(sellerId).subscribe({
      next: (reviews) => {
        const mine = reviews.find(
          r => r.reviewer?.username?.toLowerCase() === this.currentUsername.toLowerCase()
        ) ?? null;
        this.existingReview = mine;
        if (mine) {
          this.reviewForm.patchValue({ rating: mine.rating, comment: mine.comment ?? '' });
          this.reviewSubmitted = true;
        }
      }
      // errors already handled in service (returns [] on error)
    });
  }

  // Use case-insensitive comparison — localStorage username should match exactly
  // but guard against any casing mismatch
  get isBuyer(): boolean {
    return this.order?.buyer?.username?.toLowerCase() === this.currentUsername.toLowerCase();
  }
  get isSeller(): boolean {
    return this.order?.seller?.username?.toLowerCase() === this.currentUsername.toLowerCase();
  }
  get canActAsSeller(): boolean { return this.isSeller && this.order?.status === 'PENDING_SELLER_APPROVAL'; }
  get canDownloadReceipt(): boolean { return !!this.order && this.order.status === 'APPROVED'; }
  get canReview(): boolean { return this.isBuyer && this.order?.status === 'APPROVED'; }

  get steps(): StepNode[] {
    const status = this.order?.status;
    const nodes: StepNode[] = [
      { label: 'Order placed', sub: 'Payment processed', state: 'done' },
      { label: 'Admin approval', state: 'upcoming' },
      { label: 'Seller approval', state: 'upcoming' },
      { label: 'Completed', state: 'upcoming' },
    ];
    if (status === 'PENDING_ADMIN_APPROVAL') { nodes[1].state = 'active'; }
    else if (status === 'PENDING_SELLER_APPROVAL') { nodes[1].state = 'done'; nodes[2].state = 'active'; }
    else if (status === 'APPROVED') { nodes[1].state = 'done'; nodes[2].state = 'done'; nodes[3].state = 'done'; }
    else if (status === 'REJECTED') { nodes[1].state = 'done'; nodes[2].state = 'danger'; nodes[2].sub = 'Rejected'; }
    else if (status === 'CANCELLED') { nodes[1].state = 'danger'; nodes[1].sub = 'Cancelled'; }
    return nodes;
  }

  get carThumb(): string {
    return this.order?.car ? getCarPrimaryImage(this.order.car) : '';
  }

  stars(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  setRating(val: number) {
    this.reviewForm.patchValue({ rating: val });
    this.hoverRating = 0;
  }

  get currentRating(): number {
    return this.reviewForm.value.rating ?? 0;
  }

  submitReview() {
    if (!this.order) return;

    const sellerId = this.order.seller?.id;
    if (!sellerId) {
      this.toast.error('Could not identify the seller. Please try again.');
      return;
    }

    const rating = this.reviewForm.value.rating ?? 0;
    const comment = (this.reviewForm.value.comment ?? '').trim();

    if (rating < 1 || rating > 5) {
      this.toast.error('Please select a star rating before submitting.');
      return;
    }
    if (comment.length > 1000) {
      this.toast.error('Comment must be 1000 characters or less.');
      return;
    }

    const isUpdate = !!this.existingReview;
    this.isSubmittingReview = true;

    this.reviewService.submitReview(
      sellerId,
      rating,
      comment || undefined
    ).subscribe({
      next: (review) => {
        this.existingReview = review;
        this.reviewSubmitted = true;
        this.isSubmittingReview = false;
        this.toast.success(isUpdate ? 'Review updated!' : 'Review submitted!');
      },
      error: (err) => {
        this.isSubmittingReview = false;
        const msg = err?.error?.message || 'Failed to submit review.';
        this.toast.error(msg);
      }
    });
  }

  editReview() {
    this.reviewSubmitted = false;
  }

  downloadReceipt() {
    if (!this.order) return;
    this.isDownloadingReceipt = true;
    this.orderService.getReceipt(this.order.id).subscribe({
      next: (receipt) => {
        this.isDownloadingReceipt = false;
        this.generateReceiptPrint(receipt);
      },
      error: (err) => {
        this.isDownloadingReceipt = false;
        this.toast.error(err.error?.message || 'Failed to generate receipt.');
      }
    });
  }

  private generateReceiptPrint(receipt: any) {
    const fmt = (n: number) =>
      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
    const fmtDate = (s: string) =>
      new Date(s).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const html = `
<!DOCTYPE html><html lang="en">
<head><meta charset="UTF-8"><title>Receipt ${receipt.receiptNumber}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #111; padding: 40px; }
  .receipt { max-width: 640px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; }
  .header { background: #0A84FF; color: #fff; padding: 28px 32px; }
  .header h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
  .header p { font-size: 13px; opacity: 0.85; margin-top: 4px; }
  .receipt-num { font-size: 12px; font-family: monospace; background: rgba(255,255,255,0.2); display: inline-block; padding: 3px 10px; border-radius: 99px; margin-top: 10px; }
  .body { padding: 28px 32px; display: flex; flex-direction: column; gap: 24px; }
  .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 10px; }
  .row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
  .row:last-child { border-bottom: 0; }
  .row .label { color: #555; }
  .row .value { font-weight: 500; font-family: monospace; }
  .amount-row .value { font-size: 20px; font-weight: 700; color: #0A84FF; }
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 600; }
  .status-APPROVED { background: #e8f8ed; color: #1a7a3a; }
  .status-SUCCESS  { background: #e8f8ed; color: #1a7a3a; }
  .footer { background: #f9f9f9; padding: 18px 32px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #e0e0e0; }
  @media print { body { padding: 0; } .receipt { border: none; border-radius: 0; } }
</style>
</head>
<body>
<div class="receipt">
  <div class="header">
    <h1>Carbon Market</h1>
    <p>Vehicle Purchase Receipt</p>
    <div class="receipt-num">${receipt.receiptNumber}</div>
  </div>
  <div class="body">
    <div>
      <div class="section-title">Vehicle</div>
      <div class="row"><span class="label">Make &amp; Model</span><span class="value">${receipt.carMake} ${receipt.carModel}</span></div>
      <div class="row"><span class="label">Year</span><span class="value">${receipt.carYear}</span></div>
      <div class="row"><span class="label">Colour</span><span class="value">${receipt.carColor}</span></div>
      <div class="row"><span class="label">Mileage</span><span class="value">${receipt.carMileage.toLocaleString('en-IN')} km</span></div>
    </div>
    <div>
      <div class="section-title">Buyer</div>
      <div class="row"><span class="label">Name</span><span class="value">${receipt.buyerName}</span></div>
      <div class="row"><span class="label">Username</span><span class="value">${receipt.buyerUsername}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">${receipt.buyerEmail || '—'}</span></div>
      <div class="row"><span class="label">Phone</span><span class="value">${receipt.buyerPhone}</span></div>
    </div>
    <div>
      <div class="section-title">Seller</div>
      <div class="row"><span class="label">Name</span><span class="value">${receipt.sellerName}</span></div>
      <div class="row"><span class="label">Username</span><span class="value">${receipt.sellerUsername}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">${receipt.sellerEmail || '—'}</span></div>
    </div>
    <div>
      <div class="section-title">Payment</div>
      <div class="row amount-row"><span class="label">Amount</span><span class="value">${fmt(receipt.amount)}</span></div>
      <div class="row"><span class="label">Method</span><span class="value">${receipt.paymentMethod}</span></div>
      <div class="row"><span class="label">Transaction ID</span><span class="value">${receipt.gatewayTransactionId}</span></div>
      <div class="row"><span class="label">Payment Status</span><span class="value"><span class="status-badge status-${receipt.paymentStatus}">${receipt.paymentStatus}</span></span></div>
      <div class="row"><span class="label">Order Status</span><span class="value"><span class="status-badge status-${receipt.orderStatus}">${receipt.orderStatus}</span></span></div>
      <div class="row"><span class="label">Order Date</span><span class="value">${fmtDate(receipt.orderDate)}</span></div>
    </div>
  </div>
  <div class="footer">Generated ${fmtDate(receipt.generatedAt)} · Carbon Market · Order #${receipt.orderId}</div>
</div>
</body></html>`;

    const win = window.open('', '_blank', 'width=720,height=900');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.onload = () => win.print();
    }
  }

  approveSale() {
    if (!this.order) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Approve sale', message: 'The car will be marked as sold.', confirmLabel: 'Approve sale' }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.isApproving = true;
      this.orderService.approveSale(this.order!.id).subscribe({
        next: () => { this.toast.success('Sale approved!'); this.isApproving = false; this.reloadOrder(); },
        error: () => { this.toast.error('Failed to approve sale'); this.isApproving = false; }
      });
    });
  }

  rejectSale() {
    if (!this.order) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Reject sale', message: 'Are you sure you want to reject this sale?', confirmLabel: 'Reject sale', confirmColor: 'warn', destructive: true }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.isRejecting = true;
      this.orderService.rejectSale(this.order!.id).subscribe({
        next: () => { this.toast.success('Sale rejected.'); this.isRejecting = false; this.reloadOrder(); },
        error: () => { this.toast.error('Failed to reject sale'); this.isRejecting = false; }
      });
    });
  }

  reloadOrder() {
    this.orderService.getOrderById(this.order!.id).subscribe({
      next: (order) => { this.order = order; }
    });
  }
}
