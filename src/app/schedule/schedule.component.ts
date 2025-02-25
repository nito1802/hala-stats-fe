import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BaseUrl } from '../consts/urls';

interface MatchScheduleResponseDto {
  matchDate: Date;
  skarbnikId: string;
  state: string;
  eventLink: string;
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [
    CommonModule, // Wymagane dla dyrektyw Angulara, np. *ngIf, *ngFor
    MatTableModule, // Importuj MatTableModule bezpośrednio do komponentu
    MatButtonModule, // Importuj MatButtonModule bezpośrednio do komponentu
    HttpClientModule
  ],  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent implements OnInit {
  displayedColumns: string[] = ['index', 'matchDate', 'skarbnik', 'state'];
  matches: MatchScheduleResponseDto[] = [];
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<MatchScheduleResponseDto[]>(`${BaseUrl}/MatchSchedule/matches-schedule`)
      .subscribe(data => {
        this.matches = data;
      });
  }
}
