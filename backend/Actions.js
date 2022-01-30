const { findConnected } = require("./Game");
const { addSoldier, addShip, getGroupIdbyBlockId } = require("./helper/block");

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

const placePlayerSoldier = (game, playerId, block) => {
    addSoldier(game, block, playerId);
    game.players[playerId].soldiersAdded++;
    if (game.players[playerId].soldiersAdded > 1) {
        game.players[playerId].gold -= game.players[playerId].soldiersAdded;
        game.gold += game.players[playerId].soldiersAdded;
    }
};

const placePlayerShip = (game, playerId, block) => {
    addShip(game, block, playerId);
    game.players[playerId].shipsAdded++;
    if (game.players[playerId].shipsAdded > 1) {
        game.players[playerId].gold -= game.players[playerId].shipsAdded - 1;
        game.gold += game.players[playerId].shipsAdded - 1;
    } 
};

const placePlayerFort = (game, playerId, block) => {
    addFort(game, block, playerId);
    const player = game.players[playerId];
    player.gold -= 2;
    game.gold +=2;
    game.ports--;
    sendGameObjToPlayers(game);
};

const placePlayerTemple = (game, playerId, block) => {
    addTemple(game, block, playerId);
    const player = game.players[playerId];
    player.gold -= 2;
    game.gold += 2;
    game.temples--;
    sendGameObjToPlayers(game);
};

const placePlayerPort = (game, playerId, block) => {
    addPort(game, block, playerId);
    const player = game.players[playerId];
    player.gold -= 2;
    game.gold += 2;
    game.ports--;
    sendGameObjToPlayers(game);
};

const placePlayerUniversity = (game, playerId, block) => {
    addUniversity(game, block, playerId);
    const player = game.players[playerId];
    player.gold -= 2;
    game.gold += 2;
    game.universities--;
    sendGameObjToPlayers(game);
}


const moveSoldier = (game, playerId, sourceBlockId, targetBlockId, numSoldiers) => {
    
    if(pathExistsBetweenIslands(game, playerId, sourceBlockId, targetBlockId))
        return true;
    else    
        return false;
};

const pathExistBetweenBlocks = (game, playerId, sourceBlockId, targetBlockId) => {

    const dMat = game.distanceMatrix;
    const connectedBlocks = new Set();

    if(sourceBlockId == targetBlockId)
        return true;
    
    findConnected(sourceBlockId, dMat, connectedBlocks);
    
    for(let j=0; j < connectedBlocks.length; j++){
        if(connectedBlocks[j].type == sea && connectedBlocks[j].owner == playerId && connectedBlocks[j].numShips >= 1){
            pathExistBetweenBlocks(game, playerId, connectedBlocks[j], targetBlockId);
        }
        else if (connectedBlocks[j].id == targetBlockId)
            return true;
    }
    return false;
}

const pathExistsBetweenIslands = (game, playerId, sourceBlockId, targetBlockId) => {
    
    const sourceGroupId = game.boardState.board.blocks[sourceBlockId].groupId;
    const targetGroupId = game.boardState.board.blocks[targetBlockId].groupId;
    
    const sourceGroupBlocks = game.boardState.board.blocks.filter(
        (block) => block.groupId == sourceGroupId
    );
    const targetGroupBlocks = game.boardState.board.blocks.filter(
        (block) => block.groupId == targetGroupId
    );

    for (let i = 0; i < sourceGroupBlocks.length; i++) {
        for (let j = 0; j < targetGroupBlocks.length; j++) {
            if(pathexistBetweenBlocks(game, playerId, sourceBlockId, targetBlockId))
                return true;
            else
                return false;
        }
    } 
};

const moveShip = (game, playerId, sourceBlock, targetBlock, numShips) => {
    // graph - neighbours
    // if (!pathExistsInWater(game, sourceBlock, targetBlock)) return;
    // fight possible?
    // if no fight, then move ships
};

const pathExistsInWater = (game, sourceGroupId, targetGroupId) => {
    return false;
};

exports.endTurn = endTurn;
exports.beginActionTurn = beginActionTurn;
exports.earnGold = earnGold;
exports.buyCard = buyCard;
exports.placePlayerSoldier = placePlayerSoldier;
exports.placePlayerShip = placePlayerShip;
exports.placePlayerFort = placePlayerFort;
