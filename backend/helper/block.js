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
    return seaBlock;
};

const getBlocksByGroupId = (game, groupId) => {
    return game.boardState.board.blocks.filter(
        (block) => block.groupId == groupId
    );
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
    block.numSoldiers += 1;
    game.players[playerId].soldiers += 1;
    updateOwner(game, block, playerId);
};

const removeSoldier = (game, block, playerId) => {
    if (block == undefined) return;
    if (block.type != "land") return;
    if (block.numSoldiers == 0) return;
    block.numSoldiers -= 1;
    game.players[playerId].soldiers -= 1;
};

const addShip = (game, block, playerId) => {
    if (block == undefined) return;
    if (block.type != "sea") return;
    if (game.ships <= 0) return;
    block.numShips += 1;
    game.players[playerId].ships += 1;
    updateOwner(game, block, playerId);
};

const removeShip = (game, block, playerId) => {
    if (block == undefined) return;
    if (block.type != "land") return;
    if (block.numShips == 0) return;
    block.numShips -= 1;
    game.players[playerId].ships -= 1;
};

exports.newLandBlock = newLandBlock;
exports.newSeaBlock = newSeaBlock;
exports.updateOwner = updateOwner;
exports.addSoldier = addSoldier;
exports.addShip = addShip;
exports.removeSoldier = removeSoldier;
exports.removeShip = removeShip;
