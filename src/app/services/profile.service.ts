import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImageUrl?: string;
}

export interface ApiMessage {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {

  private api = 'http://localhost:8080/api/profile';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(this.api);
  }

  updateProfile(data: Profile): Observable<any> {
    return this.http.put(this.api, data);
  }

  deactivateAccount(): Observable<ApiMessage> {
    return this.http.delete<ApiMessage>(this.api);
  }

  uploadProfileImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ url: string }>(
      `${this.api}/upload`,
      formData
    );
  }
}