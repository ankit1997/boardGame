const { initializeBidding } = require("./helper/bidding");
const { sendGameObjToPlayers } = require("./helper/comms");

const endTurn = (game, playerId) => {
    game.logs.push(game.players[playerId].name + " action turn completed");

    const currentTurnInd = game.boardState.turnOrder.findIndex(
        (id) => id == playerId
    );

    if (!game.boardState.nextTurnOrder) {
        game.boardState.nextTurnOrder = [];
    }

    if (currentTurnInd == game.boardState.turnOrder.length - 1) {
        // all players are done with action, now restart with bidding round
        game.boardState.nextTurnOrder.push(playerId);
        initializeBidding(game);
    } else if (currentTurnInd != -1) {
        game.boardState.turn = game.boardState.turnOrder[currentTurnInd + 1];
        game.boardState.nextTurnOrder.push(playerId);
    }

    sendGameObjToPlayers(game);
};

exports.endTurn = endTurn;
