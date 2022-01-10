const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const new_game = (gameId, playersInfo) => {
    const game = {};
    game.gameId = gameId;
    game.playersInfo = playersInfo;
    game.playersAuth = {};
    for (let player of playersInfo) {
        game.playersAuth[player.id] = {
            joined: false,
            token: uuidv4(),
        };
    }
    game.players = {};
    for (let player of playersInfo) {
        game.players[player.id] = {
            token: game.playersAuth[player.id].token,
            id: player.id,
            name: player.name,
            color: player.color,
            gold: 5,
            prosperity_markers: 0,
            priests: 0,
            philosophers: 0,
        };
    }
    game.numPlayers = game.playersInfo.length;
    game.width = 1000;
    game.height = 700;
    game.block_r = 48;
    game.gold = 100;
    game.prosperity_markers = 16;
    game.territory_markers = 15;
    game.priests = 18;
    game.philosophers = 17;
    game.soldiers = 40;
    game.ships = 40;
    game.boardState = {
        turn: -1,
        blockList: [],
        bids: {},
        ownership: {},
        prosperity_markers_loc: [],
        territory_markers_loc: [],
    };
    return game;
};

const save_game = (game) => {
    const str = JSON.stringify(game, null, 4);

    const fname = "sessions/" + game.gameId + ".json";
    fs.writeFile(fname, str, function (err) {
        if (err) throw err;
        console.log("Saved game " + game.gameId);
    });
};

const get_game = (gameId, res, next) => {
    const fname = "sessions/" + gameId + ".json";
    fs.readFile(fname, "utf8", (err, jsonString) => {
        if (err) {
            console.log("File read failed:", err);
            return;
        }
        res.locals.game = JSON.parse(jsonString);
        next();
    });
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

const get_game_for_player = (game, token) => {
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

exports.new_game = new_game;
exports.save_game = save_game;
exports.get_game = get_game;
exports.find_player_id_by_token = find_player_id_by_token;
exports.find_player_id_by_name = find_player_id_by_name;
exports.get_game_for_player = get_game_for_player;
