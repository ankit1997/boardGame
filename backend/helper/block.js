const newLandBlock = (block, obj) => {
    const landBlock = {};
    landBlock.type = "land";
    landBlock.id = block.id;
    landBlock.owner = block.owner;
    landBlock.x = block.x;
    landBlock.y = block.y;
    landBlock.r = block.r;
    landBlock.numProsperityMarkers = 0; // will be populated during grouping of land
    landBlock.numForts = 0;
    landBlock.numPorts = 0;
    landBlock.numUniversities = 0;
    landBlock.numTemples = 0;
    landBlock.numSoldiers = 0;
    landBlock.groupId = undefined;
    landBlock.groupSize = undefined;
    landBlock.neighbours = [];
    return landBlock;
};

const newSeaBlock = (block, obj) => {
    const seaBlock = {};
    seaBlock.type = "sea";
    seaBlock.id = block.id;
    seaBlock.owner = block.owner;
    seaBlock.x = block.x;
    seaBlock.y = block.y;
    seaBlock.r = block.r;
    seaBlock.numShips = block.numShips;
    seaBlock.numProsperityMarkers = obj.numProsperityMarkers;
    seaBlock.neighbours = [];
    return seaBlock;
};

const getBlocksByGroupId = (game, groupId) => {
    return game.boardState.board.blocks.filter(
        (block) => block.groupId == groupId
    );
};

const getGroupBlocksByBlockId = (game, blockId) => {
    const groupId = game.boardState.board.blocks[blockId].groupId;
    if (groupId == undefined) return;
    return getBlocksByGroupId(game, groupId);
};

const updateOwner = (game, block, playerId) => {
    // update the owner of a block. if the block is part of a group, change owners of all group blocks
    if (block == undefined) return;
    if (block.groupId == undefined) {
        block.owner = playerId;
    } else {
        const groupBlocks = getBlocksByGroupId(game, block.groupId);
        for (let block of groupBlocks) {
            block.owner = playerId;
        }
    }
};

const addSoldier = (game, block, playerId) => {
    if (block == undefined) return;
    if (block.type != "land") return;
    if (game.soldiers <= 0) return;
    console.log("Adding soldier at " + block.id);
    block.numSoldiers += 1;
    game.players[playerId].soldiers += 1;
    game.players[playerId].soldiersAdded += 1;
    updateOwner(game, block, playerId);
};

const removeSoldier = (game, block, playerId) => {
    if (block == undefined) return;
    if (block.type != "land") return;
    if (block.numSoldiers == 0) return;
    console.log("Removing soldier from " + block.id);
    block.numSoldiers -= 1;
    game.players[playerId].soldiers -= 1;
};

const addShip = (game, block, playerId) => {
    if (block == undefined) return;
    if (block.type != "sea") return;
    if (game.ships <= 0) return;
    console.log("Adding ship at " + block.id);
    block.numShips += 1;
    game.players[playerId].ships += 1;
    game.players[playerId].shipsAdded += 1;
    updateOwner(game, block, playerId);
};

const removeShip = (game, block, playerId) => {
    if (block == undefined) return;
    if (block.type != "land") return;
    if (block.numShips == 0) return;
    console.log("Removing ship from " + block.id);
    block.numShips -= 1;
    game.players[playerId].ships -= 1;
};

const addFort = (game, block, playerId) => {
    if (block == undefined) return;
    if (block.type != "land") return;
    if (game.forts <= 0) return;
    block.numForts += 1;
    game.players[playerId].forts += 1;
    updateOwner(game, block, playerId);
};

const addTemple = (game, block, playerId) => {
    if (block == undefined) return;
    if (block.type != "land") return;
    if (game.temples <= 0) return;
    block.numTemples += 1;
    game.players[playerId].temples += 1;
    updateOwner(game, block, playerId);
};

const addPort = (game, block, playerId) => {
    if (block == undefined) return;
    if (block.type != "land") return;
    if (game.ports <= 0) return;
    block.numPorts += 1;
    game.players[playerId].ports += 1;
    updateOwner(game, block, playerId);
};

const addUniversity = (game, block, playerId) => {
    if (block == undefined) return;
    if (block.type != "land") return;
    if (game.universities <= 0) return;
    block.numUniversities += 1;
    game.players[playerId].universities += 1;
    updateOwner(game, block, playerId);
};

const buildingOnBlock = (block) => {

    if(block.numTemples > 0)
        return "temples";
    if(block.numForts > 0)
        return "forts";
    if(block.numPorts > 0)
        return "ports";
    if(block.numUniversities > 0)
        return "universities";
}

exports.newLandBlock = newLandBlock;
exports.newSeaBlock = newSeaBlock;
exports.updateOwner = updateOwner;
exports.addSoldier = addSoldier;
exports.addShip = addShip;
exports.removeSoldier = removeSoldier;
exports.removeShip = removeShip;
exports.buildingOnBlock = buildingOnBlock;
exports.getBlocksByGroupId = getBlocksByGroupId;
exports.getGroupBlocksByBlockId = getGroupBlocksByBlockId;
