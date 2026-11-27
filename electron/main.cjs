const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs/promises");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const execFileAsync = promisify(execFile);

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
    title: `BYTE PHANTOM v${app.getVersion()} — Digital Ghost`,
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


function isPrivateIPv4(address) {
  const parts=String(address||"").split(".").map(Number);
  if(parts.length!==4||parts.some(p=>!Number.isInteger(p)||p<0||p>255)) return false;
  const [a,b]=parts;
  return a===10||(a===172&&b>=16&&b<=31)||(a===192&&b===168);
}
function getNetworkPrefix(netmask) {
  return String(netmask||"").split(".").reduce((sum,item)=>{
    const n=Number(item);
    return sum+(Number.isInteger(n)&&n>=0&&n<=255?n.toString(2).replace(/0/g,"").length:0);
  },0);
}
async function collectNetworkRadar() {
  if(process.platform!=="win32") return {supported:false,reason:"Passive LAN neighbor discovery is currently available in the Windows desktop build only."};
  const startedAt=Date.now();
  const localInterfaces=Object.entries(os.networkInterfaces())
    .flatMap(([name,addresses])=>(addresses||[])
      .filter(e=>!e.internal&&(e.family==="IPv4"||e.family===4)&&isPrivateIPv4(e.address))
      .map(e=>({name,address:e.address,netmask:e.netmask,cidr:e.address+"/"+getNetworkPrefix(e.netmask)})));
  const powershellScript=[
    "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8",
    "$ErrorActionPreference = 'Stop'",
    "$rows = @(Get-NetNeighbor -AddressFamily IPv4 -ErrorAction Stop | Where-Object {",
    "  $_.State -in @('Reachable','Stale','Delay','Probe','Permanent') -and",
    "  $_.IPAddress -match '^(10\\.|192\\.168\\.|172\\.(1[6-9]|2[0-9]|3[01])\\.)' -and",
    "  $_.LinkLayerAddress -and $_.LinkLayerAddress -notmatch '^00(-00){5}$'",
    "} | Select-Object @{Name='ipAddress';Expression={$_.IPAddress}},@{Name='macAddress';Expression={$_.LinkLayerAddress}},@{Name='interfaceName';Expression={$_.InterfaceAlias}},@{Name='state';Expression={$_.State}})",
    "ConvertTo-Json -InputObject @($rows) -Depth 3 -Compress"
  ].join("\n");
  const {stdout}=await execFileAsync("powershell.exe",
    ["-NoLogo","-NoProfile","-NonInteractive","-ExecutionPolicy","Bypass","-Command",powershellScript],
    {windowsHide:true,timeout:10000,maxBuffer:512*1024,encoding:"utf8"});
  const raw=String(stdout||"").trim();
  let entries=raw?JSON.parse(raw):[];
  if(!Array.isArray(entries)) entries=[entries];
  const own=new Set(localInterfaces.map(x=>x.address)),seen=new Set();
  const devices=entries.filter(x=>x&&isPrivateIPv4(x.ipAddress)&&!own.has(x.ipAddress))
    .map(x=>({ipAddress:String(x.ipAddress),macAddress:String(x.macAddress||"UNAVAILABLE").toUpperCase(),interfaceName:String(x.interfaceName||"UNKNOWN INTERFACE"),state:String(x.state||"UNKNOWN").toUpperCase()}))
    .filter(x=>{const key=x.interfaceName+"|"+x.ipAddress;if(seen.has(key))return false;seen.add(key);return true;})
    .sort((a,b)=>a.ipAddress.localeCompare(b.ipAddress,undefined,{numeric:true})).slice(0,512);
  return {supported:true,collectedAt:new Date().toISOString(),durationMs:Date.now()-startedAt,source:"WINDOWS IPV4 NEIGHBOR CACHE",discoveryMode:"PASSIVE / READ-ONLY",interfaces:localInterfaces,devices,deviceCount:devices.length,networkProbesPerformed:false,packetsSent:0,systemChangesMade:false,limitations:"Shows private IPv4 neighbors already present in the Windows cache. Sleeping devices or devices Windows has not recently contacted may not appear."};
}

ipcMain.handle("byte-phantom:network-radar", async (event) => {
  const win=BrowserWindow.fromWebContents(event.sender);
  const senderUrl=event.senderFrame&&event.senderFrame.url;
  if(!win||typeof senderUrl!=="string"||!senderUrl.startsWith("file://")) throw new Error("Network radar is only available to the local BYTE PHANTOM desktop window.");
  return collectNetworkRadar();
});

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
