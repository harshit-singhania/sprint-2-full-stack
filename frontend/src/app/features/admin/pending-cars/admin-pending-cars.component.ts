import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-pending-cars',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="page-container"><p>Pending cars</p></div>`
})
export class AdminPendingCarsComponent {}
