import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { PlayerInfo } from './app.component';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  constructor(public socket: Socket) {}

  initialize(width: number, height: number, playersInfo: PlayerInfo[]) {
    this.socket.emit('initialize', width, height, playersInfo);
  }

  authenticate(gameId: string, name: string, token: string) {
    this.socket.emit('authenticate', gameId, name, token);
  }

  setup(
    gameId: string,
    blockId: number,
    marker: string,
    obj: any,
    completeFlag?: boolean
  ) {
    this.socket.emit('setup', gameId, blockId, marker, obj, completeFlag);
  }

  placeBid(gameId: string, god: string, amount: number) {
    this.socket.emit('placeBid', gameId, god, amount);
  }

  action(gameId: string, actionObj: any) {
    this.socket.emit('action', gameId, actionObj);
  }
}
