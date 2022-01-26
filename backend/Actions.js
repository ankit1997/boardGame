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

const placePlayerSoldier = (game, playerId, soldierBlockId) => {
    addSoldier(game, block[soldierBlockId], playerId);
    const player = game.players[playerId];
    player.gold -= player.soldiersAdded;
    player.soldiersAdded++;
    sendGameObjToPlayers(game);
}
const placePlayerShip = (game, playerId, shipBlockId) => {
    addShip(game, block[shipBlockId], playerId);
    const player = game.players[playerId];
    player.gold -= player.shipsAdded;
    player.shipsAdded++;
    sendGameObjToPlayers(game);
}
const placePlayerFortress = (game,  playerId, fortressBlockId) => {
    addFortress(game, block[fortressBlockId], playerId);
    const player = game.players[playerId];
    player.gold -= player.fortressAdded;
    player.fortressAdded++;
    sendGameObjToPlayers(game);
}

const placePlayerTemple = (game, playerId, templeBlockId) => {
    addTemple(game, block[templeBlockId], playerId);
    const player = game.players[playerId];
    player.gold -= player.templesAdded;
    player.templesAdded++;
    sendGameObjToPlayers(game);
}

const placePlayerPort = (game,playerId, portBlockId) => {
    addPort(game, block[portBlockId], playerId);
    const player = game.players[playerId];
    player.gold -= player.portsAdded;
    player.portsAdded++;
    sendGameObjToPlayers(game);
}


exports.endTurn = endTurn;
exports.placePlayerSoldier = placePlayerSoldier;
exports.placePlayerShip = placePlayerShip;
