import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';
import { BaseUrl } from '../consts/urls';
import { SeasonAwardsService } from '../services/season-awards.service';
import { PlayerAwardDto } from '../models/season-awards.model';

export interface PlayerStatsResponseDto {
  id: string;
  displayName: string;
  serie: string;
  mostLikePlayer: string;
  playedMatches: number;
  totalMinutesPlayed: number;
  greatestWin: string;
  greatestLoss: string;
  teamGoalsScored: number;
  teamGoalsConceded: number;
  eloProgressions: { date: string; rating: number }[];
}

@Component({
  selector: 'app-player-stats',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, MatTooltipModule],
  templateUrl: './player-stats.component.html',
  styleUrls: ['./player-stats.component.css'],
})
export class PlayerStatsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private seasonAwardsService = inject(SeasonAwardsService);

  playerId!: string;
  stats!: PlayerStatsResponseDto | null;
  playerAwards: PlayerAwardDto[] = [];

  ngOnInit(): void {
    this.playerId = this.route.snapshot.paramMap.get('id')!;

    forkJoin({
      stats: this.http.get<PlayerStatsResponseDto>(
        `${BaseUrl}/Player/player-stats?playerId=${this.playerId}`,
      ),
      awards: this.seasonAwardsService.getAllAwardsFlat(),
    }).subscribe({
      next: ({ stats, awards }) => {
        this.stats = stats;
        this.playerAwards = (awards ?? []).filter((award) =>
          (award.players ?? []).some((player) => player.id === this.playerId),
        );
      },
    });
  }

  getSerieClass(letter: string): string {
    switch (letter) {
      case 'Z':
        return 'serie-box win';
      case 'P':
      case 'W':
        return 'serie-box loss';
      case 'R':
        return 'serie-box draw';
      default:
        return 'serie-box';
    }
  }

  getAwardImagePath(award: PlayerAwardDto): string {
    return encodeURI(
      `puchary/${this.normalizePathSegment(award.seasonName)}/${this.normalizePathSegment(award.name)}.png`,
    );
  }

  trackByAward(_: number, award: PlayerAwardDto): number {
    return award.id;
  }

  toMinutesString(total: number): string {
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    if (hours === 0) return `${minutes} min`;
    return `${hours}h ${minutes}min`;
  }

  private normalizePathSegment(value: string): string {
    return value.replaceAll('/', '-').trim();
  }
}
