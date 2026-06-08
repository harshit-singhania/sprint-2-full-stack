import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private snackBar: MatSnackBar) {}

  success(msg: string) {
    this.snackBar.open(msg, 'Close', {
      duration: 4000,
      panelClass: ['toast-success'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  error(msg: string) {
    this.snackBar.open(msg, 'Dismiss', {
      duration: 4000,
      panelClass: ['toast-error'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  info(msg: string) {
    this.snackBar.open(msg, 'Close', {
      duration: 4000,
      panelClass: ['toast-info'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
