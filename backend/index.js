const express = require("express");
const { v4: uuidv4 } = require("uuid");
const {
    saveGame,
    getGame,
    getPlayerGameObj,
    findPlayerByName,
    findPlayerByToken,
    getNewGame,
} = require("./Game");

// load environment variables
require("dotenv").config();

const port = process.env.SERVER_PORT;
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
    cors: {
        origin: ["http://localhost:4200"],
    },
});

const sendGameObjToPlayer = (game, playerId) => {
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
    saveGame(game);
};

const sendGameObjToPlayers = (game) => {
    // send game object (which might've been updated) to all players of the game
    for (let playerInfo of game.playersInfo) {
        sendGameObjToPlayer(game, playerInfo.id);
    }
};

const sendError = (game, playerId, message) => {
    const auth = game.playersAuth[playerId];
    const socket = io.sockets.sockets.get(auth.socketId);
    if (socket == undefined) {
        return;
    }
    socket.emit("error", message);
};

const authUsingToken = (game, token, socket) => {
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

const biddingsDone = (game) => {
    const turnOrder = [];
    for (let bid of game.boardState.bids) {
        if (bid.maxBidPlayerId == undefined) {
            continue;
        }
        const amountToBePaid =
            bid.god == "APOLLO"
                ? 0
                : Math.max(
                      1,
                      bid.maxBidAmount -
                          game.players[bid.maxBidPlayerId].priests
                  );
        game.players[bid.maxBidPlayerId].gold -= amountToBePaid;
        game.gold += amountToBePaid;
        turnOrder.push(bid.maxBidPlayerId);
    }

    game.boardState.turnOrder = turnOrder;
    game.boardState.tunr = turnOrder[0];
};

const placeBid = (game, god, amount, playerId) => {
    const bid = game.boardState.bids.filter((bid) => bid.god == god)[0];
    if (bid.god == game.players[playerId].prevBidGod) {
        sendError(game, playerId, "Cannot bid again to same God");
        return;
    }
    const outBidPlayerId = bid.maxBidPlayerId;
    const outBidAmount = bid.maxBidAmount;

    if (outBidAmount != undefined && outBidAmount >= amount) {
        sendError(game, playerId, "Bid amount is lower than expected");
        return;
    }

    bid.maxBidAmount = amount;
    bid.maxBidPlayerId = playerId;
    game.players[playerId].prevBidGod = god;

    const allBidsPlaced =
        game.boardState.bids.filter(
            (bid) => bid.maxBidPlayerId >= 0 && bid.maxBidAmount > 0
        ).length == game.numPlayers;
    if (allBidsPlaced) {
        biddingsDone(game);
    } else {
        if (outBidPlayerId != undefined && outBidPlayerId != null) {
            game.boardState.turn = outBidPlayerId;
        } else {
            game.boardState.turn = game.boardState.turnOrder.filter((id) => {
                return game.boardState.bids.every(
                    (bid) => bid.maxBidPlayerId != id
                );
            })[0];
        }
    }
    sendGameObjToPlayers(game);
};

app.get("/player_info", (req, res) => {
    res.send({});
});

app.get("/player_state", (req, res) => {
    res.send({});
});

app.get("/load_creatures", (req, res) => {
    res.send({});
});

app.post("/fight", (req, res) => {
    res.send({});
});

io.on("connection", (socket) => {
    console.log("A user connected");
    socket["userData"] = {};

    socket.on("initialize", (playersInfo) => {
        const gameId = uuidv4();
        const game = getNewGame(gameId, playersInfo);
        console.log("Game created with ID = " + gameId);
        socket["userData"]["id"] = playersInfo[0].id;
        socket["userData"]["token"] = game.players[playersInfo[0].id].token;
        authUsingToken(game, game.players[playersInfo[0].id].token, socket);
    });

    socket.on("authenticate", (gameId, name, token) => {
        const game = getGame(gameId);
        if (!authUsingToken(game, token)) {
            authUsingName(game, name, socket);
        }
    });

    socket.on("placeBid", (gameId, god, amount) => {
        const game = getGame(gameId);
        placeBid(game, god, amount, socket["userData"]["id"]);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

http.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
