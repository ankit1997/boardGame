const { response } = require("express");
const express = require("express");
const {
    new_game,
    save_game,
    get_game,
    find_player_id_by_token,
    find_player_id_by_name,
    get_game_for_player,
} = require("./Game");
const { isEmptyString } = require("./utils");

const app = express();

// load environment variables
require("dotenv").config();

const port = process.env.SERVER_PORT;

const globals = {
    lockedGames: {},
};

// allow options request from any source
app.options("*", (req, res) => {
    // for CORS policy
    res.setHeader("Access-Control-Allow-Origin", process.env.UI_URL); // allow requests from UI only!
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.sendStatus(200).end();
});

app.use(express.json());

app.use((req, res, next) => {
    // Pre-checks and initializations before calling api code

    console.log(req.url);

    // for CORS policy
    res.setHeader("Access-Control-Allow-Origin", process.env.UI_URL); // allow requests from UI only!
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    if (req.method == "OPTIONS") {
        // specifically for CORS preflight request, send 200 status code back
        res.sendStatus(200).end();
        return;
    }

    let gameId = "";
    if (req.body.gameId) {
        gameId = req.body.gameId;
    } else if (req.query.gameId) {
        gameId = req.query.gameId;
    }
    res.locals.gameId = gameId;

    if (req.body.token) {
        res.locals.token = token;
    } else if (req.query.token) {
        res.locals.token = token;
    }

    if (gameId != "" && globals.lockedGames[gameId] == true) {
        res.send({ success: false, message: "Game already locked, try again" });
        return;
    }
    if (gameId != "") {
        globals.lockedGames[gameId] = true;
    }

    if (req.url == "/initializeGame") {
        next();
    } else {
        get_game(gameId, res, next);
    }
});

app.use((req, res, next) => {
    if (req.url != "/initializeGame" && res.locals.game == undefined) {
        globals.lockedGames[req.body.gameId] = false;
        res.send({ success: false, message: "Game not found" });
        return;
    }
    next();
});

app.get("/", (req, res) => {
    res.send("Welcome to the game");
});

const joinGame = (req, res, next) => {
    const name = res.locals.name;
    const token = res.locals.token;
    let playerId = -1;

    if (!isEmptyString(token)) {
        playerId = find_player_id_by_token(res.locals.game, token);
        if (playerId == -1) {
            res.locals.response = { success: false, message: "Invalid token" };
        } else {
            res.locals.game.playersAuth[playerId].joined = true;
        }
    } else {
        playerId = find_player_id_by_name(res.locals.game, name);
        if (playerId == -1) {
            res.locals.response = { success: false, message: "Invalid name" };
        } else if (res.locals.game.playersAuth[playerId].joined == true) {
            res.locals.response = {
                success: false,
                message: "Please use token to join",
            };
        } else {
            res.locals.game.playersAuth[playerId].joined = true;
            res.locals.token = res.locals.game.playersAuth[playerId].token;
        }
    }
    next();
};

const getGameState = (req, res, next) => {
    if (res.locals.response && !response.locals.response.success) {
        next();
    } else {
        res.locals.response = {
            success: true,
            token: res.locals.token,
            game: get_game_for_player(res.locals.game, res.locals.token),
        };
        next();
    }
};

app.post(
    "/initializeGame",
    (req, res, next) => {
        const game = new_game(res.locals.gameId, req.body.playersInfo);
        res.locals.game = game;
        res.locals.token = game.playersAuth[game.playersInfo[0].id].token;
        next();
    },
    joinGame,
    getGameState
);

app.post(
    "/joinGame",
    (req, res, next) => {
        res.locals.name = req.body.name;
        next();
    },
    joinGame,
    getGameState
);

app.get("/game_state", getGameState);

app.get("/player_info", (req, res) => {
    res.send({});
});

app.get("/player_state", (req, res) => {
    res.send({});
});

app.get("/load_creatures", (req, res) => {
    res.send({});
});

app.post("/place_bid", (req, res) => {
    res.send({});
});

app.post("/fight", (req, res) => {
    res.send({});
});

app.use((req, res) => {
    if (res.locals.gameId) {
        globals.lockedGames[res.locals.gameId] = false;
    }
    if (res.locals.response && res.locals.response.success && res.locals.game) {
        save_game(res.locals.game);
    }
    if (res.locals.response) {
        res.send(res.locals.response);
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
