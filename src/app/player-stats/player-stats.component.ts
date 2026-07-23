import {
  Component,
  OnInit,
  ViewChild,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import '../../syncfusion-license';

import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, forkJoin, of } from 'rxjs';
import {
  ChartComponent,
  ChartModule,
  CrosshairService,
  SplineSeriesService,
  TooltipService,
} from '@syncfusion/ej2-angular-charts';
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

interface MatchPlayerDto {
  id: string;
  displayName: string;
}

interface MatchTeamDto {
  players: MatchPlayerDto[];
  goalsCount: number;
  teamName: string;
}

interface MatchHistoryDto {
  teamA: MatchTeamDto;
  teamB: MatchTeamDto;
  matchDate: string;
}

interface PlayerRecentMatch {
  result: string;
  score?: string;
  tooltip?: string;
}

interface EloChartPoint {
  matchNumber: number;
  date: Date;
  rating: number;
  tooltip: string;
}

@Component({
  selector: 'app-player-stats',
  imports: [HttpClientModule, RouterModule, MatTooltipModule, ChartModule],
  templateUrl: './player-stats.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./player-stats.component.css'],
  providers: [CrosshairService, SplineSeriesService, TooltipService],
})
export class PlayerStatsComponent implements OnInit {
  @ViewChild('eloChart') private eloChart?: ChartComponent;

  private eloTooltipHideTimer: ReturnType<typeof setTimeout> | null = null;
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private seasonAwardsService = inject(SeasonAwardsService);

  playerId!: string;
  stats!: PlayerStatsResponseDto | null;
  playerAwards: PlayerAwardDto[] = [];
  recentMatches: PlayerRecentMatch[] = [];
  eloChartData: EloChartPoint[] = [];
  eloPrimaryXAxis = this.getDefaultEloXAxis();
  eloPrimaryYAxis = this.getDefaultEloYAxis();
  eloChartArea = {
    border: { width: 0 },
  };
  eloChartMargin = {
    top: 8,
    right: 16,
    bottom: 8,
    left: 8,
  };
  eloTooltip = {
    enable: true,
    enableMarker: true,
    shared: false,
    duration: 180,
    fadeOutDuration: 500,
    fill: '#151515',
    textStyle: {
      color: '#ffffff',
      fontWeight: '600',
      size: '13px',
    },
    border: {
      color: '#151515',
      width: 1,
    },
  };
  eloCrosshair = {
    enable: true,
    lineType: 'Vertical',
    line: {
      width: 1,
      color: '#9ca3af',
      dashArray: '4 4',
    },
  };
  eloMarker = {
    visible: true,
    width: 9,
    height: 9,
    fill: '#ffffff',
    border: {
      width: 2,
      color: '#e53935',
    },
  };
  eloAnimation = {
    enable: true,
    duration: 1400,
    delay: 120,
  };

  ngOnInit(): void {
    this.playerId = this.route.snapshot.paramMap.get('id')!;

    forkJoin({
      stats: this.http.get<PlayerStatsResponseDto>(
        `${BaseUrl}/Player/player-stats?playerId=${this.playerId}`,
      ),
      awards: this.seasonAwardsService.getAllAwardsFlat(),
      matches: this.http
        .get<MatchHistoryDto[]>(`${BaseUrl}/Match/matches-history`)
        .pipe(catchError(() => of([] as MatchHistoryDto[]))),
    }).subscribe({
      next: ({ stats, awards, matches }) => {
        this.stats = stats;
        this.setEloChartData(stats.eloProgressions ?? []);
        this.setRecentMatches(stats, matches ?? []);
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
      `puchary/${this.normalizePathSegment(award.seasonName)}/${this.normalizePathSegment(award.slug)}.png`,
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

  get latestElo(): EloChartPoint | null {
    return this.eloChartData.at(-1) ?? null;
  }

  get bestElo(): EloChartPoint | null {
    if (this.eloChartData.length === 0) return null;

    return this.eloChartData.reduce((best, current) =>
      current.rating > best.rating ? current : best,
    );
  }

  showEloTooltipOnPointClick(args: { pointIndex?: number }): void {
    const pointIndex = args.pointIndex ?? -1;
    const point = this.eloChartData[pointIndex];

    if (!point) return;

    this.eloChart?.showTooltip(point.matchNumber, point.rating, true);
    this.scheduleEloTooltipHide();
  }

  hideEloTooltip(): void {
    this.clearEloTooltipHideTimer();
    this.eloChart?.hideTooltip();
  }

  hideEloTooltipOnChartClick(args: { target?: string }): void {
    if (args.target?.includes('_Point_')) return;

    this.hideEloTooltip();
  }

  formatEloTooltip(args: {
    data?: { pointIndex?: number };
    point?: { index?: number };
    text?: string;
    headerText?: string;
  }): void {
    const pointIndex = args.data?.pointIndex ?? args.point?.index ?? -1;
    const point = this.eloChartData[pointIndex];

    if (!point) return;

    args.headerText = 'Ranking ELO';
    args.text = `Mecz ${point.matchNumber}: ${point.rating}<br>${this.formatChartDate(point.date)}`;
  }

  formatChartDate(date: Date): string {
    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  trackByRecentMatch(index: number, match: PlayerRecentMatch): string {
    return `${index}-${match.result}-${match.score ?? ''}`;
  }

  private setEloChartData(
    progressions: { date: string; rating: number }[],
  ): void {
    this.eloChartData = progressions
      .map((point) => ({
        date: new Date(point.date),
        rating: point.rating,
      }))
      .filter((point) => !Number.isNaN(point.date.getTime()))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((point, index) => ({
        ...point,
        matchNumber: index + 1,
        tooltip: `Mecz ${index + 1}: ${point.rating}<br>${this.formatChartDate(point.date)}`,
      }));

    this.eloPrimaryXAxis = {
      ...this.getDefaultEloXAxis(),
      ...this.getEloXAxisRange(),
    };
    this.eloPrimaryYAxis = {
      ...this.getDefaultEloYAxis(),
      ...this.getEloYAxisRange(),
    };
  }

  private getEloYAxisRange(): {
    minimum?: number;
    maximum?: number;
    interval?: number;
  } {
    if (this.eloChartData.length === 0) return {};

    const ratings = this.eloChartData.map((point) => point.rating);
    const min = Math.min(...ratings);
    const max = Math.max(...ratings);
    const range = Math.max(1, max - min);
    const padding = Math.max(60, Math.ceil(range * 0.45));
    const minimum = Math.floor((min - padding) / 10) * 10;
    const maximum = Math.ceil((max + padding) / 10) * 10;
    const interval = Math.max(30, Math.ceil((maximum - minimum) / 5 / 10) * 10);

    return { minimum, maximum, interval };
  }

  private getEloXAxisRange(): {
    minimum?: number;
    maximum?: number;
    interval?: number;
  } {
    const length = this.eloChartData.length;

    if (length === 0) return {};
    if (length === 1) return { minimum: 0.5, maximum: 1.5, interval: 1 };

    return {
      minimum: 1,
      maximum: length,
      interval: Math.max(1, Math.ceil((length - 1) / 6)),
    };
  }

  private getDefaultEloXAxis() {
    return {
      valueType: 'Double',
      labelFormat: '',
      edgeLabelPlacement: 'Shift',
      labelIntersectAction: 'Hide',
      majorGridLines: { width: 0 },
      majorTickLines: { width: 0 },
      lineStyle: { color: '#d4d4d4', width: 1 },
      labelStyle: {
        color: '#5f6368',
        size: '12px',
      },
      title: 'Rozegrane mecze',
      titleStyle: {
        color: '#4b5563',
        size: '12px',
        fontWeight: '600',
      },
    };
  }

  private getDefaultEloYAxis() {
    return {
      labelFormat: '{value}',
      opposedPosition: false,
      rangePadding: 'Additional',
      majorGridLines: {
        width: 1,
        color: '#ececec',
        dashArray: '4 3',
      },
      majorTickLines: { width: 0 },
      lineStyle: { width: 0 },
      labelStyle: {
        color: '#5f6368',
        size: '12px',
      },
      title: 'Ranking ELO',
      titleStyle: {
        color: '#4b5563',
        size: '12px',
        fontWeight: '600',
      },
    };
  }

  private scheduleEloTooltipHide(): void {
    this.clearEloTooltipHideTimer();
    this.eloTooltipHideTimer = setTimeout(() => {
      this.eloChart?.hideTooltip();
      this.eloTooltipHideTimer = null;
    }, 500);
  }

  private clearEloTooltipHideTimer(): void {
    if (!this.eloTooltipHideTimer) return;

    clearTimeout(this.eloTooltipHideTimer);
    this.eloTooltipHideTimer = null;
  }

  private normalizePathSegment(value: string): string {
    return value.replaceAll('/', '-').trim();
  }

  private setRecentMatches(
    stats: PlayerStatsResponseDto,
    matchesHistory: MatchHistoryDto[],
  ): void {
    const serieLetters = (stats.serie ?? '').split('');
    const playerMatches = matchesHistory
      .filter((match) => this.getPlayerTeam(match, stats) !== null)
      .sort(
        (a, b) =>
          new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime(),
      )
      .slice(0, serieLetters.length);

    this.recentMatches = serieLetters.map((letter, index) => {
      const match = playerMatches[index];

      if (!match) return { result: letter };

      return this.getRecentMatchFromHistory(match, stats) ?? { result: letter };
    });
  }

  private getRecentMatchFromHistory(
    match: MatchHistoryDto,
    stats: PlayerStatsResponseDto,
  ): PlayerRecentMatch | null {
    const playerTeam = this.getPlayerTeam(match, stats);

    if (!playerTeam) return null;

    const ownTeam = playerTeam === 'A' ? match.teamA : match.teamB;
    const opponentTeam = playerTeam === 'A' ? match.teamB : match.teamA;
    const ownGoals = ownTeam.goalsCount;
    const opponentGoals = opponentTeam.goalsCount;

    return {
      result: this.getMatchResultLetter(ownGoals, opponentGoals),
      score: `${ownGoals}-${opponentGoals}`,
      tooltip: `${ownTeam.teamName} vs ${opponentTeam.teamName} - ${this.formatChartDate(
        new Date(match.matchDate),
      )}`,
    };
  }

  private getPlayerTeam(
    match: MatchHistoryDto,
    stats: PlayerStatsResponseDto,
  ): 'A' | 'B' | null {
    if (this.teamHasPlayer(match.teamA, stats)) return 'A';
    if (this.teamHasPlayer(match.teamB, stats)) return 'B';

    return null;
  }

  private teamHasPlayer(
    team: MatchTeamDto,
    stats: PlayerStatsResponseDto,
  ): boolean {
    return team.players.some((player) => this.isCurrentPlayer(player, stats));
  }

  private isCurrentPlayer(
    player: MatchPlayerDto,
    stats: PlayerStatsResponseDto,
  ): boolean {
    const currentPlayerKeys = [
      this.playerId,
      this.safeDecodeURIComponent(this.playerId),
      stats.id,
      stats.displayName,
    ].map((value) => this.normalizePlayerKey(value));
    const playerKeys = [player.id, player.displayName].map((value) =>
      this.normalizePlayerKey(value),
    );

    return playerKeys.some((playerKey) => currentPlayerKeys.includes(playerKey));
  }

  private normalizePlayerKey(value: string): string {
    return value.trim().toLocaleLowerCase('pl-PL');
  }

  private safeDecodeURIComponent(value: string): string {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  private getMatchResultLetter(ownGoals: number, opponentGoals: number): string {
    if (ownGoals > opponentGoals) return 'Z';
    if (ownGoals < opponentGoals) return 'P';

    return 'R';
  }
}
