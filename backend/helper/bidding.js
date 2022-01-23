const { sendError, sendGameObjToPlayers } = require("./comms");

const placeBid = (game, god, amount, playerId) => {
    if (game.boardState.stage != "BIDDING") return;

    const bid = game.boardState.bids.filter((bid) => bid.god == god)[0];
    if (bid == undefined) return;

    if (bid.god == game.players[playerId].prevBidGod) {
        sendError(game, playerId, "Cannot bid again to same God");
        return;
    }

    if (game.boardState.turn != playerId) {
        sendError(game, playerId, "Cannot bid, invalid turn");
        return;
    }

    // check if a player had already bid for this god. if so, then consider that player as outbid player and that will have the next turn
    const outBidPlayerId = bid.maxBidPlayerId;
    const outBidAmount = bid.maxBidAmount;

    if (outBidAmount != undefined && outBidAmount >= amount) {
        sendError(game, playerId, "Bid amount is lower than expected");
        return;
    }

    bid.maxBidAmount = amount;
    bid.maxBidPlayerId = playerId;
    game.players[playerId].prevBidGod = god;

    // check if all bids were placed by all players
    const allBidsPlaced =
        game.boardState.bids.filter(
            (bid) => bid.maxBidPlayerId >= 0 && bid.maxBidAmount > 0
        ).length == game.numPlayers;

    if (allBidsPlaced) biddingsDone(game);
    else {
        // calculate who will bid next
        if (outBidPlayerId != undefined && outBidPlayerId != null) {
            game.boardState.turn = outBidPlayerId;
        } else {
            // first player in the turnOrder which has not placed any bid
            game.boardState.turn = game.boardState.turnOrder.filter((id) => {
                return game.boardState.bids.every(
                    (bid) => bid.maxBidPlayerId != id
                );
            })[0];
        }
    }
    sendGameObjToPlayers(game);
};

const biddingsDone = (game) => {
    const turnOrder = [];
    for (let bid of game.boardState.bids) {
        if (bid.maxBidPlayerId == undefined) continue;
        const amountToBePaid =
            bid.god == "APOLLO"
                ? 0
                : Math.max(
                      1,
                      bid.maxBidAmount -
                          game.players[bid.maxBidPlayerId].priests
                  );
        game.players[bid.maxBidPlayerId].gold -= amountToBePaid;
        game.gold += amountToBePaid;
        turnOrder.push(bid.maxBidPlayerId);
    }
    game.boardState.turnOrder = turnOrder;
    game.boardState.turn = turnOrder[0];
    game.boardState.stage = "ACTION";
};

const endbiddings = (game) => {

const biddingendforzeus = (game, playerId) => {
    game.player[playerId].priests++;
}
const biddingendforposeidon = (game, playerId) => {
    game.player[playerId].ships++;
}
const biddingendforares = (game, playerId) => {
    game.player[playerId].soldiers++;
}
const biddingendforathena = (game, playerId) => {
    game.player[playerId].philosphers++;
}
}



exports.placeBid = placeBid;
