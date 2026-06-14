import {
  Component,
  Inject,
  PLATFORM_ID,
  ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MenuComponent } from './menu/menu.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'hala-stats-fe';

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }

      this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
      );
    }
  }
}
