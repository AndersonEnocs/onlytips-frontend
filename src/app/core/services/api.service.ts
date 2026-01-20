import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private getHeaders() {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getProjectStatus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/public/project-status`);
  }

  getFundTotal(): Observable<any> {
    return this.http.get(`${this.baseUrl}/default-settings/fund-total`);
  }

  submitIdea(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/ideas/submit`, data);
  }

  login(password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, { password });
  }

  getAdminIdeas(page = 1, status = 'RECEIVED'): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/ideas?page=${page}&limit=10&status=${status}`, {
      headers: this.getHeaders()
    });
  }

  makeDecision(id: string, decision: { status: string, feedback: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/ideas/${id}/decision`, decision, {
      headers: this.getHeaders()
    });
  }

  getAdminStatistics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/statistics`, {
      headers: this.getHeaders()
    });
  }

  updateFund(amount: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/settings/fund`, { amount }, {
      headers: this.getHeaders()
    });
  }
}