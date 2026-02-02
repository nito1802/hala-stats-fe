import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BaseUrl } from '../consts/urls';
import { RouterModule } from '@angular/router';

interface PlayerRankResponseDto {
  index: number | null;
  playerId: string;
  playerName: string;
  eloRating: number;
  gamesCount: number;
  lastMatchDate: string; // DateOnly z backendu najczęściej przychodzi jako "YYYY-MM-DD"
}

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
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

  currentSeasonPlayers: PlayerRankResponseDto[] = [];
  previousSeasonPlayers: PlayerRankResponseDto[] = [];

  // zostawiamy wszystkich, którzy mają lastMatchDate > 25 października 2025
  private readonly seasonCutoff = new Date('2025-10-25T00:00:00');

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get<PlayerRankResponseDto[]>(`${BaseUrl}/Player/rank`)
      .subscribe((data) => {
        const safe = (data ?? []).filter((x) => !!x && !!x.lastMatchDate);

        const isCurrent = (p: PlayerRankResponseDto) => {
          const d = this.parseDateOnly(p.lastMatchDate);
          return d !== null && d > this.seasonCutoff;
        };

        this.currentSeasonPlayers = safe.filter(isCurrent);

        // poprzednie sezony: sort wg daty ostatniego meczu (najnowsze na górze)
        this.previousSeasonPlayers = safe
          .filter((p) => !isCurrent(p))
          .sort((a, b) => {
            const da = this.parseDateOnly(a.lastMatchDate)?.getTime() ?? 0;
            const db = this.parseDateOnly(b.lastMatchDate)?.getTime() ?? 0;
            return db - da;
          });
      });
  }

  formatDate(dateOnly: string): string {
    const d = this.parseDateOnly(dateOnly);
    if (!d) return dateOnly;

    // Czytelnie po polsku: DD.MM.YYYY
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }

  private parseDateOnly(dateOnly: string): Date | null {
    // oczekujemy "YYYY-MM-DD"
    // robimy bezpieczny parse (własny), żeby uniknąć różnic stref czasowych
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly);
    if (!m) return null;

    const yyyy = Number(m[1]);
    const mm = Number(m[2]);
    const dd = Number(m[3]);

    if (!yyyy || !mm || !dd) return null;

    // local time, midnight
    return new Date(yyyy, mm - 1, dd, 0, 0, 0, 0);
  }
}
