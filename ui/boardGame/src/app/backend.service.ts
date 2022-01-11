import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { PlayerInfo } from './app.component';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  constructor(public socket: Socket) {}

  initialize(playersInfo: PlayerInfo[]) {
    this.socket.emit('initialize', playersInfo);
  }

  authenticate(gameId: string, name: string, token: string) {
    this.socket.emit('authenticate', gameId, name, token);
  }

  placeBid(gameId: string, god: string, amount: number) {
    this.socket.emit('placeBid', gameId, god, amount);
  }
}
