
import { APP_INITIALIZER, Provider } from '@angular/core';
import { APP_CONFIG, AppConfig } from './app-config.token';

function loadConfig(): Promise<AppConfig> {
  // Load from /assets/app-config.json
  return fetch('/assets/app-config.json')
    .then(res => {
      if (!res.ok) throw new Error('Cannot load app-config.json');
      return res.json();
    })
    .catch(() => {
      // Fallback to localhost backend if file missing
      return { apiBaseUrl: 'http://localhost:8080', enableFacebookAuth: false } as AppConfig;
    });
}

export function provideAppConfig(): Provider[] {
  let cached: AppConfig | null = null;

  return [
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => () =>
        loadConfig().then(cfg => { cached = cfg; })
    },
    {
      provide: APP_CONFIG,
      useFactory: () => {
        if (!cached) {
          // default fallback (should not happen after initializer)
          return { apiBaseUrl: 'http://localhost:8080', enableFacebookAuth: false } as AppConfig;
        }
        return cached;
      }
    }
  ];
}