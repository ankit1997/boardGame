const isEmptyString = (str) => {
    return str == null || str == undefined || str == "";
};

function shuffle(array) {
    // used from stackoverflow
    let currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}
const checkPlayerOwnsCreature = (block, creatureName, creatures) => {

    const creatureId = 2; //TO DO ANKIT fetch creature id from creature name
    if(playerId == creatures[creatureId].owner)  //CHECK FOR OWNERSHIP
        return 1;
    else
        return 0;
}
const isCreatureOnBlock = (block, creature) => {

    return (creature.blockId==block.id);
    
}
function creature_CHIMERA(playerId, creatureIndex){
}
function creature_THE_FATES(playerId, creatureIndex){
}
function creature_GRIFFON(playerId, creatureIndex){
}
const creature_GIANT = (game, playerId, blockId, CplayerId)  => {
    
    // pop up player name and building name to destroy.
    //player_bulding_to_be_destroyed;
    // buildingToBeDestroyed;
    // TODO ANKIT to fill variable player_bulding_to_be_destroyed and buildingToBeDestroyed

    //block.owner = id
    //null check
    const block = game.boardState.board.blocks[blockId];
    
    const buildingToBeDestroyed = buildingOnBlock(block);
    
    const creatureId = 1; // TO DO ANKIT Get "Creature Id"

    const creature = game.creatures[creatureId];

    if(checkPlayerOwnsCreature(block, 'CHIRON', game.creatures) && (isCreatureOnBlock(block, creature))) {
        if (buildingToBeDestroyed == 'temples') {
            game.players[block.owner].temples--;
            block.numTemples--;
        }
        if (buildingToBeDestroyed == 'fortress') {
            game.player[block.owner].forts--;
        }
        if (buildingToBeDestroyed == 'ports') {
            game.player[player_bulding_to_be_destroyed_id].ports--;
        }
        if (buildingToBeDestroyed == 'universities')
            game.player[player_bulding_to_be_destroyed_id].universities--;
        
        game.player[playerId].gold -= max(1, game.creatures[creatureId].position_on_board - game.players[playerId].temples +1);
        game.gold += max(1, game.creatures[creatureIndex].position_on_board - game.players[playerId].temples +1);
    }
    return;

}

const creature_DRYAD = (game, playerId, CplayerId) => {
    
    //CplayerId = PlayerID of player on which creature is called.
    //TO DO ANKIT Open a pop up asking for name of player to take priest card from.
    const creatureId = 1; // TO DO GET CREATURE ID OF DRYAD
    
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
    
    //CplayerId = PlayerID of player on which creature is called.
    //TO DO ANKIT Open a pop up asking for name of player to take priest card from.
    const creatureId = 1; // TO DO GET CREATURE ID OF DRYAD
    
    if (game.player[CplayerId].philosphers > 0)
    {
        game.players[CplayerId].philosphers--;
        game.players[playerId].philosphers++;
        game.players[playerId].gold -= max(1, game.creatures[creatureId].positionOnBoard-game.players[playerId].temples+1);
        game.gold += max(1, game.creatures[creatureId].positionOnBoard-game.players[playerId].temples+1);
    }
    //TODO ANKIT AFTER USAGE DISCARD CARD
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
function creature_CHIRON(playerId, creatureIndex){
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


exports.isEmptyString = isEmptyString;
exports.shuffle = shuffle;
