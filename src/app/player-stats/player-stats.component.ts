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
import { forkJoin } from 'rxjs';
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
    providers: [
      CrosshairService,
      SplineSeriesService,
      TooltipService,
    ],
})
export class PlayerStatsComponent implements OnInit {
  @ViewChild('eloChart') private eloChart?: ChartComponent;

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private seasonAwardsService = inject(SeasonAwardsService);

  playerId!: string;
  stats!: PlayerStatsResponseDto | null;
  playerAwards: PlayerAwardDto[] = [];
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
    fadeOutDuration: 3500,
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
    }).subscribe({
      next: ({ stats, awards }) => {
        this.stats = stats;
        this.setEloChartData(stats.eloProgressions ?? []);
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

  private setEloChartData(progressions: { date: string; rating: number }[]): void {
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

  private normalizePathSegment(value: string): string {
    return value.replaceAll('/', '-').trim();
  }
}
