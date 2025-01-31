const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
        },
    });

    mainWindow.loadFile(path.join(__dirname, "public", "dm.html"));
    // mainWindow.webContents.openDevTools(); // Optional: Remove in production
});

// Handle file upload requests
ipcMain.handle("upload-map", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ["openFile"],
        filters: [{ name: "Images", extensions: ["jpg", "png", "webp"] }],
    });
    return result.filePaths[0]; // Return the selected file path
});
