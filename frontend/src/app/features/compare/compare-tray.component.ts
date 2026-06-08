import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Car } from '../../core/models/car.model';
import { CompareService } from './compare.service';
import { getCarPrimaryImage } from '../../core/utils/car-images';

@Component({
  selector: 'app-compare-tray',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="compare-tray" *ngIf="cars.length > 0">
      <div class="tray-cars">
        <div class="tray-car" *ngFor="let car of cars">
          <img class="tray-thumb" [src]="carImage(car)" [alt]="car.make" loading="lazy">
          <span class="tray-name mono">{{car.make}} {{car.model}}</span>
          <button class="tray-remove" type="button" (click)="compareService.remove(car.id)" aria-label="Remove">
            <i class="ph ph-x"></i>
          </button>
        </div>
        <div class="tray-car tray-car--empty" *ngIf="cars.length === 1">
          <span>Add one more car</span>
        </div>
      </div>
      <a class="btn btn-primary tray-compare-btn"
         routerLink="/compare"
         [class.tray-btn-disabled]="cars.length < 2">
        Compare
      </a>
      <button class="tray-dismiss" type="button" (click)="compareService.clear()" aria-label="Dismiss">
        <i class="ph ph-x-circle"></i>
      </button>
    </div>
  `,
  styles: [`
    .compare-tray {
      position: fixed;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(28, 28, 30, 0.92);
      backdrop-filter: blur(24px) saturate(1.8);
      -webkit-backdrop-filter: blur(24px) saturate(1.8);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-pill);
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 300;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
      white-space: nowrap;
    }
    .tray-cars { display: flex; gap: 8px; align-items: center; }
    .tray-car {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--surface-1);
      border-radius: 8px;
      padding: 6px 10px;
      min-width: 120px;
    }
    .tray-car--empty {
      background: transparent;
      border: 1px dashed var(--hairline);
      color: var(--text-tertiary);
      font-size: 11px;
      justify-content: center;
    }
    .tray-thumb { width: 40px; height: 28px; object-fit: cover; border-radius: 4px; flex-shrink: 0; }
    .tray-name { font-size: 12px; color: var(--text-primary); }
    .tray-remove {
      background: none; border: none; color: var(--text-tertiary);
      cursor: pointer; font-size: 14px; padding: 0; line-height: 1; flex-shrink: 0;
      &:hover { color: var(--text-primary); }
    }
    .tray-compare-btn { flex-shrink: 0; font-size: 13px; padding: 8px 18px; }
    .tray-btn-disabled { opacity: 0.4; pointer-events: none; }
    .tray-dismiss {
      background: none; border: none; color: var(--text-tertiary);
      cursor: pointer; font-size: 20px; padding: 0; line-height: 1; flex-shrink: 0;
      &:hover { color: var(--text-primary); }
    }
  `]
})
export class CompareTrayComponent implements OnInit, OnDestroy {
  cars: Car[] = [];
  private sub!: Subscription;

  constructor(public compareService: CompareService) {}

  ngOnInit() {
    this.sub = this.compareService.cars$.subscribe(cars => this.cars = cars);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  carImage(car: Car): string {
    return getCarPrimaryImage(car);
  }
}
