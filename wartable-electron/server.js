const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

let players = {}; // Store player connections

io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on("joinGame", (playerName) => {
        players[socket.id] = { name: playerName };
        console.log(`${playerName} joined.`);
        io.emit("updatePlayers", players);
    });

    socket.on("disconnect", () => {
        console.log(`Player disconnected: ${socket.id}`);
        delete players[socket.id];
        io.emit("updatePlayers", players);
    });
});

server.listen(3000, () => console.log("DM Server running for WebSockets only"));
