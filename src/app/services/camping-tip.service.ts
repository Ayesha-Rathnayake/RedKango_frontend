import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CampingTip,
  CampingTipRequest,
  FileUploadResponse,
} from '../models/camping-tip.model';

@Injectable({ providedIn: 'root' })
export class CampingTipService {
  private adminApi = 'http://localhost:8080/api/admin/camping-tips';
  private publicApi = 'http://localhost:8080/api/camping-tips';
  private uploadApi = 'http://localhost:8080/api/admin/upload';

  constructor(private http: HttpClient) {}

  // Public user portal APIs
  getPublicTips() {
    return this.http.get<CampingTip[]>(this.publicApi);
  }

  getPublicTipById(id: number) {
    return this.http.get<CampingTip>(`${this.publicApi}/id/${id}`);
  }

  getPublicTipBySlug(slug: string) {
    return this.http.get<CampingTip>(`${this.publicApi}/${slug}`);
  }

  // Admin portal APIs
  getAll() {
    return this.http.get<CampingTip[]>(this.adminApi);
  }

  create(tip: CampingTipRequest) {
    return this.http.post<CampingTip>(this.adminApi, tip);
  }

  update(id: number, tip: CampingTipRequest) {
    return this.http.put<CampingTip>(`${this.adminApi}/${id}`, tip);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.adminApi}/${id}`);
  }

  togglePublished(id: number) {
    return this.http.patch<CampingTip>(`${this.adminApi}/${id}/toggle-published`, {});
  }

  uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<FileUploadResponse>(this.uploadApi, formData);
  }
}