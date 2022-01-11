const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { shuffle } = require("./utils");

const getNewGame = (gameId, playersInfo) => {
    const game = {};
    const startGold = 5;
    game.gameId = gameId;
    game.playersInfo = playersInfo;
    game.playersAuth = {};
    for (let player of playersInfo) {
        game.playersAuth[player.id] = {
            joined: false,
            token: uuidv4(),
            socketId: undefined,
        };
    }
    game.players = {};
    for (let player of playersInfo) {
        game.players[player.id] = {
            token: game.playersAuth[player.id].token,
            id: player.id,
            name: player.name,
            color: player.color,
            prevBidGod: undefined,
            gold: startGold,
            prosperity_markers: 0,
            priests: 0,
            philosophers: 0,
        };
    }
    game.numPlayers = game.playersInfo.length;
    game.width = 1000;
    game.height = 700;
    game.block_r = 48;
    game.gold = 100 - startGold * playersInfo.length;
    game.prosperity_markers = 16;
    game.territory_markers = 15;
    game.priests = 18;
    game.philosophers = 17;
    game.soldiers = 40;
    game.ships = 40;
    game.boardState = {
        turnOrder: shuffle([...Array(playersInfo.length).keys()]),
        turn: -1,
        blockList: [],
        bids: [
            {
                god: "ATHENA",
                maxBidAmount: undefined,
                maxBidPlayerId: undefined,
            },
            { god: "ARES", maxBidAmount: undefined, maxBidPlayerId: undefined },
            { god: "ZEUS", maxBidAmount: undefined, maxBidPlayerId: undefined },
            {
                god: "POSEIDON",
                maxBidAmount: undefined,
                maxBidPlayerId: undefined,
            },
            {
                god: "APOLLO",
                maxBidAmount: undefined,
                maxBidPlayerId: undefined,
            },
        ],
        ownership: {},
        prosperity_markers_loc: [],
        territory_markers_loc: [],
    };
    game.boardState.turn = game.boardState.turnOrder[0];
    shuffle(game.boardState.bids);

    return game;
};

const saveGame = (game) => {
    const str = JSON.stringify(game, null, 4);

    const fname = "sessions/" + game.gameId + ".json";
    fs.writeFileSync(fname, str);
};

const getGame = (gameId) => {
    const fname = "sessions/" + gameId + ".json";
    return JSON.parse(
        fs.readFileSync(fname, {
            encoding: "utf8",
            flag: "r",
        })
    );
};

const find_player_id_by_token = (game, token) => {
    for (let playerId in game.playersAuth) {
        if (game.playersAuth[playerId].token == token) {
            return playerId;
        }
    }
    return -1;
};

const find_player_id_by_name = (game, name) => {
    for (let player of game.playersInfo) {
        if (player.name == name) {
            return player.id;
        }
    }
    return -1;
};

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

const getPlayerGameObj = (game, token) => {
    let playerId = find_player_id_by_token(game, token);
    if (playerId == -1) {
        return undefined;
    }
    const obj = JSON.parse(JSON.stringify(game));
    delete obj.playersAuth;
    for (let playerId in obj.players) {
        if (game.playersAuth[playerId].token != token) {
            delete obj.players[playerId];
        }
    }
    return obj;
};

exports.getNewGame = getNewGame;
exports.saveGame = saveGame;
exports.getGame = getGame;
exports.find_player_id_by_token = find_player_id_by_token;
exports.find_player_id_by_name = find_player_id_by_name;
exports.getPlayerGameObj = getPlayerGameObj;
exports.findPlayerByName = findPlayerByName;
exports.findPlayerByToken = findPlayerByToken;
