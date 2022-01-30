import { AppComponent } from '../app.component';
import { Bid } from '../BoardState';

export class Bidding {
  constructor() {}

  static placeBid(oldBid: Bid, app: AppComponent): void {
    // bid validations
    if (app.properties.boardState.turn != app.playerState.id) {
      app.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot bid, invalid turn',
      });
      return;
    }
    if (
      app.currentBid.maxBidAmount == undefined ||
      app.currentBid.maxBidAmount == null ||
      app.currentBid.maxBidAmount <= 0
    ) {
      app.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No bid provided',
      });
      return;
    }
    if (
      oldBid.maxBidAmount != undefined &&
      app.currentBid.maxBidAmount <= oldBid.maxBidAmount
    ) {
      app.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Must bid higher than ' + oldBid.maxBidAmount,
      });
      return;
    }
    if (app.currentBid.maxBidAmount > app.playerState.gold) {
      app.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Insufficient funds',
      });
      return;
    }
    if (
      app.playerState.prevBidGod != null &&
      app.playerState.prevBidGod != undefined &&
      app.playerState.prevBidGod == app.currentBid.god
    ) {
      app.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot bid again on ' + app.playerState.prevBidGod,
      });
      return;
    }
    app.backendService.placeBid(
      app.currentBid.god,
      app.currentBid.maxBidAmount
    );
    app.currentBid = new Bid();
  }
}
