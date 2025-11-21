import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BaseUrl } from '../consts/urls';
import { RouterModule } from '@angular/router';

interface PlayerRankResponseDto {
  index: number | null;
  playerName: string;
  playerId: string;
  eloRating: number;
  gamesCount: number;
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
  displayedColumns: string[] = [
    'index',
    'playerName',
    'eloRating',
    'gamesCount',
  ];
  players: PlayerRankResponseDto[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get<PlayerRankResponseDto[]>(`${BaseUrl}/Player/rank`)
      .subscribe((data) => {
        this.players = data;
      });
  }
}
