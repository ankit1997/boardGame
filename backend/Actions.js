const endTurn = (game, playerId) => {
    if (game.boardState.turn != playerId) {
        return false;
    }

    game.logs.push(game.players[playerId].name + " action turn completed");

    const currentTurnInd = game.boardState.turnOrder.findIndex(
        (id) => id == playerId
    );
    if (currentTurnInd == -1) return false;

    if (!game.boardState.nextTurnOrder) {
        game.boardState.nextTurnOrder = [];
    }

    game.boardState.nextTurnOrder.push(playerId);

    if (currentTurnInd != game.boardState.turnOrder.length - 1) {
        game.boardState.turn = game.boardState.turnOrder[currentTurnInd + 1];
        beginActionTurn(game, game.boardState.turn);
    }

    return true;
};

const earnGold = (game, playerId) => {
    const earnings = game.boardState.board.blocks
        .filter(
            (block) => block.owner == playerId && block.numProsperityMarkers > 0
        )
        .map((block) => block.numProsperityMarkers)
        .reduce((a, b) => a + b, 0);
    game.players[playerId].gold += earnings;
    if (earnings > 0) {
        game.logs.push(
            game.players[playerId].name + " earned " + earnings + " coins"
        );
    }
};

const beginActionTurn = (game, playerId) => {
    if (game.boardState.stage != "ACTION") return;

    switch (game.players[playerId].prevBidGod) {
        case "ZEUS":
            if (game.priests > 0) {
                game.priests--;
                game.players[playerId].priests++;
                game.logs.push(
                    "[ZEUS] Priest card given to " + game.players[playerId].name
                );
            }
            break;
        case "ATHENA":
            if (game.philosophers > 0) {
                game.philosophers--;
                game.players[playerId].philosophers++;
                game.logs.push(
                    "[ATHENA] Philosopher card given to " +
                        game.players[playerId].name
                );
            }
            break;
        case "APOLLO":
            game.gold--;
            game.players[playerId].gold++;
            game.logs.push(
                "[APOLLO] Free gold coin given to " +
                    game.players[playerId].name
            );
            break;
    }
};

const buyCard = (game, playerId, cardName) => {
    switch (cardName) {
        case "philosopher":
            if (game.players[playerId].gold >= 4) {
                game.players[playerId].gold -= 4;
                game.gold += 4;
                game.philosophers--;
                game.players[playerId].philosophers++;
            }
            break;
        case "priest":
            if (game.players[playerId].gold >= 4) {
                game.players[playerId].gold -= 4;
                game.gold += 4;
                game.priests--;
                game.players[playerId].priests++;
            }
            break;
    }
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
exports.beginActionTurn = beginActionTurn;
exports.earnGold = earnGold;
exports.buyCard = buyCard;
