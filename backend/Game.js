const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { shuffle } = require("./utils");

const isInsideGameArea = (x, y, h, k, r) => {
    // checks if a point (x, y) is inside playing area ellipse (centered at (h, k))
    const theta = Math.atan2(y - k, x - h);
    x += r * Math.cos(theta);
    y += r * Math.sin(theta);
    return (
        Math.pow(x - h, 2) / Math.pow(h, 2) +
            Math.pow(y - k, 2) / Math.pow(k, 2) <=
        1
    );
};

const setupBoard = (width, height, r) => {
    const board = {};
    board["width"] = width;
    board["height"] = height;
    board["r"] = r;
    board["ellipse"] = {
        x: width / 2,
        width: width / 2 - 10,
        y: height / 2,
        height: height / 2 - 10,
    };
    board["blocks"] = [];

    // draw hexagons of sea blocks
    let s = 0;
    let id = 0;
    let vjump = r * Math.cos(Math.PI / 6);
    let hjump = r * Math.sin(Math.PI / 6);
    for (let y = r; y < height; y += vjump, s++) {
        for (
            let x = width / 2 + (s % 2 == 0 ? 0 : r + hjump);
            x < width;
            x += 3 * r
        ) {
            if (!isInsideGameArea(x, y, board.ellipse.x, board.ellipse.y, r)) {
                break;
            }
            const seaBlock = {
                id: id++,
                owner: undefined,
                x: x,
                y: y,
                r: r,
                numShips: 1,
                numProsperityMarkers: 0,
                type: "sea",
            };
            board.blocks.push(seaBlock);
        }
        for (
            let x = width / 2 - (s % 2 == 0 ? 3 * r : r + hjump);
            x >= 0;
            x -= 3 * r
        ) {
            if (!isInsideGameArea(x, y, board.ellipse.x, board.ellipse.y, r)) {
                break;
            }
            const seaBlock = {
                id: id++,
                owner: undefined,
                x: x,
                y: y,
                r: r,
                numShips: 1,
                numProsperityMarkers: 0,
                type: "sea",
            };
            board.blocks.push(seaBlock);
        }
    }

    return board;
};

const groupLand = (game) => {
    const landBlocks = game.boardState.board.blocks.filter(
        (block) => block.type == "land"
    );
    const n = landBlocks.length;
    if (n == 0) return;

    const unitDistance = 3 * landBlocks[0].r * landBlocks[0].r;
    const findConnected = (i, dmat, connectedBlocks) => {
        if (connectedBlocks.has(i)) return;
        connectedBlocks.add(i);
        for (let j = 0; j < dmat.length; j++) {
            if (dmat[i][j] < 1.5 * unitDistance) {
                findConnected(j, dmat, connectedBlocks);
            }
        }
    };

    const distanceMatrix = [];
    for (let i = 0; i < n; i++) {
        distanceMatrix[i] = [];
        for (let j = 0; j < n; j++) {
            const d =
                Math.pow(landBlocks[i].x - landBlocks[j].x, 2) +
                Math.pow(landBlocks[i].y - landBlocks[j].y, 2);
            distanceMatrix[i].push(d);
        }
    }

    const visited = new Set();
    let groupId = 0;
    for (let i = 0; i < n && visited.size < n; i++) {
        if (visited.has(i)) continue;
        const connectedBlocks = new Set();
        findConnected(i, distanceMatrix, connectedBlocks);
        const connectedBlocksArray = Array.from(connectedBlocks);
        connectedBlocksArray.forEach((item) => visited.add(item));
        connectedBlocksArray.forEach((idx, j) => {
            landBlocks[idx].groupId = groupId;
            landBlocks[idx].groupSize = connectedBlocksArray.length;
            if (landBlocks[idx].groupSize == 1) {
                landBlocks[idx].numProsperityMarkers = 2;
            } else if (landBlocks[idx].groupSize == 2 && j == 0) {
                landBlocks[idx].numProsperityMarkers = 1;
            } else {
                landBlocks[idx].numProsperityMarkers = 0;
            }
        });
        groupId++;
    }
};

const getNewGame = (gameId, width, height, playersInfo) => {
    const game = {};
    const startGold = 5;

    game.width = width;
    game.height = height;
    game.block_r = 48;

    const fpath = "boards/board" + playersInfo.length + ".json";
    let board = undefined;
    if (fs.existsSync(fpath)) {
        board = JSON.parse(
            fs.readFileSync(fpath, {
                encoding: "utf8",
                flag: "r",
            })
        );
        game.width = board.width;
        game.height = board.height;
        game.block_r = board.r;
    }

    game.gameId = gameId;
    game.playersInfo = playersInfo;
    game.creator = playersInfo[0].id;
    game.playersAuth = {};
    for (let player of playersInfo) {
        game.playersAuth[player.id] = {
            joined: false,
            token: player.name, // TODO: change this to uuidv4() after testing is done
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
            gold: startGold,
            prosperity_markers: 0,
            priests: 0,
            philosophers: 0,
            dice: 0,
            soldiers: 0,
            ships: 0,
            temples: 0,
            universities: 0,
            ports: 0,
            fortress: 0,
            metropolitan: 0,
            creatures: [],
            // below are stuff added in current user turn
            prevBidGod: undefined,
            soldiersAdded: 0,
            shipsAdded: 0,
            portsAdded: 0,
            fortressAdded: 0,
            priestsAdded: 0,
            philposphersAdded: 0,
            universitiesAdded: 0,
            templesAdded: 0,
            metropolitansAdded: 0,
        };
    }
    game.numPlayers = game.playersInfo.length;
    game.gold = 100 - startGold * playersInfo.length;
    game.prosperity_markers = 16;
    game.territory_markers = 15;
    game.priests = 18;
    game.philosophers = 17;
    game.soldiers = 40;
    game.fortress = 10;
    game.temples = 10;
    game.ports = 10;
    game.universities = 10;
    game.metropolitan = 10;
    game.ships = 40;
    game.creatures_pile = [
        "CHIMERA",
        "CYCLOPS",
        "DRYAD",
        "THE_FATES",
        "GIANT",
        "GRIFFON",
        "HARPY",
        "PEGASUS",
        "SATYR",
        "SIREN",
        "SPHINX",
        "SYLPH",
        "CHIRON",
        "MEDUSA",
        "MINOTAUR",
        "POLYPHEMUS",
        "THE_KRAKEN",
    ];
    game.creatures_open = {};
    game.boardState = {
        stage: "SETUP", // possible values are 'SETUP', 'BIDDING', 'ACTION'
        turnOrder: shuffle([...Array(playersInfo.length).keys()]),
        nextTurnOrder: [],
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
        temple_building_loc: [],
        ports_building_loc: [],
        fortress_building_loc: [],
        universities_building_loc: [],
        board:
            board == undefined
                ? setupBoard(game.width, game.height, game.block_r)
                : board,
    };
    game.boardState.turn = game.boardState.turnOrder[0];
    game.logs = [];

    shuffle(game.boardState.bids);
    groupLand(game);

    return game;
};

const saveBoard = (board, numPlayers) => {
    const fpath = "boards/board" + numPlayers + ".json";
    const str = JSON.stringify(board, null, 2);
    fs.writeFileSync(fpath, str);
};

const saveGame = (game) => {
    const str = JSON.stringify(game, null, 2);
    const fname = getGamePath(game.gameId);
    fs.writeFileSync(fname, str);
};

const getGame = (gameId) => {
    const fname = getGamePath(gameId);
    return JSON.parse(
        fs.readFileSync(fname, {
            encoding: "utf8",
            flag: "r",
        })
    );
};

const getGamePath = (gameId) => {
    return "sessions/" + gameId + ".json";
};

exports.groupLand = groupLand;
exports.getNewGame = getNewGame;
exports.saveBoard = saveBoard;
exports.saveGame = saveGame;
exports.getGame = getGame;
exports.getGamePath = getGamePath;
