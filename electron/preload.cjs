const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("bytePhantomDesktop", Object.freeze({
  toggleFullscreen: () => ipcRenderer.invoke("byte-phantom:toggle-fullscreen"),
  getWindowState: () => ipcRenderer.invoke("byte-phantom:window-state"),
  getSystemSnapshot: () => ipcRenderer.invoke("byte-phantom:system-snapshot"),
  getNetworkRadar: () => ipcRenderer.invoke("byte-phantom:network-radar"),
  onFullscreenChanged: (callback) => {
    if (typeof callback !== "function") return () => {};
    const listener = () => callback();
    ipcRenderer.on("byte-phantom:fullscreen-changed", listener);
    return () => ipcRenderer.removeListener("byte-phantom:fullscreen-changed", listener);
  }
}));
