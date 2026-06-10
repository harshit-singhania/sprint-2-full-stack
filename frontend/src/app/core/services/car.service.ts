import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Car } from '../models/car.model';

@Injectable({ providedIn: 'root' })
export class CarService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getAvailableCars(): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.base}/api/cars/available`).pipe(catchError(e => throwError(() => e)));
  }

  getPopularCars(): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.base}/api/cars/popular`).pipe(catchError(e => throwError(() => e)));
  }

  getRecentCars(): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.base}/api/cars/recent`).pipe(catchError(e => throwError(() => e)));
  }

  getCarById(id: number): Observable<Car> {
    return this.http.get<Car>(`${this.base}/api/cars/${id}`).pipe(catchError(e => throwError(() => e)));
  }

  createCar(data: Partial<Car>): Observable<Car> {
    return this.http.post<Car>(`${this.base}/api/cars`, data).pipe(catchError(e => throwError(() => e)));
  }

  updateCar(id: number, data: Partial<Car>): Observable<Car> {
    return this.http.put<Car>(`${this.base}/api/cars/${id}`, data).pipe(catchError(e => throwError(() => e)));
  }

  deleteCar(id: number): Observable<any> {
    return this.http.delete(`${this.base}/api/cars/${id}`).pipe(catchError(e => throwError(() => e)));
  }

  compareCars(firstCarId: number, secondCarId: number): Observable<any> {
    return this.http.get(`${this.base}/api/cars/compare?firstCarId=${firstCarId}&secondCarId=${secondCarId}`).pipe(catchError(e => throwError(() => e)));
  }

  getMyCars(): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.base}/api/cars/my`).pipe(catchError(e => throwError(() => e)));
  }
}
