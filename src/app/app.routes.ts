import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { RankingComponent } from './ranking/ranking.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Strona główna
  { path: 'terminarz', component: ScheduleComponent }, // Terminarz meczów
  { path: 'ranking', component: RankingComponent } // Ranking zawodników
];