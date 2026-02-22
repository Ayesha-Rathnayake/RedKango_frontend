import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfileService {

  private api = 'http://localhost:8080/api/profile';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken'); // stored after login
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getProfile(): Observable<any> {
    return this.http.get(this.api, { headers: this.getAuthHeaders() });
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(this.api, data, { headers: this.getAuthHeaders() });
  }
}