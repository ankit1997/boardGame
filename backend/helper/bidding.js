const { sendError, sendGameObjToPlayers } = require("./comms");

const initializeBidding = (game) => {
    game.boardState.stage = "BIDDING";

    game.boardState.bids.forEach((bid) => {
        bid.maxBidAmount = undefined;
        bid.maxBidPlayerId = undefined;
    });
    shuffle(game.boardState.bids);

    if (
        game.boardState.nextTurnOrder &&
        game.boardState.nextTurnOrder.length != 0
    ) {
        game.boardState.turnOrder = game.boardState.nextTurnOrder.reverse();
    } else {
        game.boardState.turnOrder = shuffle([...Array(game.numPlayers).keys()]);
    }
    game.boardState.nextTurnOrder = [];
    game.boardState.turn = game.boardState.turnOrder[0];

    game.players[bid.maxBidPlayerId].soldiersAdded = 0;
    game.players[bid.maxBidPlayerId].shipsAdded = 0;
    game.players[bid.maxBidPlayerId].portsAdded = 0;
    game.players[bid.maxBidPlayerId].fortsAdded = 0;
    game.players[bid.maxBidPlayerId].universitiesAdded = 0;
    game.players[bid.maxBidPlayerId].templesAdded = 0;
    game.players[bid.maxBidPlayerId].metropolitansAdded = 0;

    game.logs.push("Started bid process");
};

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

        game.logs.push(game.players[playerId].name + " placed bid on " + god);
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

        // after bidding is done, reset current turn variables
        game.players[bid.maxBidPlayerId].soldiersAdded = 0;
        game.players[bid.maxBidPlayerId].shipsAdded = 0;
        game.players[bid.maxBidPlayerId].portsAdded = 0;
        game.players[bid.maxBidPlayerId].fortressAdded = 0;
        game.players[bid.maxBidPlayerId].universitiesAdded = 0;
        game.players[bid.maxBidPlayerId].templesAdded = 0;
        game.players[bid.maxBidPlayerId].priestsAdded = 0;
        game.players[bid.maxBidPlayerId].philosphersAdded = 0;
        game.players[bid.maxBidPlayerId].metropolitansAdded = 0;

        turnOrder.push(bid.maxBidPlayerId);
    }
    game.boardState.turnOrder = turnOrder;
    game.boardState.turn = turnOrder[0];
    game.boardState.stage = "ACTION";
};


const endbiddings = (game) => {
    const biddingendforzeus = (game, playerId) => {
        game.player[playerId].priests++;
        priestsBought
    };
    const biddingendforposeidon = (game, playerId) => {
        game.player[playerId].ships++;
    };
    const biddingendforares = (game, playerId) => {
        //soldierBlockId = fetch Here make it actionObj
        //pass it from here.
        //Sending Action obj from here?
    };
    const biddingendforathena = (game, playerId) => {
        //game.player[playerId].philosphers++;
    };
};


exports.initializeBidding = initializeBidding;
exports.placeBid = placeBid;
