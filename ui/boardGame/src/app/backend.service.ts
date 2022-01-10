import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { PlayerInfo } from './app.component';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  httpOptions: any = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  initializeGame(gameId: string, playersInfo: PlayerInfo[]) {
    return this.http.post(
      environment.baseUrl + 'initializeGame',
      { gameId: gameId, playersInfo: playersInfo },
      this.httpOptions
    );
  }

  joinGame(gameId: string, name: string, token: string) {
    return this.http.post(
      environment.baseUrl + 'joinGame',
      { gameId: gameId, name: name, token: token },
      this.httpOptions
    );
  }
}
