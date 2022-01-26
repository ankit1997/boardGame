const { sendGameObjToPlayers } = require("./helper/comms");

const endTurn = (game, playerId) => {
    game.logs.push(game.players[playerId].name + " action turn completed");

    const currentTurnInd = game.boardState.turnOrder.findIndex(
        (id) => id == playerId
    );

    if (currentTurnInd >= game.boardState.turnOrder.length - 1) {
        // all players are done with action, now restart with bidding round
        game.boardState.stage = "BIDDING";
        game.logs.push("Starting bid process");
    } else if (currentTurnInd != -1) {
        game.boardState.turn = game.boardState.turnOrder[currentTurnInd + 1];
    }

    sendGameObjToPlayers(game);
};

exports.endTurn = endTurn;
