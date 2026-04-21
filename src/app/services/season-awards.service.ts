import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { BaseUrl } from '../consts/urls';
import {
  SeasonAwardsDto,
  AwardDto,
  PlayerAwardDto,
} from '../models/season-awards.model';

@Injectable({
  providedIn: 'root',
})
export class SeasonAwardsService {
  constructor(private http: HttpClient) {}

  getSeasonAwards(): Observable<SeasonAwardsDto[]> {
    return this.http.get<SeasonAwardsDto[]>(`${BaseUrl}/Stats/season-awards`);
  }

  getAllAwards(): Observable<AwardDto[]> {
    return this.http.get<AwardDto[]>(`${BaseUrl}/Stats/awards`);
  }

  getAllAwardsFlat(): Observable<PlayerAwardDto[]> {
    return this.getAllAwards().pipe(
      map((awards) =>
        (awards ?? []).map(
          (award): PlayerAwardDto => ({
            ...award,
            seasonIdx: award.seasonId,
          }),
        ),
      ),
    );
  }

  getSeasonByIdx(seasonIdx: number): Observable<SeasonAwardsDto | undefined> {
    return this.getSeasonAwards().pipe(
      map((seasons) => seasons.find((x) => x.seasonIdx === seasonIdx)),
    );
  }

  getAwardDetails(
    seasonIdx: number,
    awardId: number,
  ): Observable<{ season: SeasonAwardsDto; award: AwardDto } | undefined> {
    return this.getSeasonAwards().pipe(
      map((seasons) => {
        const season = seasons.find((x) => x.seasonIdx === seasonIdx);
        if (!season) {
          return undefined;
        }

        const award = season.awards.find((x) => x.id === awardId);
        if (!award) {
          return undefined;
        }

        return { season, award };
      }),
    );
  }
}
