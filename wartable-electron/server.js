const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// Serve static files from the tokens directory
const TOKENS_DIR = path.join(__dirname, "./tokens");
app.use("/tokens", express.static(TOKENS_DIR));

// Recursive function to get token files
function getTokenFiles(directory, basePath = "/tokens") {
    let tokenList = [];
    const items = fs.readdirSync(directory);

    items.forEach((item) => {
        const fullPath = path.join(directory, item);
        const relativePath = path.join(basePath, item);

        if (fs.lstatSync(fullPath).isDirectory()) {
            // Recursively get tokens in subfolders
            tokenList.push({
                type: "folder",
                name: item,
                path: relativePath,
            });
            tokenList = tokenList.concat(getTokenFiles(fullPath, relativePath));
        } else if (/\.(png|jpg|jpeg|webp)$/i.test(item)) {
            // Only include valid image files
            tokenList.push({
                type: "token",
                name: item.replace(/\.[^/.]+$/, ""), // Remove file extension
                src: relativePath,
                folder: path.dirname(relativePath),
            });
        }
    });

    return tokenList;
}

// API to get all tokens and folders
app.get("/api/tokens", (req, res) => {
    try {
        const tokens = getTokenFiles(TOKENS_DIR);
        res.json(tokens);
    } catch (error) {
        console.error("Error loading tokens:", error);
        res.status(500).json({ error: "Failed to load tokens" });
    }
});

io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on("joinGame", (playerName) => {
        console.log(`${playerName} joined.`);
        io.emit("updatePlayers", { id: socket.id, name: playerName });
    });

    socket.on("disconnect", () => {
        console.log(`Player disconnected: ${socket.id}`);
        io.emit("removePlayer", socket.id);
    });
});

server.listen(3000, () =>
    console.log("DM Server running for WebSockets and Tokens")
);