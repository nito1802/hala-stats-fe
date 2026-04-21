import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { SeasonAwardsDto, AwardDto } from '../models/season-awards.model';
import { SeasonAwardsService } from '../services/season-awards.service';

@Component({
  selector: 'app-trophy-cabinet',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, MatCardModule],
  templateUrl: './trophy-cabinet.component.html',
  styleUrl: './trophy-cabinet.component.css',
})
export class TrophyCabinetComponent implements OnInit {
  seasons: SeasonAwardsDto[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private seasonAwardsService: SeasonAwardsService) {}

  ngOnInit(): void {
    this.seasonAwardsService.getSeasonAwards().subscribe({
      next: (data) => {
        this.seasons = [...data].sort((a, b) => b.seasonIdx - a.seasonIdx);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać danych gabloty.';
        this.isLoading = false;
      },
    });
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
