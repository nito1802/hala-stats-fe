import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule], // Dodaj HttpClientModule do importów
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  nextMatch: any;
  matchesHistory: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>('https://localhost:7193/MatchSchedule/next-match')
      .subscribe(match => this.nextMatch = match);

    this.http.get<any[]>('https://localhost:7193/Match/matches-history')
      .subscribe(matches => this.matchesHistory = matches);
  }
}
