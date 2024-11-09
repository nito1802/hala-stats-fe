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

  getFormattedDate(date: string | Date): string {
    const parsedDate = new Date(date);
  
    // Ustawienia dla dnia tygodnia, dnia, roku i odmiany miesiąca w dopełniaczu
    const day = parsedDate.getDate();
    const year = parsedDate.getFullYear();
  
    const weekday = parsedDate.toLocaleDateString('pl-PL', { weekday: 'long' });
    const formattedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  
    // Mapa odmian miesięcy w dopełniaczu
    const monthInGenitive: { [key: string]: string } = {
      'styczeń': 'Stycznia',
      'luty': 'Lutego',
      'marzec': 'Marca',
      'kwiecień': 'Kwietnia',
      'maj': 'Maja',
      'czerwiec': 'Czerwca',
      'lipiec': 'Lipca',
      'sierpień': 'Sierpnia',
      'wrzesień': 'Września',
      'październik': 'Października',
      'listopad': 'Listopada',
      'grudzień': 'Grudnia'
    };
  
    // Pobierz miesiąc w mianowniku i przemapuj na dopełniacz
    const month = parsedDate.toLocaleDateString('pl-PL', { month: 'long' }).toLowerCase();
    const formattedMonth = monthInGenitive[month] || month; // Bezpieczne użycie mapy
  
    // Ustawienie godziny i minuty
    const time = parsedDate.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  
    // Pożądany format daty
    return `${formattedWeekday}, ${day} ${formattedMonth} ${year} - ${time}`;
  }
  
  
}
