const {
    addSoldier,
    addShip,
    getBlocksByGroupId,
    removeSoldier,
} = require("./helper/block");
const { sendError } = require("./helper/comms");

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
            game.players[playerId].name +
                " given " +
                earnings +
                " coins for prosperity markers"
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
    if (block.type != "land" || block.owner !== playerId) return;

    if (game.players[playerId].soldiersAdded > 0) {
        if (
            game.players[playerId].gold < game.players[playerId].soldiersAdded
        ) {
            sendError(game, playerId, "Not enough gold");
            return;
        }
    }

    addSoldier(game, block, playerId);
    if (game.players[playerId].soldiersAdded > 1) {
        game.players[playerId].gold -= game.players[playerId].soldiersAdded;
        game.gold += game.players[playerId].soldiersAdded;
    }
};

const placePlayerShip = (game, playerId, block) => {
    if (block.type != "sea") return;

    // check if ship can be placed on `block`
    let validPlacement = false; // check if block is in the surrounding sea from a controlled island
    for (let neighId of block.neighbours) {
        let neigh = game.boardState.board.blocks[neighId];
        if (
            neigh &&
            neigh.type == "land" &&
            neigh.owner === playerId &&
            (block.owner === undefined || block.owner === playerId)
        ) {
            validPlacement = true;
            break;
        }
    }

    if (!validPlacement) {
        sendError(game, playerId, "You cannot place ship here");
        return;
    }

    if (game.players[playerId].shipsAdded > 0) {
        if (
            game.players[playerId].gold <
            game.players[playerId].shipsAdded - 1
        ) {
            sendError(game, playerId, "Not enough gold");
            return;
        }
    }

    addShip(game, block, playerId);
    if (game.players[playerId].shipsAdded > 1) {
        game.players[playerId].gold -= game.players[playerId].shipsAdded - 1;
        game.gold += game.players[playerId].shipsAdded - 1;
    }

    console.log("afterx2: " + game.players[playerId].ships);
};

const placePlayerFort = (game, playerId, block) => {
    addFort(game, block, playerId);
    const player = game.players[playerId];
    player.gold -= 2;
    game.gold += 2;
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
};

const moveSoldier = (
    game,
    playerId,
    sourceBlockId,
    targetBlockId,
    numSoldiers
) => {
    const sourceBlock = game.boardState.board.blocks[sourceBlockId];
    const targetBlock = game.boardState.board.blocks[targetBlockId];

    const sourceGroupId = sourceBlock.groupId;
    const targetGroupId = targetBlock.groupId;

    if (
        sourceGroupId == targetGroupId ||
        sourceBlock.type != "land" ||
        targetBlock.type != "land"
    ) {
        return;
    }

    const islandSoldiersCount = getBlocksByGroupId(game, sourceGroupId).reduce(
        (a, b) => a.numSoldiers + b.numSoldiers,
        0
    );
    if (islandSoldiersCount < numSoldiers) {
        sendError(game, playerId, "Not enough soldiers on the island to move");
        return;
    }

    // check if path exists between islands
    if (
        !_pathExistsBetweenIslands(game, playerId, sourceGroupId, targetGroupId)
    ) {
        return;
    }

    // check if target is occupied by another player
    if (targetBlock.owner != undefined && targetBlock.owner != playerId) {
        game.boardState.fight["blockId"] = targetBlock;
        game.boardState.fight["players"] = [playerId, targetBlock.owner];
        return;
    }

    // if all validations passed, move soldiers
    while (numSoldiers-- > 0) {
        removeSoldier(game, sourceBlock, playerId);
        addSoldier(game, sourceBlock, playerId);
    }
};

const _pathExistsBetweenIslands = (
    game,
    playerId,
    sourceGroupId,
    targetGroupId
) => {
    if (sourceGroupId === targetGroupId) return true;

    const sourceGroupBlocks = game.boardState.board.blocks.filter(
        (block) => block.groupId == sourceGroupId
    );

    const targetGroupBlockIds = game.boardState.board.blocks
        .filter((block) => block.groupId == targetGroupId)
        .map((block) => block.id);

    // bfs for every source block to reach any target block
    for (let sourceBlock of sourceGroupBlocks) {
        const visited = new Set();
        const queue = [];
        queue.push(sourceBlock);
        while (queue.length > 0) {
            let size = queue.length;
            while (size-- > 0) {
                let block = queue.shift();
                visited.add(block.id);
                for (let neighId of block.neighbours) {
                    const neigh = game.boardState.board.blocks[neighId];
                    if (targetGroupBlockIds.includes(neighId)) return true;
                    if (visited.has(neighId)) continue;
                    if (
                        neigh.type !== "sea" ||
                        neigh.owner !== playerId ||
                        neigh.numShips <= 0
                    )
                        continue;
                    queue.push(neigh);
                }
            }
        }
    }

    return false;
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
exports.moveSoldier = moveSoldier;
