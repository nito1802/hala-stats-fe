import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { SeasonAwardsService } from '../services/season-awards.service';
import { AwardDto, SeasonAwardsDto } from '../models/season-awards.model';

@Component({
  selector: 'app-trophy-award-details',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, MatCardModule],
  templateUrl: './trophy-award-details.component.html',
  styleUrl: './trophy-award-details.component.css',
})
export class TrophyAwardDetailsComponent implements OnInit {
  season?: SeasonAwardsDto;
  award?: AwardDto;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private seasonAwardsService: SeasonAwardsService,
  ) {}

  ngOnInit(): void {
    const seasonIdx = Number(this.route.snapshot.paramMap.get('seasonIdx'));
    const awardId = Number(this.route.snapshot.paramMap.get('awardId'));

    this.seasonAwardsService.getAwardDetails(seasonIdx, awardId).subscribe({
      next: (result) => {
        if (!result) {
          this.errorMessage = 'Nie znaleziono pucharu.';
          this.isLoading = false;
          return;
        }

        this.season = result.season;
        this.award = result.award;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać szczegółów pucharu.';
        this.isLoading = false;
      },
    });
  }

  getAwardImagePath(): string {
    if (!this.season || !this.award) {
      return '';
    }

    const normalizedSeason = this.normalizePathSegment(this.season.seasonName);
    const normalizedAward = this.normalizePathSegment(this.award.name);

    return encodeURI(`puchary/${normalizedSeason}/${normalizedAward}.png`);
  }

  private normalizePathSegment(value: string): string {
    return value.replaceAll('/', '-').trim();
  }

  getCreatedAtText(createdAt?: string): string {
    if (!createdAt) {
      return '';
    }

    const parsedDate = new Date(createdAt);
    return parsedDate.toLocaleDateString('pl-PL');
  }
}
