import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Car } from '../../core/models/car.model';
import { CarService } from '../../core/services/car.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { CarCardComponent } from '../../shared/components/car-card/car-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CarCardComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.scss'
})
export class BrowseComponent implements OnInit {
  readonly skeletonItems = Array(8).fill(0);

  @ViewChild('popularTrack') popularTrack!: ElementRef<HTMLDivElement>;

  scrollToListings(): void {
    document.querySelector('.browse-main')?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollCarousel(dir: 'prev' | 'next') {
    const el = this.popularTrack?.nativeElement;
    if (!el) return;
    const cardWidth = 276; // 260px card + 16px gap
    el.scrollBy({ left: dir === 'next' ? cardWidth * 2 : -cardWidth * 2, behavior: 'smooth' });
  }

  allCars: Car[] = [];
  popularCars: Car[] = [];
  filteredCars: Car[] = [];
  wishlistIds = new Set<number>();
  isLoading = true;
  error = '';
  filtersOpen = false;

  filterForm = this.fb.group({
    make: [''],
    yearFrom: [null as number | null],
    priceTo: [null as number | null],
    color: [''],
    sortBy: ['createdAt']
  });

  get uniqueMakes(): string[] {
    return [...new Set(this.allCars.map(c => c.make))].sort();
  }

  get activeFilterKeys(): string[] {
    const v = this.filterForm.value;
    const keys: string[] = [];
    if (v.make) keys.push('make');
    if (v.yearFrom) keys.push('yearFrom');
    if (v.priceTo) keys.push('priceTo');
    if (v.color) keys.push('color');
    return keys;
  }

  constructor(
    private fb: FormBuilder,
    private carService: CarService,
    private wishlistService: WishlistService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadCars();
    this.loadWishlist();
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  loadCars() {
    this.isLoading = true;
    this.error = '';
    this.carService.getAvailableCars().subscribe({
      next: (cars) => {
        this.allCars = cars;
        this.carService.getPopularCars().subscribe({
          next: (popular) => { this.popularCars = popular.slice(0, 8); },
          error: () => {}
        });
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load cars. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loadWishlist() {
    this.wishlistService.getWishlist().subscribe({
      next: (cars) => { this.wishlistIds = new Set(cars.map(c => c.id)); },
      error: () => {}
    });
  }

  applyFilters() {
    const { make, yearFrom, priceTo, color, sortBy } = this.filterForm.value;
    let result = [...this.allCars];

    if (make) result = result.filter(c => c.make.toLowerCase().includes(make.toLowerCase()));
    if (yearFrom) result = result.filter(c => c.year >= yearFrom!);
    if (priceTo) result = result.filter(c => c.price <= priceTo!);
    if (color) result = result.filter(c => c.color.toLowerCase().includes(color!.toLowerCase()));

    if (sortBy === 'price_asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'year_desc') result.sort((a, b) => b.year - a.year);
    else result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    this.filteredCars = result;
  }

  clearFilters() {
    this.filterForm.reset({ sortBy: 'createdAt' });
  }

  removeFilter(key: string) {
    const numericKeys = ['yearFrom', 'priceTo'];
    this.filterForm.patchValue({ [key]: numericKeys.includes(key) ? null : '' });
  }

  filterLabel(key: string): string {
    const v = this.filterForm.value;
    switch (key) {
      case 'make': return `Make: ${v.make}`;
      case 'yearFrom': return `From: ${v.yearFrom}`;
      case 'priceTo': return `Max: ₹${((v.priceTo ?? 0) / 100000).toFixed(0)}L`;
      case 'color': return `Color: ${v.color}`;
      default: return key;
    }
  }

  isInWishlist(car: Car): boolean {
    return this.wishlistIds.has(car.id);
  }

  toggleWishlist(car: Car) {
    if (this.wishlistIds.has(car.id)) {
      this.wishlistIds.delete(car.id);
      this.wishlistService.removeFromWishlist(car.id).subscribe({
        error: () => {
          this.wishlistIds.add(car.id);
          this.toast.error('Failed to remove from wishlist');
        }
      });
    } else {
      this.wishlistIds.add(car.id);
      this.wishlistService.addToWishlist(car.id).subscribe({
        next: () => this.toast.success('Added to wishlist'),
        error: () => {
          this.wishlistIds.delete(car.id);
          this.toast.error('Failed to add to wishlist');
        }
      });
    }
  }
}
