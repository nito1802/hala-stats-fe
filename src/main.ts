import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// Rejestracja lokalizacji polskiej
registerLocaleData(localePl, 'pl');

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
