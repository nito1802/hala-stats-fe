import { Injectable } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';

import { SeasonAwardsDto } from '../models/season-awards.model';
import { SeasonAwardsService } from '../services/season-awards.service';

@Injectable({ providedIn: 'root' })
export class TrophyCabinetService {
  readonly seasons$: Observable<SeasonAwardsDto[]>;

  constructor(private seasonAwardsService: SeasonAwardsService) {
    this.seasons$ = this.seasonAwardsService.getSeasonAwards().pipe(
      map((data) => [...data].sort((a, b) => b.seasonIdx - a.seasonIdx)),
      shareReplay(1),
    );
  }
}
