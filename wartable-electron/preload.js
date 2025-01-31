const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    uploadMap: () => ipcRenderer.invoke("upload-map")
});
