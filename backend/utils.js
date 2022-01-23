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

function creature_CHIMERA(playerId, creature_index){
}
function creature_THE_FATES(playerId, creature_index){
}
function creature_GRIFFON(playerId, creature_index){
}
function creature_GIANT(playerId, creature_index){
    
    /*
    // pop up player name and building name to destroy.
    player_bulding_to_be_destroyed;
    building_to_be_destroyed;
    if(!check_player_owns_creature(player_bulding_to_be_destroyed,'CHIRON'))
    {
        if building_to_be_destroyed == 'temples'
            player_bulding_to_be_destroyed.temples--;
        if building_to_be_destroyed == 'fortress'
            player_bulding_to_be_destroyed.fortress--;
        if building_to_be_destroyed == 'ports'
            player_bulding_to_be_destroyed.ports--;
        if building_to_be_destroyed == 'universities'
            player_bulding_to_be_destroyed.universities--;
    }
    */

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

function creature_DRYAD(playerId, creature_index)
{
    //Open a pop up asking for name of player to take priest card from.
    
    /*player_to_taken_priest_from = findPlayerByName(name)
    
    if(findPlayerByName(name) != undefined)
    {
        if (player_to_taken_priest_from.priests > 0)
        {
            player[playerId].gold -= max(1, game.cost_of_creature[creature_index]-player.temples)
            player_to_taken_priest_from.priests--;
            player[playerId].priests++;
        }
    }
    */
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
function creature_SATYR(playerId, creature_index)
{
    /*//Open a pop up asking for name of player to take priest card from.
    
    player_to_taken_philospher_from = findPlayerByName(name)
    
    if(findPlayerByName(name) != undefined)
    {
        if (player_to_taken_philospher_from.philosophers > 0)
        {   
            player[playerId].gold -= max(1, game.cost_of_creature[creature_index]-player.temples)
            player_to_taken_philospher_from.philosophers--;
            player[playerId].philosophers++;
        }
    }*/

}


exports.isEmptyString = isEmptyString;
exports.shuffle = shuffle;
