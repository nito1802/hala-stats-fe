import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { Subject, takeUntil } from 'rxjs';

import { SeasonAwardsDto, AwardDto } from '../models/season-awards.model';
import { TrophyCabinetService } from './trophy-cabinet.service';

@Component({
  selector: 'app-trophy-cabinet',
  imports: [CommonModule, RouterModule, MatCardModule],
  templateUrl: './trophy-cabinet.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './trophy-cabinet.component.css',
})
export class TrophyCabinetComponent implements OnInit, OnDestroy {
  seasons: SeasonAwardsDto[] = [];
  isLoading = true;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(private trophyCabinetService: TrophyCabinetService) {}

  ngOnInit(): void {
    this.trophyCabinetService.seasons$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (seasons) => {
          this.seasons = seasons;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Nie udało się pobrać danych gabloty.';
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getAwardImagePath(seasonName: string, awardName: string): string {
    const normalizedSeason = this.normalizePathSegment(seasonName);
    const normalizedAward = this.normalizePathSegment(awardName);

    return encodeURI(`puchary/${normalizedSeason}/${normalizedAward}.png`);
  }

  private normalizePathSegment(value: string): string {
    return value.replaceAll('/', '-').trim();
  }

  trackBySeason(_: number, season: SeasonAwardsDto): number {
    return season.seasonIdx;
  }

  trackByAward(_: number, award: AwardDto): number {
    return award.id;
  }

  getMainWinnerDisplay(award: AwardDto): string {
    if (!award.players?.length) {
      return '—';
    }

    return award.players[0].displayName;
  }

  getAdditionalWinnersCount(award: AwardDto): number {
    if (!award.players?.length || award.players.length <= 1) {
      return 0;
    }

    return award.players.length - 1;
  }
}
