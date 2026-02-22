import { InjectionToken } from '@angular/core';

export interface AppConfig {
  apiBaseUrl: string;
  enableFacebookAuth?: boolean;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');