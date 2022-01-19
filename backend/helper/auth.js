const { sendGameObjToPlayer, sendError } = require("./comms");
const { findPlayerByName, findPlayerByToken } = require("./player");

const authUsingToken = (game, token, socket) => {
    if (token == undefined || token == null || token == "") {
        return false;
    }
    const player = findPlayerByToken(game, token);
    if (player == undefined) {
        return false;
    }
    game.playersAuth[player.id].joined = true;
    game.playersAuth[player.id].socketId = socket.id;
    socket["userData"]["id"] = player.id;
    socket["userData"]["token"] = game.playersAuth[player.id].token;
    sendGameObjToPlayer(game, player.id);
    return true;
};

const authUsingName = (game, name, socket) => {
    if (name == undefined || name == null || name == "") {
        return false;
    }
    const player = findPlayerByName(game, name);
    if (player == undefined) {
        return false;
    }
    if (game.playersAuth[player.id].joined == true) {
        sendError(game, player.id, "Join using token");
        return false;
    }
    game.playersAuth[player.id].joined = true;
    game.playersAuth[player.id].socketId = socket.id;
    socket["userData"]["id"] = player.id;
    socket["userData"]["token"] = game.playersAuth[player.id].token;
    sendGameObjToPlayer(game, player.id);
    return true;
};

exports.authUsingToken = authUsingToken;
exports.authUsingName = authUsingName;
