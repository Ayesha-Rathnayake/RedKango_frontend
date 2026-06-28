import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './interceptors/jwt.interceptor';
import { provideAppConfig } from './config/app-config.loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppConfig(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top', // scrolls to top on every navigation
        anchorScrolling: 'enabled', // keeps anchor links working
      }),
    ),
    provideHttpClient(withInterceptors([jwtInterceptor])),
  ],
};
