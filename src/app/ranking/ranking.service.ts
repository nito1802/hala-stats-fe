import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, shareReplay } from 'rxjs';

import { BaseUrl } from '../consts/urls';
import { SeasonAwardsService } from '../services/season-awards.service';
import { PlayerAwardDto } from '../models/season-awards.model';

export interface PlayerRankResponseDto {
  index: number | null;
  playerId: string;
  playerName: string;
  eloRating: number;
  gamesCount: number;
  lastMatchDate: string;
}

export interface PlayerRankWithAwardsDto extends PlayerRankResponseDto {
  awards: PlayerAwardDto[];
}

export interface RankingDataDto {
  currentSeasonPlayers: PlayerRankWithAwardsDto[];
  previousSeasonPlayers: PlayerRankWithAwardsDto[];
}

@Injectable({ providedIn: 'root' })
export class RankingService {
  private readonly seasonCutoff = new Date('2025-10-25T00:00:00');

  readonly ranking$: Observable<RankingDataDto>;

  constructor(
    private http: HttpClient,
    private seasonAwardsService: SeasonAwardsService,
  ) {
    this.ranking$ = forkJoin({
      players: this.http.get<PlayerRankResponseDto[]>(`${BaseUrl}/Player/rank`),
      awards: this.seasonAwardsService.getAllAwardsFlat(),
    }).pipe(
      map(({ players, awards }) => this.mapRanking(players, awards)),
      shareReplay(1),
    );
  }

  private mapRanking(
    players: PlayerRankResponseDto[],
    awards: PlayerAwardDto[],
  ): RankingDataDto {
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

    return {
      currentSeasonPlayers: enrichedPlayers.filter(isCurrent),
      previousSeasonPlayers: enrichedPlayers
        .filter((p) => !isCurrent(p))
        .sort((a, b) => {
          const da = this.parseDateOnly(a.lastMatchDate)?.getTime() ?? 0;
          const db = this.parseDateOnly(b.lastMatchDate)?.getTime() ?? 0;
          return db - da;
        }),
    };
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

    return result;
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
