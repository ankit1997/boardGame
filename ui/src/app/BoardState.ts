import { Block } from './Block';

export class BoardState {
  stage: string;
  turnOrder: number[];
  turn: number;
  blockList: Block[];

  bids: Bid[];

  ownership: any;
  prosperity_markers_loc: number[];
  territory_markers_loc: number[];
  board: any;
}

export class Bid {
  god: string;
  maxBidAmount: number;
  maxBidPlayerId: number;
}

export const God = {
  ATHENA: 'Athena 📕',
  ARES: 'Ares 🤺',
  ZEUS: 'Zeus ⚡',
  POSEIDON: 'Poseidon 🚢',
  APOLLO: 'Apollo 💰',
};
