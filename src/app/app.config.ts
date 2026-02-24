import {
  ApplicationConfig,
  APP_INITIALIZER,
  LOCALE_ID,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';

import {
  provideMyShared,
  UxTelemetryService,
  RouteTelemetryService,
  FocusTelemetryService,
} from '@nito1802/my-shared';
import { BaseUrl } from './consts/urls';

// ✅ Factory z DI przez deps (bez inject())
export function startTelemetryFactory(
  ux: UxTelemetryService,
  route: RouteTelemetryService,
  focus: FocusTelemetryService,
) {
  return () => {
    ux.start();
    route.start();
    focus.start();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),

    { provide: LOCALE_ID, useValue: 'pl' },

    ...provideMyShared({ baseUrl: BaseUrl }),

    {
      provide: APP_INITIALIZER,
      useFactory: startTelemetryFactory,
      deps: [UxTelemetryService, RouteTelemetryService, FocusTelemetryService],
      multi: true,
    },
  ],
};
