const { buildingOnBlock } = require("./block");


const isCreatureOnBlock = (block, creature) => {
    return (creature.blockId==block.id);
}

const isCreatureOnIsland = (block, creature) => {
    return (creature.blockgroupId == block.groupId);
}

const findCreatureIdByName = (game, creatureName) => {
    for (let creatureId in game.creatures) {
        if (game.creatures[creatureId].name == creatureName) {
            return creatureId;
        }
    }
    return undefined;
}
const checkForChiron = (game, block) => {
    
    const chironId = findCreatureIdByName(game, "CHIRON");
    const creature = game.creatures[chironId];
    return (isCreatureOnIsland(block, creature));
        
}

const creature_GIANT = (game, playerId, blockId)  => {
    
    
    const block = game.boardState.board.blocks[blockId];
    
    const buildingToBeDestroyed = buildingOnBlock(block);
    
    const creautureId = findCreatureIdByName(game, "GIANT");

    if(!checkForChiron(game, block)) {
        
        if (buildingToBeDestroyed == 'temples') {
            game.players[block.owner].temples--;
            block.numTemples--;
            game.temples++;
        }
        if (buildingToBeDestroyed == 'forts') {
            game.players[block.owner].forts--;
            block.numForts--;
            game.forts++;
        }
        if (buildingToBeDestroyed == 'ports') {
            game.players[block.owner].ports--;
            block.numPorts--;
            game.ports++;
        }
        if (buildingToBeDestroyed == 'universities'){
            game.players[block.owner].universities--;
            block.numUniversities--;
            game.universities++;
        }
        game.players[playerId].gold -= max(1, game.creatures[creautureId].positionOnBboard - game.players[playerId].temples +1);
        game.gold += max(1, game.creatures[creautureId].positionOnBoard - game.players[playerId].temples +1);
    }
    return;

}

const creature_DRYAD = (game, playerId, CplayerId) => {
    
    //CplayerId = PlayerID of player on which creature is called.

    const creatureId = findCreatureIdByName(game, "DRYAD")
    
    if (game.player[CplayerId].priests > 0)
    {
        game.players[CplayerId].priests--;
        game.players[playerId].priests++;
        game.players[playerId].gold -= max(1, game.creatures[creatureId].positionOnBoard-game.players[playerId].temples+1);
        game.gold += max(1, game.creatures[creatureId].positionOnBoard-game.players[playerId].temples+1);
    }
    //TODO ANKIT AFTER USAGE DISCARD CARD
}

const creature_SATYR = (game, playerId, CplayerId) => {
    
    const creatureId = findCreatureIdByName(game, "SATYR");
    
    if (game.player[CplayerId].philosphers > 0)
    {
        game.players[CplayerId].philosphers--;
        game.players[playerId].philosphers++;
        game.players[playerId].gold -= max(1, game.creatures[creatureId].positionOnBoard-game.players[playerId].temples+1);
        game.gold += max(1, game.creatures[creatureId].positionOnBoard-game.players[playerId].temples+1);
    }
    //TODO ANKIT AFTER USAGE DISCARD CARD
}
const creature_GRIFFON = (game, playerId, CplayerId) => {

    const creatureId = findCreatureIdByName(game, "GRIFFON");

    if(game.players[CplayerId].gold > 0)
    {
        game.players[playerId].gold += game.players[CplayerId].gold/2;
        game.players[CplayerId].gold -= game.players[CplayerId].gold/2;
        game.players[playerId].gold -= max(1, game.creatures[creatureId].positionOnBoard-game.players[playerId].temples+1);
        game.gold += max(1, game.creatures[creatureId].positionOnBoard-game.players[playerId].temples+1);
        //TO DO ANKIT SHOW CPLAYER GOLD TO ALL
    }
}

const creature_CHIRON = (game, blockId) => {

    const creatureId = findCreatureIdByName(game, "CHIRON");

    const block = game.boardState.board.blocks[blockId];
    const playerId = block.owner;

    //OWNER UPDATED
    game.creatures[creatureId].block = blockId;
    game.creatures[creatureId].groupBlockId = block.groupId;

    game.players[playerId].gold -= max(1, game.creatures[creatureId].positionOnBoard-game.players[playerId].temples+1);
    game.gold += max(1, game.creatures[creatureId].positionOnBoard-game.players[playerId].temples+1);

    //TO DO ANKIT GAME RULES SAY CREATURES CAN BE OWNED ONLY FOR 1 TURN, BUT AS PER LAST GAME PLAYED BY US, ONCE OWNED, 
    //MEANS ALWAYS OWNED, KEEPING THAT WAY ONLY.
}


function creature_THE_FATES(playerId, creatureIndex){
}
function creature_HARPY(playerId, creatureIndex){
}
function creature_PEGASUS(playerId, creatureIndex){
}
function creature_SIREN(playerId, creatureIndex){
}
function creature_SPHINX(playerId, creatureIndex){
}
function creature_SYLPH(playerId, creatureIndex){
}
function creature_CHIMERA(playerId, creatureIndex){
}
function creature_MEDUSA(playerId, creatureIndex){
}
function creature_MINOTAUR(playerId, creatureIndex){
}
function creature_POLYPHEMUS(playerId, creatureIndex){
}
function creature_THE_KRAKEN(playerId, creatureIndex){
}

function creature_CYCLOPS(playerId, creatureIndex)
{
    /*
    //pop up or drop down box for replace a building with another. 
    old_building_to_replace;
    new_building_to_construct;
    if(old_building_to_replace == "temples" && player[playerId].temples > 0)
    {
        player[playerId].temples--
        player.
    }
    */


}
