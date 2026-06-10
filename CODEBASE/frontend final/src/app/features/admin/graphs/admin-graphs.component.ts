import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, DashboardGraphResponse, DailyCount, DailyRevenue, StatusBreakdown } from '../../../core/services/admin.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-graphs',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './admin-graphs.component.html',
  styleUrl: './admin-graphs.component.scss'
})
export class AdminGraphsComponent implements OnInit, AfterViewInit {
  data: DashboardGraphResponse | null = null;
  isLoading = true;
  error = '';
  private rendered = false;

  @ViewChildren('chartCanvas') canvases!: QueryList<ElementRef<HTMLCanvasElement>>;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getDashboardGraph().subscribe({
      next: (d) => {
        this.data = d;
        this.isLoading = false;
        // Draw after Angular renders the canvases (next tick)
        setTimeout(() => this.drawAll(), 0);
      },
      error: () => { this.error = 'Failed to load graph data.'; this.isLoading = false; }
    });
  }

  ngAfterViewInit() {
    // Fallback: if canvases appear after data is ready
    this.canvases.changes.subscribe(() => {
      if (!this.rendered && this.data) { this.rendered = true; this.drawAll(); }
    });
  }

  private drawAll() {
    if (!this.data) return;
    const canvasEls = this.canvases.toArray();
    if (canvasEls.length < 5) return;
    this.drawLine(canvasEls[0].nativeElement, this.data.ordersPerDay.map(d => ({ label: this.shortDate(d.date), value: d.count })), '#0A84FF', 'Orders per day');
    this.drawLine(canvasEls[1].nativeElement, this.data.revenuePerDay.map(d => ({ label: this.shortDate(d.date), value: d.revenue })), '#30D158', 'Revenue per day');
    this.drawLine(canvasEls[2].nativeElement, this.data.carsListedPerDay.map(d => ({ label: this.shortDate(d.date), value: d.count })), '#FF9F0A', 'Cars listed per day');
    this.drawDonut(canvasEls[3].nativeElement, this.data.orderStatusBreakdown);
    this.drawDonut(canvasEls[4].nativeElement, this.data.carApprovalBreakdown);
  }

  private shortDate(iso: string): string {
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }

  private drawLine(canvas: HTMLCanvasElement, points: { label: string; value: number }[], color: string, _title: string) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const padL = 48, padR = 16, padT = 16, padB = 36;
    const vals = points.map(p => p.value);
    const max = Math.max(...vals, 1);
    const step = (W - padL - padR) / Math.max(points.length - 1, 1);

    ctx.clearRect(0, 0, W, H);

    // grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + ((H - padT - padB) * i / 4);
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
      const label = Math.round(max - max * i / 4);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '10px "Geist Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(label > 999 ? `${(label / 1000).toFixed(0)}k` : String(label), padL - 4, y + 3);
    }

    // filled area
    const grad = ctx.createLinearGradient(0, padT, 0, H - padB);
    grad.addColorStop(0, color + '40');
    grad.addColorStop(1, color + '00');
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = padL + i * step;
      const y = padT + (H - padT - padB) * (1 - p.value / max);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(padL + (points.length - 1) * step, H - padB);
    ctx.lineTo(padL, H - padB);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    points.forEach((p, i) => {
      const x = padL + i * step;
      const y = padT + (H - padT - padB) * (1 - p.value / max);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // x-axis labels (every ~7 points)
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px "Geist Mono", monospace';
    ctx.textAlign = 'center';
    const skip = Math.ceil(points.length / 8);
    points.forEach((p, i) => {
      if (i % skip !== 0) return;
      const x = padL + i * step;
      ctx.fillText(p.label, x, H - 6);
    });
  }

  private readonly DONUT_COLORS: Record<string, string> = {
    PENDING_ADMIN_APPROVAL: '#FF9F0A',
    PENDING_SELLER_APPROVAL: '#FFD60A',
    APPROVED: '#30D158',
    REJECTED: '#FF453A',
    CANCELLED: '#8E8E93',
  };

  private donutColor(status: string): string {
    return this.DONUT_COLORS[status] ?? '#636366';
  }

  statusLabel(status: string): string {
    const MAP: Record<string, string> = {
      PENDING_ADMIN_APPROVAL: 'Pending Admin',
      PENDING_SELLER_APPROVAL: 'Pending Seller',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      CANCELLED: 'Cancelled',
    };
    return MAP[status] ?? status;
  }

  private drawDonut(canvas: HTMLCanvasElement, breakdown: StatusBreakdown[]) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const outerR = Math.min(W, H) / 2 - 10;
    const innerR = outerR * 0.58;
    const total = breakdown.reduce((s, b) => s + b.count, 0) || 1;

    ctx.clearRect(0, 0, W, H);
    let startAngle = -Math.PI / 2;
    breakdown.forEach(b => {
      const slice = (b.count / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outerR, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = this.donutColor(b.status);
      ctx.fill();
      startAngle += slice;
    });

    // Hole
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
    ctx.fillStyle = '#141418';
    ctx.fill();

    // Centre total
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = `700 ${Math.round(outerR * 0.34)}px "Geist Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(total), cx, cy);
  }

  donutLegend(breakdown: StatusBreakdown[]) {
    return breakdown.map(b => ({ label: this.statusLabel(b.status), count: b.count, color: this.donutColor(b.status) }));
  }

  formatRevenue(n: number): string {
    if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
    if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
    return `₹${n.toLocaleString('en-IN')}`;
  }

  get totalRevenue(): number {
    return (this.data?.revenuePerDay ?? []).reduce((s, d) => s + d.revenue, 0);
  }
  get totalOrders(): number {
    return (this.data?.ordersPerDay ?? []).reduce((s, d) => s + d.count, 0);
  }
  get totalListed(): number {
    return (this.data?.carsListedPerDay ?? []).reduce((s, d) => s + d.count, 0);
  }
}
