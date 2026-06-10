import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Car } from '../../core/models/car.model';
import { CarService } from '../../core/services/car.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { InrCurrencyPipe } from '../../core/pipes/inr-currency.pipe';
import { PurchaseDialogComponent } from './purchase-dialog/purchase-dialog.component';
import { CompareService } from '../compare/compare.service';
import { CompareTrayComponent } from '../compare/compare-tray.component';
import { getCarGalleryImages, getCarPrimaryImage } from '../../core/utils/car-images';

@Component({
  selector: 'app-car-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule,
    StatusChipComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    InrCurrencyPipe,
    CompareTrayComponent
  ],
  templateUrl: './car-detail.component.html',
  styleUrl: './car-detail.component.scss'
})
export class CarDetailComponent implements OnInit {
  readonly BUY_NOW = 'Buy now';

  car: Car | null = null;
  isLoading = true;
  error = '';
  inWishlist = false;
  isOwnListing = false;
  sellerVisible = false;
  lightboxOpen = false;
  lightboxIndex = 0;
  readonly thumbnailCount = 3;

  constructor(
    private route: ActivatedRoute,
    private carService: CarService,
    private wishlistService: WishlistService,
    private auth: AuthService,
    private toast: ToastService,
    private dialog: MatDialog,
    public compareService: CompareService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.carService.getCarById(id).subscribe({
      next: (car) => {
        this.car = car;
        this.isOwnListing = car.seller.username === this.auth.getUsername();
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Car not found or failed to load.';
        this.isLoading = false;
      }
    });
    this.wishlistService.getWishlist().subscribe({
      next: (cars) => { this.inWishlist = cars.some(c => c.id === id); },
      error: () => {}
    });
  }

  get thumbnails(): string[] {
    if (!this.car) return [];
    return getCarGalleryImages(this.car, this.thumbnailCount);
  }

  get carImage(): string {
    if (!this.car) return '';
    return getCarPrimaryImage(this.car);
  }

  openLightbox(idx: number) {
    this.lightboxIndex = idx;
    this.lightboxOpen = true;
  }

  closeLightbox() { this.lightboxOpen = false; }
  prevImage() { this.lightboxIndex = (this.lightboxIndex - 1 + this.thumbnailCount) % this.thumbnailCount; }
  nextImage() { this.lightboxIndex = (this.lightboxIndex + 1) % this.thumbnailCount; }

  toggleWishlist() {
    if (!this.car) return;
    if (this.inWishlist) {
      this.inWishlist = false;
      this.wishlistService.removeFromWishlist(this.car.id).subscribe({
        error: () => { this.inWishlist = true; this.toast.error('Failed to remove from wishlist'); }
      });
    } else {
      this.inWishlist = true;
      this.wishlistService.addToWishlist(this.car.id).subscribe({
        next: () => this.toast.success('Added to wishlist'),
        error: () => { this.inWishlist = false; this.toast.error('Failed to add to wishlist'); }
      });
    }
  }

  buyNow() {
    if (!this.car) return;
    this.dialog.open(PurchaseDialogComponent, { width: '520px', data: this.car });
  }

  addToCompare() {
    if (!this.car) return;
    this.compareService.toggle(this.car);
    const action = this.compareService.isSelected(this.car.id) ? 'Added to compare' : 'Removed from compare';
    this.toast.success(action);
  }

  canBuy(): boolean {
    if (!this.car) return false;
    return !this.isOwnListing && this.car.available && this.car.approvalStatus === 'APPROVED';
  }

  get buyDisabledReason(): string {
    if (!this.car) return '';
    if (this.isOwnListing) return 'You cannot purchase your own listing';
    if (!this.car.available) return 'This car has already been sold';
    if (this.car.approvalStatus !== 'APPROVED') return 'This listing is pending approval';
    return '';
  }
}
