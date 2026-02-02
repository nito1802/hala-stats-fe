import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { RankingComponent } from './ranking/ranking.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Strona główna
  { path: 'ranking', component: RankingComponent }, // Ranking zawodników
  { path: 'terminarz', component: ScheduleComponent }, // Terminarz meczów
  {
    path: 'player/:id',
    loadComponent: () =>
      import('./player-stats/player-stats.component').then(
        (m) => m.PlayerStatsComponent,
      ),
  },
];
