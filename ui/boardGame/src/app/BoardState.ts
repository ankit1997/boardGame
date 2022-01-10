import { Block } from './Block';

export class BoardState {
  turn: number;
  blockList: Block[];

  bids: Bid[];

  ownership: any;
  prosperity_markers_loc: number[];
  territory_markers_loc: number[];
}

export class Bid {
  god: God;
  maxBidAmount: number;
  maxBidPlayerId: number;
}

export enum God {
  ATHENA = 'Athena 📕',
  ARES = 'Ares 🤺',
  ZEUS = 'Zeus ⚡',
  POSEIDON = 'Poseidon 🚢',
  APOLLO = 'Apollo 💰',
}
