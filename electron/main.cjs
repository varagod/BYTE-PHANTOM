const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs/promises");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const dnsPromises = require("node:dns").promises;
const https = require("node:https");
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
  const octets=String(netmask||"").split(".");
  if(octets.length!==4||octets.some(x=>!Number.isInteger(Number(x))||Number(x)<0||Number(x)>255)) return 0;
  const binary=octets.map(x=>Number(x).toString(2).padStart(8,"0")).join("");
  if(!/^1*0*$/.test(binary)) return 0;
  return (binary.match(/1/g)||[]).length;
}
function ipv4ToNumber(address) {
  const p=String(address).split(".").map(Number);
  if(p.length!==4||p.some(x=>!Number.isInteger(x)||x<0||x>255)) return null;
  return (((p[0]<<24)>>>0)+(p[1]<<16)+(p[2]<<8)+p[3])>>>0;
}
function numberToIPv4(value) {
  const n=Number(value)>>>0;
  return [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join(".");
}
function buildNetworkRadarPlan(localInterfaces) {
  const targets=new Map(),scopes=[],skipped=[];
  const maxTargets=1022;
  let totalTargets=0;
  for(const item of localInterfaces) {
    const prefix=getNetworkPrefix(item.netmask);
    const address=ipv4ToNumber(item.address);
    if(address===null||prefix<22||prefix>30) {
      skipped.push({interfaceName:item.name,cidr:item.cidr,reason:"Subnet is outside the supported /22 to /30 active-discovery range."});
      continue;
    }
    const mask=(0xffffffff<<(32-prefix))>>>0;
    const network=(address&mask)>>>0;
    const broadcast=(network|(~mask>>>0))>>>0;
    const hostCount=Math.max(0,broadcast-network-1);
    if(hostCount<1||hostCount+totalTargets>maxTargets) {
      skipped.push({interfaceName:item.name,cidr:item.cidr,reason:"The active-discovery safety cap is 1,022 host addresses per scan."});
      continue;
    }
    scopes.push({interfaceName:item.name,localAddress:item.address,cidr:numberToIPv4(network)+"/"+prefix,hostCount});
    totalTargets+=hostCount;
    for(let n=network+1;n<broadcast;n++) {
      const ip=numberToIPv4(n);
      if(ip===item.address) continue;
      if(!targets.has(ip)) targets.set(ip,new Set());
      targets.get(ip).add(item.name);
    }
  }
  return {
    scopes,skipped,
    targets:Array.from(targets.entries()).map(([ip,names])=>({ipAddress:ip,interfaceNames:Array.from(names)}))
      .sort((a,b)=>a.ipAddress.localeCompare(b.ipAddress,undefined,{numeric:true})),
    targetCount:targets.size,maxTargets
  };
}
async function collectNetworkPathInfo() {
  if (process.platform !== "win32") {
    return { source: "WINDOWS ROUTE SNAPSHOT ONLY" };
  }

  try {
    const script = [
      "$ErrorActionPreference = 'Stop'",
      "$rows = @(Get-NetIPConfiguration | Where-Object { $_.NetAdapter.Status -eq 'Up' } | ForEach-Object {",
      "  [pscustomobject]@{",
      "    interfaceName = $_.InterfaceAlias",
      "    gateway = @($_.IPv4DefaultGateway | ForEach-Object { $_.NextHop })",
      "    dns = @($_.DNSServer.ServerAddresses | Where-Object { $_ -match '^[0-9a-fA-F:.]+$' })",
      "    addresses = @($_.IPv4Address | ForEach-Object { $_.IPAddress })",
      "  }",
      "})",
      "$default = Get-NetRoute -AddressFamily IPv4 -DestinationPrefix '0.0.0.0/0' -ErrorAction SilentlyContinue | Sort-Object RouteMetric, InterfaceMetric | Select-Object -First 1",
      "$gateway = $null",
      "$interfaceName = $null",
      "$hasDefaultRoute = $false",
      "if ($default) { $gateway = $default.NextHop; $interfaceName = $default.InterfaceAlias; $hasDefaultRoute = $true }",
      "[pscustomobject]@{ rows = $rows; gateway = $gateway; interfaceName = $interfaceName; defaultRoute = $hasDefaultRoute } | ConvertTo-Json -Depth 5 -Compress"
    ].join("\r\n");

    const { stdout } = await execFileAsync(
      "powershell.exe",
      ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script],
      { windowsHide: true, timeout: 8000, maxBuffer: 256 * 1024, encoding: "utf8" }
    );
    const data = JSON.parse(String(stdout || "{}").trim());
    const rows = Array.isArray(data.rows) ? data.rows : (data.rows ? [data.rows] : []);
    const active = rows.find(row => row.interfaceName === data.interfaceName) || rows[0] || {};
    const asArray = value => Array.isArray(value) ? value : (value ? [value] : []);

    return {
      source: "WINDOWS GET-NETIPCONFIGURATION + DEFAULT ROUTE",
      gateway: String(data.gateway || asArray(active.gateway)[0] || "NOT FOUND"),
      dnsServers: asArray(active.dns).map(String),
      transport: "WINDOWS NETWORK ADAPTER",
      interfaceName: String(data.interfaceName || active.interfaceName || "UNKNOWN"),
      addresses: asArray(active.addresses).map(String),
      defaultRoute: data.defaultRoute === true
    };
  } catch (error) {
    return {
      source: "WINDOWS ROUTE SNAPSHOT UNAVAILABLE",
      gateway: "UNAVAILABLE",
      dnsServers: [],
      transport: "UNKNOWN",
      interfaceName: "UNKNOWN",
      addresses: [],
      defaultRoute: null,
      error: String(error && error.message ? error.message : error)
    };
  }
}

async function probeDefaultGateway(gateway) {
  const started = Date.now();
  if (!isPrivateIPv4(gateway)) {
    return {
      gateway: gateway || "NOT REPORTED",
      supported: false,
      replied: null,
      status: "SKIPPED",
      latencyMs: Date.now() - started,
      reason: "No private IPv4 default gateway was reported by the active route snapshot."
    };
  }

  try {
    const pingPath = path.join(process.env.SystemRoot || "C:\\Windows", "System32", "ping.exe");
    await execFileAsync(pingPath, ["-n", "1", "-w", "1200", gateway], {
      windowsHide: true,
      timeout: 3000,
      maxBuffer: 64 * 1024,
      encoding: "utf8"
    });
    return {
      gateway,
      supported: true,
      replied: true,
      status: "REPLIED",
      latencyMs: Date.now() - started,
      method: "ONE ICMP ECHO REQUEST"
    };
  } catch (error) {
    return {
      gateway,
      supported: true,
      replied: false,
      status: error && (error.killed || error.code === "ETIMEDOUT") ? "TIMEOUT" : "NO_REPLY",
      latencyMs: Date.now() - started,
      method: "ONE ICMP ECHO REQUEST",
      error: String(error && (error.code || error.message) ? (error.code || error.message) : error)
    };
  }
}

async function runConnectivityDiagnostics() {
  const startedAt = Date.now();
  const networkPath = await collectNetworkPathInfo();

  const lookup = async host => {
    const started = Date.now();
    let timeoutId;
    try {
      const addresses = await Promise.race([
        dnsPromises.lookup(host, { all: true, verbatim: true }),
        new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error("DNS lookup timed out")), 5000);
        })
      ]);
      return {
        host,
        ok: Array.isArray(addresses) && addresses.length > 0,
        latencyMs: Date.now() - started,
        addresses: (addresses || []).map(item => item.address)
      };
    } catch (error) {
      return {
        host,
        ok: false,
        latencyMs: Date.now() - started,
        addresses: [],
        error: String(error && error.message ? error.message : error)
      };
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  };

  const checkHttps = url => new Promise(resolve => {
    const started = Date.now();
    let settled = false;
    const finish = result => {
      if (settled) return;
      settled = true;
      resolve({ ...result, url, latencyMs: Date.now() - started });
    };

    const request = https.get(url, {
      headers: { "User-Agent": "BYTE-PHANTOM-Network-Diagnostics/1.11.0" }
    }, response => {
      const statusCode = response.statusCode || 0;
      response.resume();
      finish({ ok: statusCode >= 200 && statusCode < 400, statusCode });
    });
    request.setTimeout(5000, () => request.destroy(new Error("HTTPS/TLS request timed out")));
    request.on("error", error => finish({
      ok: false,
      statusCode: 0,
      error: String(error && (error.code || error.message) ? (error.code || error.message) : error)
    }));
  });

  const [gatewayProbe, dnsResult, httpsResults] = await Promise.all([
    probeDefaultGateway(networkPath.gateway),
    lookup("example.com"),
    Promise.all([
      checkHttps("https://www.msftconnecttest.com/connecttest.txt"),
      checkHttps("https://connectivitycheck.gstatic.com/generate_204")
    ])
  ]);

  return {
    supported: true,
    platform: "WINDOWS",
    collectedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    networkPath,
    gatewayProbe,
    dns: dnsResult,
    https: httpsResults,
    systemChangesMade: false,
    scope: "ACTIVE ROUTE SNAPSHOT + ONE LOCAL GATEWAY ICMP ECHO + ONE SYSTEM DNS LOOKUP + TWO FIXED HTTPS/TLS CHECKS"
  };
}

async function collectNetworkRadar(options={}) {
  if(process.platform!=="win32") return {supported:false,reason:"Active local IPv4 discovery and Windows neighbor monitoring are currently available in the Windows desktop build only."};
  const startedAt=Date.now();
  const activeSweep=options.activeSweep===true;
  const localInterfaces=Object.entries(os.networkInterfaces())
    .flatMap(([name,addresses])=>(addresses||[])
      .filter(e=>!e.internal&&(e.family==="IPv4"||e.family===4)&&isPrivateIPv4(e.address))
      .map(e=>({name,address:e.address,netmask:e.netmask,prefix:getNetworkPrefix(e.netmask),cidr:e.address+"/"+getNetworkPrefix(e.netmask)})));
  const plan=buildNetworkRadarPlan(localInterfaces);
  const payload=Buffer.from(JSON.stringify({activeSweep,candidateIps:plan.targets.map(x=>x.ipAddress)}),"utf8").toString("base64");
  const powershellScript=[
    "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8",
    "$ErrorActionPreference = 'Stop'",
    "$inputData = ConvertFrom-Json -InputObject ([System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('"+payload+"')))",
    "$candidateSet = @{}",
    "foreach ($ip in @($inputData.candidateIps)) { $candidateSet[[string]$ip] = $true }",
    "$responsiveSet = @{}",
    "if ([bool]$inputData.activeSweep) {",
    "  $ips = @($inputData.candidateIps)",
    "  for ($offset = 0; $offset -lt $ips.Count; $offset += 128) {",
    "    $end = [Math]::Min($offset + 127, $ips.Count - 1)",
    "    $batch = @()",
    "    for ($i = $offset; $i -le $end; $i++) {",
    "      $ping = [System.Net.NetworkInformation.Ping]::new()",
    "      try { $task = $ping.SendPingAsync([string]$ips[$i], 650); $batch += ,[pscustomobject]@{ IP = [string]$ips[$i]; Ping = $ping; Task = $task } }",
    "      catch { $ping.Dispose() }",
    "    }",
    "    $tasks = @($batch | ForEach-Object { $_.Task })",
    "    if ($tasks.Count -gt 0) { try { [void][System.Threading.Tasks.Task]::WaitAll([System.Threading.Tasks.Task[]]$tasks, 1400) } catch { } }",
    "    foreach ($entry in $batch) {",
    "      try { if ($entry.Task.IsCompleted -and $entry.Task.Status -eq [System.Threading.Tasks.TaskStatus]::RanToCompletion -and $entry.Task.Result.Status -eq [System.Net.NetworkInformation.IPStatus]::Success) { $responsiveSet[$entry.IP] = $true } } catch { }",
    "      finally { $entry.Ping.Dispose() }",
    "    }",
    "  }",
    "}",
    "$rows = @(Get-NetNeighbor -AddressFamily IPv4 -ErrorAction Stop | Where-Object {",
    "  $candidateSet.ContainsKey([string]$_.IPAddress) -and",
    "  $_.State -in @('Reachable','Stale','Delay','Probe','Permanent','Unreachable') -and",
    "  $_.LinkLayerAddress -and $_.LinkLayerAddress -notmatch '^(00(-00){5}|00(:00){5})$'",
    "} | Select-Object @{Name='ipAddress';Expression={$_.IPAddress}},@{Name='macAddress';Expression={$_.LinkLayerAddress}},@{Name='interfaceName';Expression={$_.InterfaceAlias}},@{Name='state';Expression={$_.State}},@{Name='responding';Expression={$responsiveSet.ContainsKey([string]$_.IPAddress)}})",
    "$output = [ordered]@{ neighbors = @($rows); responsiveIps = @($responsiveSet.Keys) }",
    "ConvertTo-Json -InputObject $output -Depth 4 -Compress"
  ].join("\n");
  const {stdout}=await execFileAsync("powershell.exe",
    ["-NoLogo","-NoProfile","-NonInteractive","-ExecutionPolicy","Bypass","-Command",powershellScript],
    {windowsHide:true,timeout:25000,maxBuffer:1024*1024,encoding:"utf8"});
  const raw=String(stdout||"").trim();
  const parsed=raw?JSON.parse(raw):{};
  const neighbors=Array.isArray(parsed.neighbors)?parsed.neighbors:(parsed.neighbors?[parsed.neighbors]:[]);
  const responsiveSet=new Set(Array.isArray(parsed.responsiveIps)?parsed.responsiveIps:(parsed.responsiveIps?[parsed.responsiveIps]:[]));
  const own=new Set(localInterfaces.map(x=>x.address)),seen=new Set();
  const devices=neighbors.filter(x=>x&&isPrivateIPv4(x.ipAddress)&&!own.has(x.ipAddress))
    .map(x=>({
      ipAddress:String(x.ipAddress),macAddress:String(x.macAddress||"UNAVAILABLE").toUpperCase(),
      interfaceName:String(x.interfaceName||"UNKNOWN INTERFACE"),state:String(x.state||"UNKNOWN").toUpperCase(),
      responding:responsiveSet.has(String(x.ipAddress))||x.responding===true
    }))
    .filter(x=>{const key=x.interfaceName+"|"+x.ipAddress;if(seen.has(key))return false;seen.add(key);return true;})
    .sort((a,b)=>a.ipAddress.localeCompare(b.ipAddress,undefined,{numeric:true})).slice(0,1022);
  return {
    supported:true,collectedAt:new Date().toISOString(),durationMs:Date.now()-startedAt,
    source:"ACTIVE IPV4 DISCOVERY + WINDOWS NEIGHBOR TABLE",
    discoveryMode:activeSweep?"ACTIVE / ICMP + ARP":"LIVE WATCH / WINDOWS NEIGHBOR TABLE",
    activeSweep,interfaces:localInterfaces,scopes:plan.scopes,skippedScopes:plan.skipped,networkPath:await collectNetworkPathInfo(),
    targetCount:plan.targetCount,hostsProbed:activeSweep?plan.targetCount:0,
    devices,deviceCount:devices.length,respondingCount:devices.filter(x=>x.responding).length,
    networkProbesPerformed:activeSweep,
    probeType:activeSweep?"ONE ICMP ECHO REQUEST PER PRIVATE IPV4 HOST":"PASSIVE NEIGHBOR-TABLE READ",
    systemChangesMade:false,
    limitations:"Discovery is limited to private IPv4 subnets directly attached to this Windows PC (/22 to /30, up to 1,022 target addresses per scan). ICMP-blocked devices may still appear when ARP resolves. Sleeping/offline devices, client isolation, separate VLANs/subnets, and non-responsive peers can remain invisible. This is not a guaranteed router client list; that requires a supported router-management API."
  };
}

ipcMain.handle("byte-phantom:network-radar", async (event, options={}) => {
  const win=BrowserWindow.fromWebContents(event.sender);
  const senderUrl=event.senderFrame&&event.senderFrame.url;
  if(!win||typeof senderUrl!=="string"||!senderUrl.startsWith("file://")) throw new Error("Network radar is only available to the local BYTE PHANTOM desktop window.");
  return collectNetworkRadar({activeSweep:!!(options&&options.activeSweep===true)});
});

ipcMain.handle("byte-phantom:connectivity-diagnostics", async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const senderUrl = event.senderFrame && event.senderFrame.url;
  if (!win || typeof senderUrl !== "string" || !senderUrl.startsWith("file://")) {
    throw new Error("Connectivity diagnostics are only available to the local BYTE PHANTOM desktop window.");
  }
  return runConnectivityDiagnostics();
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
