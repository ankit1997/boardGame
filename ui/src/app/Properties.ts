import { PlayerInfo, Stages } from './app.component';
import { BoardState } from './BoardState';

export class Properties {
  gameId: string = 'e54a2bcd-0a2b-46d1-a1aa-d8bf53e674b1';
  creator: number;
  numPlayers: number;
  playersInfo: PlayerInfo[];
  players: any;

  width: number = 1000;
  height: number = 900;
  block_r: number;

  stage: Stages;

  gold: number;
  prosperity_markers: number;
  territory_markers: number;

  priests: number;
  philosophers: number;

  soldiers: number;
  ships: number;

  // state of the board

  boardState: BoardState;

  logs: string[];

  constructor(numPlayers: number) {
    this.numPlayers = numPlayers;
    if (this.numPlayers == 2) {
      this.width = 100;
      this.height = 100;
    } else if (this.numPlayers == 3) {
      this.width = 100;
      this.height = 100;
    } else if (this.numPlayers == 4) {
      this.width = 1000;
      this.height = 900;
    } else if (this.numPlayers == 5) {
      this.width = 1000;
      this.height = 900;
    }
  }

  getPlayerByColor(color: string): PlayerInfo {
    if (color == undefined || color == null) return undefined;
    return this.playersInfo.filter(
      (info: PlayerInfo) => info?.color?.toUpperCase() == color.toUpperCase()
    )[0];
  }

  getPlayerById(id: number): PlayerInfo {
    return this.playersInfo.filter((info: PlayerInfo) => info?.id == id)[0];
  }
}
