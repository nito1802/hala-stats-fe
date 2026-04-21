import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BaseUrl } from '../consts/urls';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SeasonAwardsService } from '../services/season-awards.service';
import { PlayerAwardDto } from '../models/season-awards.model';

interface PlayerRankResponseDto {
  index: number | null;
  playerId: string;
  playerName: string;
  eloRating: number;
  gamesCount: number;
  lastMatchDate: string;
}

interface PlayerRankWithAwardsDto extends PlayerRankResponseDto {
  awards: PlayerAwardDto[];
}

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatTooltipModule,
    HttpClientModule,
    RouterModule,
  ],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css'],
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

  private readonly seasonCutoff = new Date('2025-10-25T00:00:00');

  constructor(
    private http: HttpClient,
    private seasonAwardsService: SeasonAwardsService,
  ) {}

  ngOnInit(): void {
    forkJoin({
      players: this.http.get<PlayerRankResponseDto[]>(`${BaseUrl}/Player/rank`),
      awards: this.seasonAwardsService.getAllAwardsFlat(),
    }).subscribe({
      next: ({ players, awards }) => {
        const awardsByPlayerId = this.buildAwardsByPlayerId(awards);

        const enrichedPlayers: PlayerRankWithAwardsDto[] = (players ?? [])
          .filter((x) => !!x && !!x.lastMatchDate)
          .map((player) => ({
            ...player,
            awards: awardsByPlayerId.get(player.playerId) ?? [],
          }));

        const isCurrent = (p: PlayerRankWithAwardsDto) => {
          const d = this.parseDateOnly(p.lastMatchDate);
          return d !== null && d > this.seasonCutoff;
        };

        this.currentSeasonPlayers = enrichedPlayers.filter(isCurrent);

        this.previousSeasonPlayers = enrichedPlayers
          .filter((p) => !isCurrent(p))
          .sort((a, b) => {
            const da = this.parseDateOnly(a.lastMatchDate)?.getTime() ?? 0;
            const db = this.parseDateOnly(b.lastMatchDate)?.getTime() ?? 0;
            return db - da;
          });
      },
    });
  }

  getAwardImagePath(award: PlayerAwardDto): string {
    return encodeURI(
      `puchary/${this.normalizePathSegment(award.seasonName)}/${this.normalizePathSegment(award.name)}.png`,
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

  private buildAwardsByPlayerId(
    awards: PlayerAwardDto[],
  ): Map<string, PlayerAwardDto[]> {
    const result = new Map<string, PlayerAwardDto[]>();

    for (const award of awards ?? []) {
      for (const player of award.players ?? []) {
        const existing = result.get(player.id) ?? [];
        existing.push(award);
        result.set(player.id, existing);
      }
    }

    for (const [key, playerAwards] of result.entries()) {
      result.set(
        key,
        [...playerAwards].sort((a, b) => {
          if (b.seasonIdx !== a.seasonIdx) {
            return b.seasonIdx - a.seasonIdx;
          }

          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }),
      );
    }

    return result;
  }

  private normalizePathSegment(value: string): string {
    return value.replaceAll('/', '-').trim();
  }

  private parseDateOnly(dateOnly: string): Date | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly);
    if (!m) return null;

    const yyyy = Number(m[1]);
    const mm = Number(m[2]);
    const dd = Number(m[3]);

    if (!yyyy || !mm || !dd) return null;

    return new Date(yyyy, mm - 1, dd, 0, 0, 0, 0);
  }
}
