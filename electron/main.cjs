const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 900,
    minHeight: 640,
    show: false,
    center: true,
    resizable: true,
    maximizable: true,
    fullscreen: false,
    autoHideMenuBar: true,
    backgroundColor: "#090910",
    icon: path.join(__dirname, "..", "assets", "byte-phantom.ico"),
    title: "BYTE PHANTOM — Digital Ghost",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, "..", "web", "index.html"));
  mainWindow.once("ready-to-show", () => mainWindow && mainWindow.show());
  mainWindow.on("closed", () => { mainWindow = null; });

  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown") return;
    if (input.key === "F11") {
      event.preventDefault();
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    } else if (input.key === "Escape" && mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false);
    }
  });

  const notifyFullscreen = () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("byte-phantom:fullscreen-changed", mainWindow.isFullScreen());
    }
  };
  mainWindow.on("enter-full-screen", notifyFullscreen);
  mainWindow.on("leave-full-screen", notifyFullscreen);
}

ipcMain.handle("byte-phantom:toggle-fullscreen", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return { fullscreen: false };
  win.setFullScreen(!win.isFullScreen());
  return { fullscreen: win.isFullScreen() };
});

ipcMain.handle("byte-phantom:window-state", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  return {
    fullscreen: !!win && win.isFullScreen(),
    maximized: !!win && win.isMaximized(),
    resizable: !!win && win.isResizable()
  };
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
