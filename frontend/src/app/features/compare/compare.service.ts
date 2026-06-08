import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Car } from '../../core/models/car.model';

@Injectable({ providedIn: 'root' })
export class CompareService {
  private _cars = new BehaviorSubject<Car[]>([]);

  readonly cars$ = this._cars.asObservable();
  get cars(): Car[] { return this._cars.value; }
  get count(): number { return this._cars.value.length; }

  toggle(car: Car): void {
    const current = this._cars.value;
    const idx = current.findIndex(c => c.id === car.id);
    if (idx >= 0) {
      this._cars.next(current.filter(c => c.id !== car.id));
    } else if (current.length < 2) {
      this._cars.next([...current, car]);
    }
  }

  isSelected(carId: number): boolean {
    return this._cars.value.some(c => c.id === carId);
  }

  remove(carId: number): void {
    this._cars.next(this._cars.value.filter(c => c.id !== carId));
  }

  clear(): void {
    this._cars.next([]);
  }
}
