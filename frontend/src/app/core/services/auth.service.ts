import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post<any>(`${this.base}/api/auth/login`, { username, password });
  }

  register(data: any) {
    return this.http.post<any>(`${this.base}/api/auth/register`, data);
  }

  logout() {
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.base}/api/auth/logout`, {}).subscribe({ error: () => {} });
    }
    localStorage.removeItem('session_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
    this.router.navigate(['/login']);
  }

  getToken(): string | null { return localStorage.getItem('session_token'); }
  getRole(): string | null { return localStorage.getItem('user_role'); }
  getUsername(): string | null { return localStorage.getItem('username'); }
  getUserId(): string | null { return localStorage.getItem('user_id'); }
  isLoggedIn(): boolean { return !!this.getToken(); }
  isAdmin(): boolean { return this.getRole() === 'ADMIN'; }

  storeAuth(token: string, role: string, username: string, userId?: string) {
    localStorage.setItem('session_token', token);
    localStorage.setItem('user_role', role);
    localStorage.setItem('username', username);
    if (userId) {
      localStorage.setItem('user_id', userId);
    }
  }
}
