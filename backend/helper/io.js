const express = require("express");

const app = express();

const http = require("http").createServer(app);

const io = require("socket.io")(http, {
    cors: {
        origin: ["http://localhost:4200"],
    },
});

exports.app = app;
exports.http = http;
exports.io = io;
