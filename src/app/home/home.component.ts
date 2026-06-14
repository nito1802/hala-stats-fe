import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { SignalRService } from '../services/signal-r.service';
import { HomeService } from './home.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, MatButtonModule, MatCardModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class HomeComponent implements OnInit, OnDestroy {
  nextMatch: any;
  matchesHistory: any[] = [];
  counter: number = 0;
  score: number | null = null;
  matchInProgress: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private homeService: HomeService,
    private signalRService: SignalRService,
    @Inject(PLATFORM_ID) private platformId: any,
  ) {}

  ngOnInit(): void {
    this.homeService.homeData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ nextMatch, matchesHistory }) => {
        this.nextMatch = nextMatch;
        this.matchesHistory = matchesHistory;
      });

    if (isPlatformBrowser(this.platformId)) {
      this.signalRService.startConnection();

      this.signalRService.counter$
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.counter = value;
        });

      this.signalRService.score$
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.score = value;
        });

      this.signalRService.matchInProgress$
        .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
        .subscribe((isInProgress) => {
          this.homeService.getNextMatch().subscribe((match) => {
            this.nextMatch = match;
          });

          this.homeService.getMatchesHistory().subscribe((matches) => {
            this.matchesHistory = matches;
          });

          console.log('inprogress', isInProgress);
        });

      this.signalRService.scoreUpdate$
        .pipe(takeUntil(this.destroy$))
        .subscribe((scoreUpdate) => {
          if (scoreUpdate) {
            console.log('Aktualizacja nextMatch:', scoreUpdate);
            this.nextMatch = { ...this.nextMatch, ...scoreUpdate };
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getFormattedSingleDate(date: string | Date): string {
    const parsedDate = new Date(date);

    const day = parsedDate.getDate();
    const year = parsedDate.getFullYear();

    const weekday = parsedDate.toLocaleDateString('pl-PL', { weekday: 'long' });
    const formattedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);

    const monthInGenitive: { [key: string]: string } = {
      styczeń: 'Stycznia',
      luty: 'Lutego',
      marzec: 'Marca',
      kwiecień: 'Kwietnia',
      maj: 'Maja',
      czerwiec: 'Czerwca',
      lipiec: 'Lipca',
      sierpień: 'Sierpnia',
      wrzesień: 'Września',
      październik: 'Października',
      listopad: 'Listopada',
      grudzień: 'Grudnia',
    };

    const month = parsedDate
      .toLocaleDateString('pl-PL', { month: 'long' })
      .toLowerCase();

    const formattedMonth = monthInGenitive[month] || month;

    const time = parsedDate.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${formattedWeekday}, ${day} ${formattedMonth} ${year} - ${time}`;
  }

  getFormattedDate(
    matchDate: string | Date,
    matchEndDate: string | Date,
  ): string[] {
    const startDate = new Date(matchDate);
    const endDate = new Date(matchEndDate);

    const day = startDate.getDate();
    const year = startDate.getFullYear();

    const monthInGenitive: { [key: string]: string } = {
      styczeń: 'Stycznia',
      luty: 'Lutego',
      marzec: 'Marca',
      kwiecień: 'Kwietnia',
      maj: 'Maja',
      czerwiec: 'Czerwca',
      lipiec: 'Lipca',
      sierpień: 'Sierpnia',
      wrzesień: 'Września',
      październik: 'Października',
      listopad: 'Listopada',
      grudzień: 'Grudnia',
    };

    const month = startDate
      .toLocaleDateString('pl-PL', { month: 'long' })
      .toLowerCase();

    const formattedMonth = monthInGenitive[month] || month;

    const startTime = startDate.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const endTime = endDate.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const durationMinutes = Math.round(
      (endDate.getTime() - startDate.getTime()) / 60000,
    );

    return [
      `${day} ${formattedMonth} ${year}`,
      `${startTime} - ${endTime} (${durationMinutes} min)`,
    ];
  }

  getGoalMinute(goalTimespan: string): number {
    const time = goalTimespan.split(':');
    return parseInt(time[0], 10) * 60 + parseInt(time[1], 10);
  }
}
