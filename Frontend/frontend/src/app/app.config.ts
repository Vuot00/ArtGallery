// 1. Importa 'provideHttpClient'
import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }), // (Ho corretto un piccolo typo qui, era 'eventCoCoalescing')
    provideRouter(routes),

    // 2. Aggiungi questo
    provideHttpClient()
  ]
};
