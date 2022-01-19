const findPlayerByName = (game, name) => {
    for (let playerId in game.players) {
        const player = game.players[playerId];
        if (player.name == name) {
            return player;
        }
    }
    return undefined;
};

const findPlayerByToken = (game, token) => {
    for (let playerId in game.players) {
        const player = game.players[playerId];
        if (player.token == token) {
            return player;
        }
    }
    return undefined;
};

const findPlayerByColor = (game, color) => {
    for (let playerId in game.players) {
        const player = game.players[playerId];
        if (player.color.toUpperCase() == color.toUpperCase()) {
            return player;
        }
    }
    return undefined;
};

exports.findPlayerByName = findPlayerByName;
exports.findPlayerByToken = findPlayerByToken;
exports.findPlayerByColor = findPlayerByColor;
