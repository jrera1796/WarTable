const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    // Load the DM interface from a local HTML file instead of localhost:3000
    mainWindow.loadFile(path.join(__dirname, "public", "dm.html"));
});
