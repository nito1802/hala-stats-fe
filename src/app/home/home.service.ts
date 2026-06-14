import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, shareReplay } from 'rxjs';

import { BaseUrl } from '../consts/urls';

export interface HomeDataDto {
  nextMatch: any;
  matchesHistory: any[];
}

@Injectable({ providedIn: 'root' })
export class HomeService {
  readonly homeData$: Observable<HomeDataDto>;

  constructor(private http: HttpClient) {
    this.homeData$ = forkJoin({
      nextMatch: this.http.get<any>(`${BaseUrl}/MatchSchedule/next-match`),
      matchesHistory: this.http.get<any[]>(`${BaseUrl}/Match/matches-history`),
    }).pipe(shareReplay(1));
  }

  getNextMatch(): Observable<any> {
    return this.http.get<any>(`${BaseUrl}/MatchSchedule/next-match`);
  }

  getMatchesHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${BaseUrl}/Match/matches-history`);
  }
}
