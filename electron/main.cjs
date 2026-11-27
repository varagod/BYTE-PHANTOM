const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs/promises");

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


async function collectSystemSnapshot() {
  if (process.platform !== "win32") {
    return { supported: false, platform: process.platform, reason: "The live host inventory is currently available in the Windows desktop build only." };
  }

  const cpuList = os.cpus() || [];
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const networkAdapters = Object.entries(os.networkInterfaces())
    .flatMap(([name, addresses]) => (addresses || [])
      .filter((entry) => !entry.internal && entry.family === "IPv4")
      .map((entry) => ({ name, address: entry.address, netmask: entry.netmask })));

  let disk = null;
  const systemRoot = path.parse(process.env.SystemRoot || process.cwd()).root || "C:\\";
  try {
    const stats = await fs.statfs(systemRoot);
    const blockSize = Number(stats.bsize);
    const totalBytes = Number(stats.blocks) * blockSize;
    const freeBytes = Number(stats.bavail) * blockSize;
    disk = { volume: systemRoot, totalBytes, freeBytes, usedBytes: Math.max(0, totalBytes - freeBytes) };
  } catch {
    // Disk capacity is optional; some Windows volumes do not expose statfs.
  }

  return {
    supported: true,
    collectedAt: new Date().toISOString(),
    appVersion: app.getVersion(),
    host: {
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      version: typeof os.version === "function" ? os.version() : os.release(),
      architecture: os.arch(),
      uptimeSeconds: os.uptime()
    },
    cpu: {
      model: cpuList[0] ? cpuList[0].model.trim() : "Unavailable",
      logicalCores: cpuList.length,
      nominalSpeedMHz: cpuList[0] ? cpuList[0].speed : 0
    },
    memory: {
      totalBytes: totalMemory,
      freeBytes: freeMemory,
      usedBytes: Math.max(0, totalMemory - freeMemory)
    },
    disk,
    networkAdapters,
    runtime: { electron: process.versions.electron || "unknown", node: process.versions.node || "unknown" },
    scope: "READ-ONLY LOCAL INVENTORY",
    networkProbesPerformed: false,
    systemChangesMade: false
  };
}

ipcMain.handle("byte-phantom:system-snapshot", async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const senderUrl = event.senderFrame && event.senderFrame.url;
  if (!win || typeof senderUrl !== "string" || !senderUrl.startsWith("file://")) {
    throw new Error("System inventory is only available to the local BYTE PHANTOM desktop window.");
  }
  return collectSystemSnapshot();
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
