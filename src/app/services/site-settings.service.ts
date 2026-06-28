import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SiteSettings } from '../models/site-settings.model';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  businessName: 'Red Kango',
  phone: '+94 76 537 8422',
  email: 'redkango@gmail.com',
  address: 'Bandarawela, Sri Lanka',
  whatsappNumber: '94765378422',
  facebookUrl: 'https://www.facebook.com/share/1D5NRgZtyT/',
  instagramUrl: 'https://instagram.com/',
  youtubeUrl: 'https://www.youtube.com/@NutNKnot',
  tagline: 'Your trusted partner for camping adventures. Quality tents, equipment, and unforgettable experiences.',
};

@Injectable({ providedIn: 'root' })
export class SiteSettingsService {

  constructor(private http: HttpClient) {}

  get(): Observable<SiteSettings> {
    return this.http
      .get<SiteSettings>('http://localhost:8080/api/site-settings')
      .pipe(
        catchError((err) => {
          console.error('[SiteSettingsService] API call failed:', err.status, err.message);
          return of(DEFAULT_SITE_SETTINGS);
        })
      );
  }
}
