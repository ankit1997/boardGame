const endTurn = (game, playerId) => {
    if (game.boardState.turn != playerId) {
        return false;
    }

    game.logs.push(game.players[playerId].name + " action turn completed");

    const currentTurnInd = game.boardState.turnOrder.findIndex(
        (id) => id == playerId
    );
    if (currentTurnInd == -1) return false;

    if (!game.boardState.nextTurnOrder) {
        game.boardState.nextTurnOrder = [];
    }

    game.boardState.nextTurnOrder.push(playerId);

    if (currentTurnInd != game.boardState.turnOrder.length - 1) {
        game.boardState.turn = game.boardState.turnOrder[currentTurnInd + 1];
        beginActionTurn(game, game.boardState.turn);
    }

    return true;
};

const beginActionTurn = (game, playerId) => {
    if (game.boardState.stage != "ACTION") return;

    switch (game.players[playerId].prevBidGod) {
        case "ZEUS":
            if (game.priests > 0) {
                game.priests--;
                game.players[playerId].priests++;
                game.logs.push(
                    "[ZEUS] Priest card given to " + game.players[playerId].name
                );
            }
            break;
        case "ATHENA":
            if (game.philosophers > 0) {
                game.philosophers--;
                game.players[playerId].philosophers++;
                game.logs.push(
                    "[ATHENA] Philosopher card given to " +
                        game.players[playerId].name
                );
            }
            break;
        case "APOLLO":
            game.gold--;
            game.players[playerId].gold++;
            game.logs.push(
                "[APOLLO] Free gold coin given to " +
                    game.players[playerId].name
            );
            break;
    }
};

exports.endTurn = endTurn;
exports.beginActionTurn = beginActionTurn;
