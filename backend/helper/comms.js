const { saveGame } = require("../Game");
const { io } = require("./io");
const { findPlayerByToken } = require("./player");

const getPlayerGameObj = (game, token) => {
    // Get game object that can be sent to player with given token. This shadows private data of other players.
    let player = findPlayerByToken(game, token);
    if (player == undefined) {
        return undefined;
    }
    const obj = JSON.parse(JSON.stringify(game));
    obj.logs = obj.logs.slice(-50);
    delete obj.playersAuth;
    for (let playerId in obj.players) {
        if (game.playersAuth[playerId].token != token) {
            delete obj.players[playerId];
        }
    }
    return obj;
};

const sendGameObjToPlayer = (game, playerId, dontSave = false) => {
    // send game object to player with given id
    const auth = game.playersAuth[playerId];
    if (auth.socketId == undefined) {
        return;
    }
    const socket = io.sockets.sockets.get(auth.socketId);
    if (socket == undefined) {
        return;
    }
    const gameObj = getPlayerGameObj(game, auth.token);
    socket.emit("boardState", gameObj);
    if (!dontSave) {
        saveGame(game);
    }
};

const sendGameObjToPlayers = (game) => {
    // send game object (which might've been updated) to all players of the game
    for (let playerInfo of game.playersInfo) {
        sendGameObjToPlayer(game, playerInfo.id, true);
    }
    saveGame(game);
};

const sendError = (game, playerId, message) => {
    for (let playerInfo of game.playersInfo) {
        if (playerId != undefined && playerInfo.id != playerId) {
            continue;
        }
        const auth = game.playersAuth[playerInfo.id];
        if (auth.socketId == undefined) {
            continue;
        }
        const socket = io.sockets.sockets.get(auth.socketId);
        if (socket == undefined) {
            continue;
        }
        socket.emit("error", message);
    }
};

const sendInfo = (game, playerId, message) => {
    for (let playerInfo of game.playersInfo) {
        if (playerId != undefined && playerInfo.id != playerId) {
            continue;
        }
        const auth = game.playersAuth[playerInfo.id];
        if (auth.socketId == undefined) {
            continue;
        }
        const socket = io.sockets.sockets.get(auth.socketId);
        if (socket == undefined) {
            continue;
        }
        socket.emit("info", message);
    }
};

exports.sendGameObjToPlayer = sendGameObjToPlayer;
exports.sendGameObjToPlayers = sendGameObjToPlayers;
exports.sendError = sendError;
exports.sendInfo = sendInfo;
