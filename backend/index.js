const { v4: uuidv4 } = require("uuid");
const { endTurn } = require("./Actions");
const { getGame, getNewGame, groupLand, saveBoard } = require("./Game");
const { authUsingToken, authUsingName } = require("./helper/auth");
const { placeBid } = require("./helper/bidding");
const {
    newLandBlock,
    newSeaBlock,
    updateOwner,
    addSoldier,
    addShip,
    removeSoldier,
    removeShip,
} = require("./helper/block");
const { sendGameObjToPlayers } = require("./helper/comms");
const { io, app, http } = require("./helper/io");

// load environment variables
require("dotenv").config();

const port = process.env.SERVER_PORT;

const earnGold = (game) => {
    for (let playerId in game.players) {
        const earnings = game.boardState.board.blocks
            .filter(
                (block) =>
                    block.owner == playerId && block.numProsperityMarkers > 0
            )
            .map((block) => block.numProsperityMarkers)
            .reduce((a, b) => a + b, 0);
        game.players[playerId].gold += earnings;
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

const verify = (socket) => {
    if (
        socket &&
        socket.userData &&
        socket.userData.id >= 0 &&
        socket.userData.token
    )
        return true;
    return false;
};

io.on("connection", (socket) => {
    socket["userData"] = {};

    socket.on("initialize", (width, height, playersInfo) => {
        const gameId = uuidv4();
        const game = getNewGame(gameId, width, height, playersInfo);
        console.log("Game created with ID = " + gameId);
        socket["userData"]["id"] = playersInfo[0].id;
        socket["userData"]["token"] = game.players[playersInfo[0].id].token;
        authUsingToken(game, game.players[playersInfo[0].id].token, socket);
    });

    socket.on("authenticate", (gameId, name, token) => {
        const game = getGame(gameId);
        if (!authUsingToken(game, token, socket)) {
            authUsingName(game, name, socket);
        }
    });

    socket.on("setup", (gameId, blockId, marker, obj, completeFlag) => {
        if (!verify(socket)) return;
        const game = getGame(gameId);

        if (completeFlag == true && game.boardState.stage == "SETUP") {
            groupLand(game);
            if (obj.save) {
                saveBoard(game.boardState.board, game.playersInfo.length);
            }
            game.boardState.stage = "BIDDING";
            console.log("Completing setup stage for game " + gameId);
            sendGameObjToPlayers(game);
            return;
        }

        let blockIndex = game.boardState.board.blocks.findIndex(
            (b) => b.id == blockId
        );

        if (blockIndex != -1) {
            const block = game.boardState.board.blocks[blockIndex];
            if (marker == "LAND" || marker == "SEA") {
                // mark the block as land/sea block

                game.boardState.board.blocks[blockIndex] =
                    marker == "LAND"
                        ? newLandBlock(block, obj)
                        : newSeaBlock(block, obj);
                sendGameObjToPlayers(game);
            } else if (marker == "PLAYER" && obj.playerId != undefined) {
                // place player marker (ship/soldier) on the board

                const player = game.players[obj.playerId];
                if (player == undefined) return;

                // set the owner of this block
                updateOwner(game, block.id, player.id);

                // add soldiers to the land block
                if (
                    game.boardState.board.blocks[blockIndex].type == "land" &&
                    obj.soldiers != undefined
                ) {
                    for (let i = 0; i < obj.soldiers; i++) {
                        if (obj.soldiers == 1)
                            addSoldier(game, block, player.id);
                        else if (obj.soldiers == 0)
                            removeSoldier(game, block, player.id);
                    }
                }

                // add ships to the sea block
                if (
                    game.boardState.board.blocks[blockIndex].type == "sea" &&
                    obj.ships != undefined
                ) {
                    for (let i = 0; i < obj.ships; i++) {
                        if (obj.ships == 1) addShip(game, block, player.id);
                        else if (obj.ships == 0)
                            removeShip(game, block, player.id);
                    }
                }

                sendGameObjToPlayers(game);
            }
        }
    });

    socket.on("placeBid", (gameId, god, amount) => {
        if (!verify(socket)) return;
        const game = getGame(gameId);
        placeBid(game, god, amount, socket["userData"]["id"]);
    });

    socket.on("action", (gameId, actionObj) => {
        if (!verify(socket)) return;

        const game = getGame(gameId);
        const playerId = socket["userData"]["id"];

        if (game.boardState.stage != "ACTION" || !actionObj) return;
        if (game.boardState.turn != playerId) return;

        if (actionObj.endTurn == true) {
            endTurn(game, playerId);
            return;
        }

        /* 
        
        code @moga
            socket["userData"]["id"] - for user's id
            actionObj = {
                endTurn: boolean,
                soldierBlockId: number,
                shipBlockId: number,
                fortBlockId: number,
                portBlockId: number,
                templeBlockId: number,
                universityBlockId: number,
                metropolitanBlockId: number,
                creature: {
                    // not implemented yet but this will contain creatureId and other fields to perform creature action sent from UI
                }
            }

            Things to consider:
            - add functions in separate files if necessary, don't write all code here in this place (block.js)
            - piece is added in correct block type (e.g. ship in 'sea' only, temple in 'land' only, etc.)
            - user has enough gold to perform operation (although this will be checked at UI too, double-check here also)
            - if metropolitanBlockId is sent (i.e. not undefined), then check that user has all 4 blocks (temple, port, fort, university), 
                and after building metropolitan, remove the count of all 4 blocks

        */
    });

    socket.on("disconnect", () => {
        socket["userData"]["id"] = undefined;
        socket["userData"]["token"] = undefined;
    });
});

http.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
