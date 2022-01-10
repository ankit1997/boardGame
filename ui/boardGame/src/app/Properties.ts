import { PlayerInfo, Stages } from './app.component';
import { BoardState } from './BoardState';

export class Properties {
  gameId: string;
  numPlayers: number;
  playersInfo: PlayerInfo[];

  width: number;
  height: number;
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
}
