import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PlayerAwardDto } from '../models/season-awards.model';
import { PlayerRankWithAwardsDto, RankingService } from './ranking.service';

@Component({
  selector: 'app-ranking',
  imports: [MatTableModule, MatButtonModule, MatTooltipModule, RouterModule],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class RankingComponent implements OnInit {
  displayedColumnsCurrent: string[] = [
    'index',
    'playerName',
    'eloRating',
    'gamesCount',
  ];

  displayedColumnsPrevious: string[] = [
    'playerName',
    'lastMatchDate',
    'gamesCount',
  ];

  currentSeasonPlayers: PlayerRankWithAwardsDto[] = [];
  previousSeasonPlayers: PlayerRankWithAwardsDto[] = [];

  constructor(private rankingService: RankingService) {}

  ngOnInit(): void {
    this.rankingService.ranking$.subscribe({
      next: ({ currentSeasonPlayers, previousSeasonPlayers }) => {
        this.currentSeasonPlayers = currentSeasonPlayers;
        this.previousSeasonPlayers = previousSeasonPlayers;
      },
    });
  }

  getAwardImagePath(award: PlayerAwardDto): string {
    return encodeURI(
      `puchary/${this.normalizePathSegment(award.seasonName)}/${this.normalizePathSegment(award.slug)}.png`,
    );
  }

  trackByAward(_: number, award: PlayerAwardDto): number {
    return award.id;
  }

  formatDate(dateOnly: string): string {
    const d = this.parseDateOnly(dateOnly);
    if (!d) return dateOnly;

    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();

    return `${dd}.${mm}.${yyyy}`;
  }

  private normalizePathSegment(value: string): string {
    return value.replaceAll('/', '-').trim();
  }

  private parseDateOnly(dateOnly: string): Date | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly);
    if (!m) return null;

    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
}
