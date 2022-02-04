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
const check_player_owns_creature = (game, playerId, creature_name) => {

    const creature_id = 2; //TO DO ANKIT fetch creature id from creature name
    if(playerId == creatures[creature_id].owner)  //CHECK FOR OWNERSHIP
        return 1;
    else
        return 0;
}
function creature_CHIMERA(playerId, creature_index){
}
function creature_THE_FATES(playerId, creature_index){
}
function creature_GRIFFON(playerId, creature_index){
}
const creature_GIANT = (game, playerId, creature_id)  => {
    
    // pop up player name and building name to destroy.
    //player_bulding_to_be_destroyed;
    // building_to_be_destroyed;
    // TODO ANKIT to fill variable player_bulding_to_be_destroyed and building_to_be_destroyed

    const building_to_be_destroyed = "TEMPLE"
    const player_bulding_to_be_destroyed_id = 2; 
    const creature_index = 1; // TO DO ANKIT Get "Creature index from Creature Id"

    if(!check_player_owns_creature(game,player_bulding_to_be_destroyed_id,'CHIRON'))
    {
        if (building_to_be_destroyed == 'temples')
            game.player[player_bulding_to_be_destroyed_id].temples--;
        if (building_to_be_destroyed == 'fortress')
            game.player[player_bulding_to_be_destroyed_id].forts--;
        if (building_to_be_destroyed == 'ports')
            game.player[player_bulding_to_be_destroyed_id].ports--;
        if (building_to_be_destroyed == 'universities')
            game.player[player_bulding_to_be_destroyed_id].universities--;
        
        game.player[playerId].gold -= max(1, creature[creature_index].position_on_board - game.player[playerId].temples +1);
        game.gold += max(1, creature[creature_index].position_on_board - game.player[playerId].temples +1);
    }
    return;

}

const creature_DRYAD = (game, playerId, creature_index) => {
    //TO DO ANKIT Open a pop up asking for name of player to take priest card from.
    const player_name = "VIBHOR" //FETCH NAME FROM UI
    const player_to_taken_priest_from_id  = 1; //FETCH ID FROM NAME
    
    if (game.player[player_to_taken_priest_from_id].priests > 0)
    {
        game.player[player_to_taken_priest_from_id].priests--;
        game.player[playerId].priests++;
        game.player[playerId].gold -= max(1, game.creature[creature_index]-game.player[playerId].temples);
        game.gold += max(1, game.creature[creature_index]-game.player[playerId].temples);
    }
    return;
}

const creature_SATYR = (game, playerId, creature_index) => {
    
    //TO DO ANKIT Open a pop up asking for name of player to take priest card from.
    const player_name = "VIBHOR" //FETCH NAME FROM UI
    const player_to_taken_philospher_from_id  = 1; //FETCH ID FROM NAME
    
    if(game.player[player_to_taken_philospher_from_id].priests > 0)
    {
            game.player[player_to_taken_philospher_from_id].philosophers--;
            game.player[playerId].philosophers++;
            game.player[playerId].gold -= max(1, game.creature[creature_index]-game.player[playerId].temples);
            game.gold += max(1, game.creature[creature_index]-game.player[playerId].temples);
    }
    return;
}


function creature_HARPY(playerId, creature_index){
}
function creature_PEGASUS(playerId, creature_index){
}
function creature_SIREN(playerId, creature_index){
}
function creature_SPHINX(playerId, creature_index){
}
function creature_SYLPH(playerId, creature_index){
}
function creature_CHIRON(playerId, creature_index){
}
function creature_MEDUSA(playerId, creature_index){
}
function creature_MINOTAUR(playerId, creature_index){
}
function creature_POLYPHEMUS(playerId, creature_index){
}
function creature_THE_KRAKEN(playerId, creature_index){
}


function creature_CYCLOPS(playerId, creature_index)
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
