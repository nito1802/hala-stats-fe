import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { RankingComponent } from './ranking/ranking.component';
import { TrophyCabinetComponent } from './trophy-cabinet/trophy-cabinet.component';
import { TrophyAwardDetailsComponent } from './trophy-award-details/trophy-award-details.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'ranking', component: RankingComponent },
  { path: 'terminarz', component: ScheduleComponent },
  { path: 'gablota', component: TrophyCabinetComponent },
  {
    path: 'gablota/:seasonIdx/puchar/:awardId',
    component: TrophyAwardDetailsComponent,
  },
  {
    path: 'player/:id',
    loadComponent: () =>
      import('./player-stats/player-stats.component').then(
        (m) => m.PlayerStatsComponent,
      ),
  },
];
