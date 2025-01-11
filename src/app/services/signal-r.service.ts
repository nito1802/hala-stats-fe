import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { BaseUrl } from '../consts/urls'; // Wychodzimy z katalogu 'home' i wchodzimy do 'consts'

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  public counter$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public score$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public matchInProgress$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public scoreUpdate$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  private readonly reconnectInterval = 5000;  // Retry co 5 sekund
  private readonly maxRetryTime = 120000;     // Maksymalny czas retry – 2 minuty
  private reconnectAttempts = 0;
  private isReconnecting = false;

  public startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${BaseUrl}/chatHub`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        withCredentials: true  // Dla sesji/ciasteczek
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])  // Domyślny retry
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Uruchomienie połączenia
    this.startHubConnection();

    // Licznik
    this.hubConnection.on('ReceiveCounter', (count: number) => {
      this.counter$.next(count);
    });

     // Obsługa aktualizacji wyniku
     this.hubConnection.on('ReceiveScoreUpdate', (scoreUpdate: any) => {
      console.log('Otrzymano aktualizację wyniku:', scoreUpdate);
      this.scoreUpdate$.next(scoreUpdate);
    });

    // Start meczu
    this.hubConnection.on('MatchBegin', () => {
      console.log('Match has started!');
      this.matchInProgress$.next(true);
    });

// Obsługa zakończenia meczu
this.hubConnection.on('MatchEnd', () => {
  console.log('Match has ended!');
  this.matchInProgress$.next(false); // Ustaw na false
});

    this.hubConnection.onclose(err => {
      console.error('WebSocket closed', err);
      this.handleReconnect(err);
    });
  }

  private startHubConnection() {
    this.hubConnection.start()
      .then(() => {
        console.log('SignalR connected');
        this.reconnectAttempts = 0;
        //this.hubConnection.invoke('StartCounting');  // Inicjalizacja licznika
      })
      .catch(err => this.handleReconnect(err));
  }

  public stopConnection(): void {
    this.hubConnection.stop();
  }

    // Retry logika
    private handleReconnect(err: any) {
      if (this.isReconnecting || this.reconnectAttempts >= (this.maxRetryTime / this.reconnectInterval)) {
        console.error('Max retry attempts reached. Connection failed.');
        return;
      }
  
      this.isReconnecting = true;
      console.warn(`Retry attempt ${this.reconnectAttempts + 1}...`);
  
      setTimeout(() => {
        this.startHubConnection();
        this.reconnectAttempts++;
        this.isReconnecting = false;
      }, this.reconnectInterval);
    }
}