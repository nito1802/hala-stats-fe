export interface SeasonAwardPlayerDto {
  id: string;
  displayName: string;
}

export interface SeasonStatsDto {
  startAt: string;
  endAt: string;
  matchesCount: number;
  timeElapsed: string;
  goals: string;
  highestWin: string;
}

export interface AwardDto {
  id: number;
  name: string;
  value: string;
  tooltip: string;
  seasonId: number;
  seasonName: string;
  createdAt: string;
  players: SeasonAwardPlayerDto[];
}

export interface PlayerAwardDto extends AwardDto {
  seasonIdx: number;
}

export interface SeasonAwardsDto {
  seasonIdx: number;
  seasonName: string;
  stats: SeasonStatsDto;
  awards: AwardDto[];
}
