const fs = require("fs");
const { v4: uuidv4, validate } = require("uuid");
const {
    endTurn,
    earnGold,
    buyCard,
    placePlayerSoldier,
    placePlayerShip,
    placePlayerFort,
    moveSoldier,
} = require("./Actions");
const {
    getGame,
    getNewGame,
    groupLand,
    saveBoard,
    getGamePath,
} = require("./Game");
const { authUsingToken, authUsingName } = require("./helper/auth");
const { placeBid, initializeBidding } = require("./helper/bidding");
const {
    newLandBlock,
    newSeaBlock,
    updateOwner,
    addSoldier,
    addShip,
    removeSoldier,
    removeShip,
} = require("./helper/block");
const {
    sendGameObjToPlayers,
    sendGameObjToPlayer,
    sendInfo,
} = require("./helper/comms");
const { io, http } = require("./helper/io");

// load environment variables
require("dotenv").config();

const port = process.env.SERVER_PORT;

const verify = (socket) => {
    if (
        socket &&
        socket.userData &&
        socket.userData.id >= 0 &&
        socket.userData.token &&
        socket.userData.gameId &&
        fs.existsSync(getGamePath(socket.userData.gameId))
    )
        return true;
    return false;
};

io.on("connection", (socket) => {
    socket["userData"] = {};

    socket.on("initialize", (width, height, playersInfo) => {
        try {
            const gameId = uuidv4();
            const game = getNewGame(gameId, width, height, playersInfo);
            console.log("Game created with ID = " + gameId);
            socket["userData"]["id"] = playersInfo[0].id;
            socket["userData"]["token"] = game.players[playersInfo[0].id].token;
            socket["userData"]["gameId"] = gameId;
            authUsingToken(game, game.players[playersInfo[0].id].token, socket);
            game.logs.push(
                "Game " +
                    gameId +
                    " started (" +
                    playersInfo.length +
                    " players)"
            );
        } catch (err) {
            console.log("Initialize failure");
            console.log(err);
        }
    });

    socket.on("authenticate", (gameId, name, token) => {
        try {
            if (!fs.existsSync(getGamePath(gameId))) {
                return;
            }
            const game = getGame(gameId);
            const success =
                authUsingToken(game, token, socket) ||
                authUsingName(game, name, socket);
            if (success) {
                socket["userData"]["gameId"] = gameId;
            }
        } catch (err) {
            console.log("Auth failure: gameId = " + gameId);
            console.log(err);
        }
    });

    socket.on("setup", (blockId, marker, obj, completeFlag) => {
        try {
            if (!verify(socket)) return;

            const gameId = socket["userData"]["gameId"];
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
                        game.boardState.board.blocks[blockIndex].type ==
                            "land" &&
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
                        game.boardState.board.blocks[blockIndex].type ==
                            "sea" &&
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
        } catch (err) {
            console.log("Setup failure");
            console.log(err);
        }
    });

    socket.on("placeBid", (god, amount) => {
        try {
            if (!verify(socket)) return;
            const gameId = socket["userData"]["gameId"];
            const game = getGame(gameId);
            placeBid(game, god, amount, socket["userData"]["id"]);
        } catch (err) {
            console.log("PlaceBid failure");
            console.log(err);
        }
    });

    socket.on("action", (actionObj) => {
        try {
            console.log("action");
            if (!verify(socket)) return;
            const gameId = socket["userData"]["gameId"];
            const game = getGame(gameId);
            const playerId = socket["userData"]["id"];

            if (game.boardState.stage != "ACTION" || !actionObj) return;
            if (game.boardState.turn != playerId) return;

            let validAction = false;
            if (actionObj.endTurn == true) {
                const turnEnded = endTurn(game, playerId);
                if (turnEnded) {
                    earnGold(game, playerId);
                }
                if (
                    turnEnded &&
                    game.boardState.nextTurnOrder.length ==
                        game.boardState.turnOrder.length &&
                    game.boardState.turnOrder.length != 0
                ) {
                    initializeBidding(game);
                }
                validAction = true;
            } else if (actionObj.cardName && actionObj.cardName.length > 0) {
                buyCard(game, playerId, actionObj.cardName);
                validAction = true;
            } else if (actionObj.soldierBlockId >= 0) {
                const block =
                    game.boardState.board.blocks[actionObj.soldierBlockId];
                placePlayerSoldier(game, playerId, block);
                validAction = true;
            } else if (actionObj.shipBlockId >= 0) {
                const block =
                    game.boardState.board.blocks[actionObj.shipBlockId];
                placePlayerShip(game, playerId, block);
                validAction = true;
            } else if (actionObj.fortBlockId >= 0) {
                const block =
                    game.boardState.board.blocks[actionObj.fortBlockId];
                placePlayerFort(game, playerId, block);
                validAction = true;
            } else if (actionObj.templeBlockId >= 0) {
                placePlayerTemple(game, playerId, actionObj.templeBlockId);
                validAction = true;
            } else if (actionObj.portBlockId >= 0) {
                placePlayerPort(game, playerId, actionObj.portBlockId);
                validAction = true;
            } else if (
                actionObj.move &&
                actionObj.move.sourceBlockId >= 0 &&
                actionObj.move.targetBlockId >= 0 &&
                actionObj.move.numSoldiers > 0
            ) {
                moveSoldier(
                    game,
                    playerId,
                    actionObj.move.sourceBlockId,
                    actionObj.move.targetBlockId,
                    actionObj.move.numSoldiers
                );
                validAction = true;
            }

            if (validAction) {
                sendGameObjToPlayers(game);
            }
        } catch (err) {
            console.log("Action failure");
            console.log(err);
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

    socket.on("fight", (blockId, players, dice) => {
        try {
            if (!verify(socket)) return;
            const playerId = socket["userData"]["id"];
            const gameId = socket["userData"]["gameId"];
            const game = getGame(gameId);
            if (
                blockId >= 0 &&
                blockId < game.boardState.board.blocks.length &&
                players &&
                players.length == 2 &&
                dice == -1
            ) {
                if (
                    players[0] >= 0 &&
                    players[0] < game.numPlayers &&
                    players[1] >= 0 &&
                    players[1] < game.numPlayers &&
                    players[0] !== players[1]
                ) {
                    game.boardState.fight.blockId = blockId;
                    game.boardState.fight.players = players;
                    sendGameObjToPlayers(game);
                    const name0 = game.players[players[0]].name;
                    const name1 = game.players[players[1]].name;
                    sendInfo(
                        game,
                        undefined,
                        "Fight between " + name0 + " and " + name1
                    );
                }
            } else if (dice >= 0 && dice <= 3) {
                if (players[0] == playerId) {
                    game.boardState.fight.dice[0] = dice;
                } else if (players[1] == playerId) {
                    game.boardState.fight.dice[1] = dice;
                } else {
                    return;
                }

                // TODO: Moga - add fight logic here if both dice results are received

                sendGameObjToPlayers(game);
            }
        } catch (err) {
            console.log("fight failure");
            console.log(err);
        }
    });

    socket.on("disconnect", () => {
        try {
            socket["userData"]["id"] = undefined;
            socket["userData"]["token"] = undefined;
            socket["userData"]["gameId"] = undefined;
        } catch (err) {
            console.log("Disconnect failure");
            console.log(err);
        }
    });
});

http.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
