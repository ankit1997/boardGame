const isEmptyString = (str) => {
    return str == null || str == undefined || str == "";
};

function shuffle(array) {
    // used from stackoverflow
    let currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}

exports.isEmptyString = isEmptyString;
exports.shuffle = shuffle;
