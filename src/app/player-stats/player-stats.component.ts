import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BaseUrl } from '../consts/urls';

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
  imports: [CommonModule, HttpClientModule],
  templateUrl: './player-stats.component.html',
  styleUrls: ['./player-stats.component.css'],
})
export class PlayerStatsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  playerId!: string;
  stats!: PlayerStatsResponseDto | null;

  ngOnInit(): void {
    this.playerId = this.route.snapshot.paramMap.get('id')!;

    this.http
      .get<PlayerStatsResponseDto>(
        `${BaseUrl}/Player/player-stats?playerId=${this.playerId}`
      )
      .subscribe((res) => (this.stats = res));
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

  toMinutesString(total: number): string {
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    if (hours === 0) return `${minutes} min`;
    return `${hours}h ${minutes}min`;
  }
}
