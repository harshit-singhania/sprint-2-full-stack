import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Ticket } from '../../../core/models/ticket.model';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    StatusChipComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent
  ],
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.scss'
})
export class TicketDetailComponent implements OnInit {
  ticket: Ticket | null = null;
  isLoading = true;
  isSending = false;
  currentUsername = '';
  error = '';
  replyError = '';

  replyForm = this.fb.group({
    message: ['', [Validators.required, Validators.minLength(1)]]
  });

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private auth: AuthService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.currentUsername = this.auth.getUsername() || '';
    this.loadTicket();
  }

  loadTicket() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.ticketService.getTicketById(id).subscribe({
      next: (ticket) => {
        this.ticket = ticket;
        this.error = '';
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Ticket not found.';
        this.isLoading = false;
      }
    });
  }

  sendReply() {
    if (this.replyForm.invalid || !this.ticket) return;
    this.isSending = true;
    this.replyError = '';
    const message = this.replyForm.get('message')?.value!;
    this.ticketService.replyToTicket(this.ticket.id, message).subscribe({
      next: () => {
        this.replyForm.reset();
        this.isSending = false;
        this.loadTicket();
      },
      error: () => {
        this.isSending = false;
        this.replyError = 'Failed to send reply.';
        this.toast.error('Failed to send reply');
      }
    });
  }

  isOwnReply(reply: any): boolean {
    return reply?.sender?.role !== 'ADMIN' && reply?.sender?.username === this.currentUsername;
  }
}
