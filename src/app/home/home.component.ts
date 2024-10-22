import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button'; // Dodaj import MatButtonModule
import { MatCardModule } from '@angular/material/card'; // Import MatCardModule
import { BaseUrl } from '../consts/urls'; // Wychodzimy z katalogu 'home' i wchodzimy do 'consts'


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, MatButtonModule, MatCardModule], // Dodaj HttpClientModule do importów
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  nextMatch: any;
  matchesHistory: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`${BaseUrl}/MatchSchedule/next-match`)
      .subscribe(match => this.nextMatch = match);

    this.http.get<any[]>(`${BaseUrl}/Match/matches-history`)
      .subscribe(matches => this.matchesHistory = matches);
  }
}
