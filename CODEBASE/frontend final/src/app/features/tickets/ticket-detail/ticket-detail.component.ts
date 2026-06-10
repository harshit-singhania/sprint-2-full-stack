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
        // Disable reply input if ticket is closed
        if (ticket.status === 'CLOSED') {
          this.replyForm.get('message')?.disable();
        } else {
          this.replyForm.get('message')?.enable();
        }
      },
      error: () => {
        this.error = 'Ticket not found.';
        this.isLoading = false;
      }
    });
  }

  sendReply() {
    if (this.replyForm.invalid || !this.ticket) return;
    if (this.ticket.status === 'CLOSED') {
      this.toast.error('This ticket is closed. You cannot reply.');
      return;
    }
    this.isSending = true;
    this.replyError = '';
    const message = this.replyForm.get('message')?.value?.trim();
    if (!message) { this.isSending = false; return; }

    this.ticketService.replyToTicket(this.ticket.id, message).subscribe({
      next: (updatedTicket) => {
        // API returns the updated ticket with new responses list
        if (updatedTicket && updatedTicket.responses) {
          this.ticket = updatedTicket;
        } else {
          // Fallback: reload if response shape is unexpected
          this.loadTicket();
        }
        this.replyForm.reset();
        this.isSending = false;
      },
      error: (err) => {
        this.isSending = false;
        this.replyError = err?.error?.message || 'Failed to send reply.';
        this.toast.error(this.replyError);
      }
    });
  }

  isOwnReply(reply: any): boolean {
    return reply?.sender?.role !== 'ADMIN' && reply?.sender?.username === this.currentUsername;
  }
}
