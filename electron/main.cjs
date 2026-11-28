const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs/promises");
const nodeFs = require("node:fs");
const { createHash } = require("node:crypto");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const dnsPromises = require("node:dns").promises;
const https = require("node:https");
const dgram = require("node:dgram");
const net = require("node:net");
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


async function collectProcessSnapshot() {
  if (process.platform !== "win32") {
    return { supported: false, platform: process.platform, reason: "A full process inventory is only available in the Windows desktop build. Android reports only the BYTE PHANTOM app process." };
  }
  const script = `$ErrorActionPreference = 'Stop'
$all = @(Get-Process -ErrorAction SilentlyContinue)
$rows = @($all | Sort-Object WorkingSet64 -Descending | Select-Object -First 80 @{
  Name = 'name'; Expression = { [string]$_.ProcessName }
}, @{
  Name = 'pid'; Expression = { [int]$_.Id }
}, @{
  Name = 'memoryBytes'; Expression = { [long]$_.WorkingSet64 }
}, @{
  Name = 'cpuSeconds'; Expression = { if ($null -ne $_.CPU) { [math]::Round([double]$_.CPU, 2) } else { $null } }
}, @{
  Name = 'startedAt'; Expression = { try { $_.StartTime.ToUniversalTime().ToString('o') } catch { $null } }
}, @{
  Name = 'executablePath'; Expression = { try { [string]$_.Path } catch { $null } }
})
$payload = [pscustomobject]@{ totalCount = $all.Count; processes = @($rows) }
$payload | ConvertTo-Json -Depth 4 -Compress`;
  const { stdout } = await execFileAsync("powershell.exe", [
    "-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script
  ], { windowsHide: true, timeout: 15000, maxBuffer: 2 * 1024 * 1024, encoding: "utf8" });
  const parsed = JSON.parse(String(stdout || "{}").trim());
  const processes = Array.isArray(parsed.processes) ? parsed.processes : (parsed.processes ? [parsed.processes] : []);
  return {
    supported: true, platform: "WINDOWS", collectedAt: new Date().toISOString(),
    totalCount: Number(parsed.totalCount) || processes.length, returnedCount: processes.length,
    truncated: (Number(parsed.totalCount) || processes.length) > processes.length,
    processes, scope: "READ-ONLY LOCAL PROCESS INVENTORY; TOP 80 BY WORKING SET; PATH MAY BE UNAVAILABLE WITHOUT ACCESS",
    systemChangesMade: false, networkProbesPerformed: false
  };
}

async function collectCameraPrivacySnapshot() {
  if (process.platform !== "win32") {
    return { supported: false, platform: process.platform, status: "NOT_AVAILABLE", reason: "Windows camera privacy registry inspection is only available in the Windows desktop build." };
  }
  const ownExecutable = path.basename(process.execPath).replace(/'/g, "''");
  const script = `$ErrorActionPreference = 'Stop'
$userRoot = 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\webcam'
$desktopRoot = Join-Path $userRoot 'NonPackaged'
$policyRoot = 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\AppPrivacy'
$ownExe = '${ownExecutable}'
function Read-RegistryValue($keyPath, $name) {
  try {
    if (Test-Path -LiteralPath $keyPath) {
      $item = Get-ItemProperty -LiteralPath $keyPath -Name $name -ErrorAction SilentlyContinue
      if ($null -ne $item) { return $item.$name }
    }
  } catch {}
  return $null
}
function Convert-CameraFileTime($raw) {
  try {
    $value = [Int64]$raw
    if ($value -gt 0) { return [DateTime]::FromFileTimeUtc($value).ToString('o') }
  } catch {}
  return $null
}
$entries = New-Object System.Collections.Generic.List[object]
if (Test-Path -LiteralPath $userRoot) {
  foreach ($child in @(Get-ChildItem -LiteralPath $userRoot -ErrorAction SilentlyContinue)) {
    if ($child.PSChildName -eq 'NonPackaged') {
      foreach ($desktopEntry in @(Get-ChildItem -LiteralPath $desktopRoot -ErrorAction SilentlyContinue)) {
        $props = Get-ItemProperty -LiteralPath $desktopEntry.PSPath -ErrorAction SilentlyContinue
        $entries.Add([pscustomobject]@{
          identity = [string]$desktopEntry.PSChildName
          type = 'DESKTOP_APP'
          setting = if ($null -ne $props.Value) { [string]$props.Value } else { 'NOT_RECORDED' }
          lastUsedStartUtc = (Convert-CameraFileTime $props.LastUsedTimeStart)
          lastUsedStopUtc = (Convert-CameraFileTime $props.LastUsedTimeStop)
        })
      }
    } else {
      $props = Get-ItemProperty -LiteralPath $child.PSPath -ErrorAction SilentlyContinue
      $entries.Add([pscustomobject]@{
        identity = [string]$child.PSChildName
        type = 'PACKAGED_APP'
        setting = if ($null -ne $props.Value) { [string]$props.Value } else { 'NOT_RECORDED' }
        lastUsedStartUtc = (Convert-CameraFileTime $props.LastUsedTimeStart)
        lastUsedStopUtc = (Convert-CameraFileTime $props.LastUsedTimeStop)
      })
    }
  }
}
$policyItem = Get-ItemProperty -LiteralPath $policyRoot -ErrorAction SilentlyContinue
$policyRaw = if ($null -ne $policyItem) { $policyItem.LetAppsAccessCamera } else { $null }
$policyMode = 'NOT_CONFIGURED'
if ($null -ne $policyRaw) {
  switch ([int]$policyRaw) {
    0 { $policyMode = 'USER_IN_CONTROL' }
    1 { $policyMode = 'FORCE_ALLOW' }
    2 { $policyMode = 'FORCE_DENY' }
    default { $policyMode = 'UNKNOWN_VALUE' }
  }
}
$allowList = if ($null -ne $policyItem.LetAppsAccessCamera_ForceAllowTheseApps) { [string]$policyItem.LetAppsAccessCamera_ForceAllowTheseApps } else { '' }
$denyList = if ($null -ne $policyItem.LetAppsAccessCamera_ForceDenyTheseApps) { [string]$policyItem.LetAppsAccessCamera_ForceDenyTheseApps } else { '' }
$unsignedDeny = if ($null -ne $policyItem.LetAppsAccessCamera_ForceDenyUnsigned) { [int]$policyItem.LetAppsAccessCamera_ForceDenyUnsigned } else { $null }
$unsignedAllow = if ($null -ne $policyItem.LetAppsAccessCamera_ForceAllowUnsigned) { [int]$policyItem.LetAppsAccessCamera_ForceAllowUnsigned } else { $null }
$allRows = @($entries.ToArray())
$ownRows = @($allRows | Where-Object { $_.identity -like ('*' + $ownExe + '*') })
$payload = [pscustomobject]@{
  supported = $true
  platform = 'WINDOWS'
  status = 'READ_ONLY_SNAPSHOT'
  collectedAt = (Get-Date).ToUniversalTime().ToString('o')
  computerName = $env:COMPUTERNAME
  userCameraConsent = if ($null -ne (Read-RegistryValue $userRoot 'Value')) { [string](Read-RegistryValue $userRoot 'Value') } else { 'NOT_RECORDED' }
  desktopAppsCameraConsent = if ($null -ne (Read-RegistryValue $desktopRoot 'Value')) { [string](Read-RegistryValue $desktopRoot 'Value') } else { 'NOT_RECORDED' }
  policy = [pscustomobject]@{
    modeValue = $policyRaw
    mode = $policyMode
    forceAllowTheseApps = $allowList
    forceDenyTheseApps = $denyList
    forceDenyUnsigned = $unsignedDeny
    forceAllowUnsigned = $unsignedAllow
    source = if ($null -ne $policyRaw -or $allowList -or $denyList) { 'HKLM AppPrivacy policy registry' } else { 'NO CAMERA POLICY VALUE RECORDED' }
  }
  perAppEntryCount = $allRows.Count
  returnedEntryCount = [Math]::Min(100, $allRows.Count)
  entriesTruncated = ($allRows.Count -gt 100)
  perAppEntries = @($allRows | Select-Object -First 100)
  ownAppExecutable = $ownExe
  ownAppEntries = @($ownRows)
  scope = 'CURRENT USER CONSENT + DEVICE CAMERA POLICY + RECORDED PER-APP ENTRIES; TIMESTAMPS ARE HISTORICAL; NO CAMERA DEVICE IS OPENED'
  cameraOpened = $false
  cameraFramesCaptured = $false
  systemChangesMade = $false
  networkProbesPerformed = $false
}
$payload | ConvertTo-Json -Depth 6 -Compress`;
  const { stdout } = await execFileAsync("powershell.exe", [
    "-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script
  ], { windowsHide: true, timeout: 20000, maxBuffer: 2 * 1024 * 1024, encoding: "utf8" });
  const result = JSON.parse(String(stdout || "{}").trim());
  if (!result || result.supported !== true || !result.policy || !Array.isArray(result.perAppEntries)) {
    throw new Error("Windows returned an incomplete camera privacy snapshot.");
  }
  return result;
}

async function collectFirewallSnapshot() {
  if (process.platform !== "win32") return {supported:false,platform:process.platform,status:"NOT_AVAILABLE",reason:"A system-wide firewall profile and rule inventory is not exposed by this desktop platform."};
  const script = `$ErrorActionPreference = 'Stop'
Import-Module NetSecurity -ErrorAction Stop
$profiles = @(Get-NetFirewallProfile -PolicyStore ActiveStore -ErrorAction Stop)
$allRules = @(Get-NetFirewallRule -PolicyStore ActiveStore -ErrorAction Stop)
$enabledRules = @($allRules | Where-Object { [string]$_.Enabled -ieq 'True' })
$profileRows = @(foreach ($profile in $profiles) {
  [pscustomobject]@{
    name = [string]$profile.Name
    enabled = ([string]$profile.Enabled -ieq 'True')
    defaultInboundAction = [string]$profile.DefaultInboundAction
    defaultOutboundAction = [string]$profile.DefaultOutboundAction
    allowInboundRules = [string]$profile.AllowInboundRules
    allowLocalFirewallRules = [string]$profile.AllowLocalFirewallRules
    notifyOnListen = [string]$profile.NotifyOnListen
    logAllowed = [string]$profile.LogAllowed
    logBlocked = [string]$profile.LogBlocked
    logFileName = [string]$profile.LogFileName
    logMaxSizeKilobytes = [long]$profile.LogMaxSizeKilobytes
  }
})
$ruleRows = @($enabledRules | Sort-Object -Property Direction, Action, DisplayName | Select-Object -First 120 @{
  Name = 'name'; Expression = { [string]$_.Name }
}, @{
  Name = 'displayName'; Expression = { [string]$_.DisplayName }
}, @{
  Name = 'description'; Expression = { [string]$_.Description }
}, @{
  Name = 'direction'; Expression = { [string]$_.Direction }
}, @{
  Name = 'action'; Expression = { [string]$_.Action }
}, @{
  Name = 'profile'; Expression = { [string]$_.Profile }
}, @{
  Name = 'enabled'; Expression = { [string]$_.Enabled }
}, @{
  Name = 'primaryStatus'; Expression = { [string]$_.PrimaryStatus }
}, @{
  Name = 'sourceType'; Expression = { [string]$_.PolicyStoreSourceType }
}, @{
  Name = 'source'; Expression = { [string]$_.PolicyStoreSource }
})
$service = Get-Service -Name 'MpsSvc' -ErrorAction SilentlyContinue
$serviceStatus = if ($null -ne $service) { [string]$service.Status } else { 'NOT FOUND' }
$summary = [pscustomobject]@{
  totalRules = $allRules.Count
  enabledRules = $enabledRules.Count
  disabledRules = ($allRules.Count - $enabledRules.Count)
  inboundAllow = @($enabledRules | Where-Object { $_.Direction -eq 'Inbound' -and $_.Action -eq 'Allow' }).Count
  inboundBlock = @($enabledRules | Where-Object { $_.Direction -eq 'Inbound' -and $_.Action -eq 'Block' }).Count
  outboundAllow = @($enabledRules | Where-Object { $_.Direction -eq 'Outbound' -and $_.Action -eq 'Allow' }).Count
  outboundBlock = @($enabledRules | Where-Object { $_.Direction -eq 'Outbound' -and $_.Action -eq 'Block' }).Count
}
$payload = [pscustomobject]@{
  supported = $true
  platform = 'WINDOWS'
  status = 'READ_ONLY_SNAPSHOT'
  collectedAt = (Get-Date).ToUniversalTime().ToString('o')
  computerName = $env:COMPUTERNAME
  policyStore = 'ActiveStore'
  firewallService = [pscustomobject]@{ name = 'MpsSvc'; status = $serviceStatus }
  profiles = @($profileRows)
  summary = $summary
  returnedRuleCount = $ruleRows.Count
  rulesTruncated = ($enabledRules.Count -gt $ruleRows.Count)
  rules = @($ruleRows)
  systemChangesMade = $false
  elevatedPrivilegesRequested = $false
  networkProbesPerformed = $false
}
$payload | ConvertTo-Json -Depth 6 -Compress`;
  const { stdout } = await execFileAsync("powershell.exe", [
    "-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script
  ], { windowsHide: true, timeout: 30000, maxBuffer: 4 * 1024 * 1024, encoding: "utf8" });
  const result = JSON.parse(String(stdout || "{}").trim());
  if (!result || result.supported !== true || !Array.isArray(result.profiles) || !result.summary) {
    throw new Error("Windows returned an incomplete firewall policy snapshot.");
  }
  return result;
}

async function hashSelectedFile(mainWindow, expectedSha256) {
  const expected = String(expectedSha256 || "").trim().toLowerCase();
  if (expected && !/^[a-f0-9]{64}$/.test(expected)) throw new Error("Expected SHA-256 must contain exactly 64 hexadecimal characters.");
  const selection = await dialog.showOpenDialog(mainWindow && !mainWindow.isDestroyed() ? mainWindow : undefined, {
    title: "BYTE PHANTOM — Select a file for SHA-256 integrity analysis",
    properties: ["openFile"]
  });
  if (selection.canceled || !Array.isArray(selection.filePaths) || !selection.filePaths[0]) {
    return { supported: true, cancelled: true, platform: "WINDOWS" };
  }
  const filePath = selection.filePaths[0];
  const before = await fs.stat(filePath);
  if (!before.isFile()) throw new Error("The selected item is not a regular file.");
  const hash = createHash("sha256");
  let bytesRead = 0;
  await new Promise((resolve, reject) => {
    const stream = nodeFs.createReadStream(filePath);
    stream.on("data", chunk => { bytesRead += chunk.length; hash.update(chunk); });
    stream.once("error", reject);
    stream.once("end", resolve);
  });
  const after = await fs.stat(filePath);
  const sha256 = hash.digest("hex");
  return {
    supported: true, cancelled: false, platform: "WINDOWS",
    fileName: path.basename(filePath), filePath, mimeType: "",
    sizeBytes: bytesRead, sha256, expectedSha256: expected || null,
    match: expected ? sha256 === expected : null,
    stableRead: before.size === after.size && before.mtimeMs === after.mtimeMs,
    collectedAt: new Date().toISOString(),
    scope: "USER-SELECTED FILE / STREAMED READ-ONLY SHA-256 / NO UPLOAD / NO FILE MODIFICATION",
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
  const startedAt=Date.now(),networkPath=await collectNetworkPathInfo();
  const dnsHosts=["example.com","iana.org","cloudflare.com"];
  const endpoints=[
    {provider:"MICROSOFT NCSI",url:"https://www.msftconnecttest.com/connecttest.txt",codes:[200],body:"Microsoft Connect Test",empty:false},
    {provider:"GOOGLE CONNECTIVITY",url:"https://connectivitycheck.gstatic.com/generate_204",codes:[200,204],body:"",empty:true},
    {provider:"CLOUDFLARE CONNECTIVITY",url:"https://cp.cloudflare.com/generate_204",codes:[200,204],body:"",empty:true},
    {provider:"APPLE CAPTIVE PORTAL",url:"https://captive.apple.com/hotspot-detect.html",codes:[200],body:"Success",empty:false}
  ];
  const lookup=async host=>{
    const started=Date.now();let timer;
    try{const addresses=await Promise.race([dnsPromises.lookup(host,{all:true,verbatim:true}),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error("DNS lookup timed out")),5000);})]);return{host,ok:Array.isArray(addresses)&&addresses.length>0,latencyMs:Date.now()-started,addresses:(addresses||[]).map(x=>x.address)};}
    catch(error){return{host,ok:false,latencyMs:Date.now()-started,addresses:[],error:String(error&&error.message?error.message:error)};}
    finally{if(timer)clearTimeout(timer);}
  };
  const redirectHost=(location,source)=>{if(!location)return"";try{return new URL(location,source).hostname.toLowerCase();}catch(e){return"";}};
  const checkHttps=endpoint=>new Promise(resolve=>{
    const started=Date.now();let settled=false;
    const finish=value=>{if(settled)return;settled=true;resolve({...value,url:endpoint.url,provider:endpoint.provider,expectedStatusCodes:endpoint.codes,expectedBody:endpoint.body,latencyMs:Date.now()-started});};
    const request=https.get(endpoint.url,{headers:{"User-Agent":"BYTE-PHANTOM-Network-Diagnostics/1.19.0"}},response=>{
      const status=response.statusCode||0,chunks=[];let stored=0,total=0;
      response.on("data",chunk=>{total+=chunk.length;if(stored<4096){const part=chunk.subarray(0,Math.min(chunk.length,4096-stored));chunks.push(part);stored+=part.length;}});
      response.once("error",error=>finish({ok:false,responseReceived:true,statusCode:status,responseBytes:total,bodyMatches:false,redirected:status>=300&&status<400,locationHost:redirectHost(response.headers.location,endpoint.url),contentType:response.headers["content-type"]||"",responseIntegrity:"RESPONSE_READ_ERROR",portalSignal:status===511||(status>=300&&status<400),error:String(error&&error.message?error.message:error)}));
      response.once("end",()=>{
        const body=Buffer.concat(chunks).toString("utf8"),statusMatches=endpoint.codes.includes(status);
        const bodyMatches=endpoint.empty?total===0:body.includes(endpoint.body),location=response.headers.location||"";
        const redirected=(status>=300&&status<400)||!!location,host=redirectHost(location,endpoint.url),ok=statusMatches&&bodyMatches&&!redirected;
        finish({ok,responseReceived:true,statusCode:status,expectedStatusCode:endpoint.codes.join(" OR "),bodyMatches,responseBytes:total,bodyTruncated:total>stored,contentType:response.headers["content-type"]||"",redirected,locationHost:host,responseIntegrity:ok?"VALIDATED":redirected?"REDIRECTED":!statusMatches?"STATUS_MISMATCH":"CONTENT_MISMATCH",portalSignal:status===511||redirected||(status>=200&&status<300&&!bodyMatches)});
      });
    });
    request.setTimeout(5000,()=>request.destroy(new Error("HTTPS/TLS request timed out")));
    request.on("error",error=>finish({ok:false,responseReceived:false,statusCode:0,responseBytes:0,bodyMatches:false,redirected:false,locationHost:"",responseIntegrity:"NO_HTTP_RESPONSE",portalSignal:false,error:String(error&&(error.code||error.message)?(error.code||error.message):error)}));
  });
  const [gatewayProbe,dnsChecks,httpsResults]=await Promise.all([probeDefaultGateway(networkPath.gateway),Promise.all(dnsHosts.map(lookup)),Promise.all(endpoints.map(checkHttps))]);
  return{supported:true,platform:"WINDOWS",collectedAt:new Date().toISOString(),durationMs:Date.now()-startedAt,networkPath,gatewayProbe,dns:dnsChecks[0]||{host:dnsHosts[0],ok:false,addresses:[]},dnsChecks,https:httpsResults,systemChangesMade:false,scope:"ACTIVE ROUTE + GATEWAY ICMP + THREE SYSTEM DNS LOOKUPS + FOUR STRICT HTTPS RESPONSE-INTEGRITY PROBES; REDIRECTS ARE NOT FOLLOWED"};
}

function buildDnsAQuery(host) {
  const id = Math.floor(Math.random() * 65536);
  const labels = String(host).split(".");
  const labelBytes = [];
  for (const label of labels) {
    const bytes = Buffer.from(label, "ascii");
    if (!bytes.length || bytes.length > 63) throw new Error("Invalid DNS query label.");
    labelBytes.push(Buffer.from([bytes.length]), bytes);
  }
  labelBytes.push(Buffer.from([0]));
  const question = Buffer.concat([...labelBytes, Buffer.from([0, 1, 0, 1])]);
  const header = Buffer.alloc(12);
  header.writeUInt16BE(id, 0);
  header.writeUInt16BE(0x0100, 2);
  header.writeUInt16BE(1, 4);
  return { id, packet: Buffer.concat([header, question]) };
}

function skipDnsName(packet, start) {
  let offset = start;
  while (offset < packet.length) {
    const length = packet[offset];
    if ((length & 0xc0) === 0xc0) return offset + 2 <= packet.length ? offset + 2 : -1;
    if ((length & 0xc0) !== 0) return -1;
    offset += 1;
    if (length === 0) return offset;
    if (offset + length > packet.length) return -1;
    offset += length;
  }
  return -1;
}

function parseDnsAResponse(packet, expectedId) {
  if (!Buffer.isBuffer(packet) || packet.length < 12 || packet.readUInt16BE(0) !== expectedId) {
    throw new Error("Invalid or mismatched DNS response.");
  }
  const flags = packet.readUInt16BE(2);
  if ((flags & 0x8000) === 0) throw new Error("The DNS packet is not a response.");
  const responseCode = flags & 0x000f;
  const questionCount = packet.readUInt16BE(4);
  const answerCount = packet.readUInt16BE(6);
  let offset = 12;

  for (let i = 0; i < questionCount; i++) {
    offset = skipDnsName(packet, offset);
    if (offset < 0 || offset + 4 > packet.length) throw new Error("Malformed DNS question section.");
    offset += 4;
  }

  const addresses = [];
  for (let i = 0; i < answerCount; i++) {
    offset = skipDnsName(packet, offset);
    if (offset < 0 || offset + 10 > packet.length) throw new Error("Malformed DNS answer section.");
    const type = packet.readUInt16BE(offset);
    const klass = packet.readUInt16BE(offset + 2);
    const ttl = packet.readUInt32BE(offset + 4);
    const dataLength = packet.readUInt16BE(offset + 8);
    offset += 10;
    if (offset + dataLength > packet.length) throw new Error("Truncated DNS answer data.");
    if (type === 1 && klass === 1 && dataLength === 4) {
      addresses.push({
        address: Array.from(packet.subarray(offset, offset + 4)).join("."),
        ttl
      });
    }
    offset += dataLength;
  }

  const responseNames = ["NOERROR", "FORMERR", "SERVFAIL", "NXDOMAIN", "NOTIMP", "REFUSED"];
  return {
    responseCode,
    responseCodeName: responseNames[responseCode] || ("RCODE_" + responseCode),
    answerCount,
    addresses,
    ok: responseCode === 0 && addresses.length > 0
  };
}

function queryDnsResolver(server, host = "example.com", timeoutMs = 1800) {
  return new Promise(resolve => {
    const started = Date.now();
    const query = buildDnsAQuery(host);
    const socket = dgram.createSocket("udp4");
    let settled = false;
    let timer = null;

    const finish = result => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      try { socket.close(); } catch { /* Socket may already be closed. */ }
      resolve({
        server,
        queryName: host,
        port: 53,
        latencyMs: Date.now() - started,
        ...result
      });
    };

    socket.once("error", error => finish({
      ok: false,
      status: "SOCKET_ERROR",
      addresses: [],
      error: String(error && (error.code || error.message) ? (error.code || error.message) : error)
    }));
    socket.once("message", message => {
      try {
        const parsed = parseDnsAResponse(message, query.id);
        finish({
          ...parsed,
          status: parsed.ok ? "RESPONDED" : parsed.responseCodeName === "NOERROR" ? "NO_A_RECORD" : parsed.responseCodeName
        });
      } catch (error) {
        finish({
          ok: false,
          status: "INVALID_RESPONSE",
          addresses: [],
          error: String(error && error.message ? error.message : error)
        });
      }
    });

    timer = setTimeout(() => finish({
      ok: false,
      status: "TIMEOUT",
      addresses: [],
      error: "No DNS response within " + timeoutMs + " ms."
    }), timeoutMs);

    socket.send(query.packet, 53, server, error => {
      if (error) finish({
        ok: false,
        status: "SEND_ERROR",
        addresses: [],
        error: String(error.code || error.message || error)
      });
    });
  });
}

function classifyDnsAnswerAddress(address) {
  if (net.isIP(address) !== 4) return "INVALID";
  const [a, b, c] = address.split(".").map(Number);
  if (a === 0) return "UNSPECIFIED";
  if (a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) return "PRIVATE";
  if (a === 127) return "LOOPBACK";
  if (a === 169 && b === 254) return "LINK_LOCAL";
  if (a === 100 && b >= 64 && b <= 127) return "CARRIER_GRADE_NAT";
  if (a === 192 && b === 0 && c === 2) return "DOCUMENTATION";
  if (a === 198 && (b === 18 || b === 19)) return "BENCHMARK";
  if (a === 198 && b === 51 && c === 100) return "DOCUMENTATION";
  if (a === 203 && b === 0 && c === 113) return "DOCUMENTATION";
  if (a >= 224) return "MULTICAST_OR_RESERVED";
  return null;
}

function normalizeDnsAnswerAddresses(values) {
  return Array.from(new Set((Array.isArray(values) ? values : [])
    .map(item => typeof item === "string" ? item : item && item.address)
    .filter(value => typeof value === "string" && net.isIP(value) === 4)))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

async function discoverDnsResolvers() {
  const startedAt = Date.now();
  const networkPath = await collectNetworkPathInfo();
  const configured = Array.isArray(networkPath.dnsServers) ? networkPath.dnsServers : [];
  const queryNames = ["example.com", "iana.org"];
  const samplingRounds = 3;
  const publicResolvers = [
    { server: "1.1.1.1", label: "CLOUDFLARE", source: "PUBLIC REFERENCE" },
    { server: "8.8.8.8", label: "GOOGLE PUBLIC DNS", source: "PUBLIC REFERENCE" },
    { server: "9.9.9.9", label: "QUAD9", source: "PUBLIC REFERENCE" }
  ];
  const candidates = new Map();
  const skipped = [];

  for (const entry of configured) {
    const server = String(entry || "").trim();
    if (net.isIP(server) !== 4) {
      if (server) skipped.push({ server, reason: "Only IPv4 DNS servers are queried by this release; IPv6 entries are listed as skipped." });
      continue;
    }
    const known = publicResolvers.find(item => item.server === server);
    const existing = candidates.get(server);
    if (existing) {
      if (!existing.sources.includes("SYSTEM CONFIGURATION")) existing.sources.push("SYSTEM CONFIGURATION");
    } else {
      candidates.set(server, {
        server,
        label: known ? known.label : "CONFIGURED DNS",
        sources: ["SYSTEM CONFIGURATION"]
      });
    }
  }

  for (const item of publicResolvers) {
    if (!candidates.has(item.server)) {
      candidates.set(item.server, { server: item.server, label: item.label, sources: [item.source] });
    } else {
      const current = candidates.get(item.server);
      if (!current.sources.includes(item.source)) current.sources.push(item.source);
    }
  }

  const medianOf = values => {
    const sorted = values.slice().sort((a, b) => a - b);
    if (!sorted.length) return 0;
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
  };

  const tested = await Promise.all(Array.from(candidates.values()).map(async candidate => {
    const checks = await Promise.all(queryNames.map(async host => {
      const attempts = await Promise.all(Array.from({ length: samplingRounds }, () => queryDnsResolver(candidate.server, host)));
      const successful = attempts.filter(item => item.ok === true);
      const answerGroups = new Map();
      for (const item of successful) {
        const addresses = normalizeDnsAnswerAddresses(item.addresses);
        const signature = addresses.join("|");
        if (!answerGroups.has(signature)) answerGroups.set(signature, { addresses, count: 0 });
        answerGroups.get(signature).count++;
      }
      const groups = Array.from(answerGroups.values()).sort((a, b) => b.count - a.count);
      const dominant = groups[0] || { addresses: [], count: 0 };
      const stable = dominant.count >= 2;
      const latencies = successful.map(item => Number(item.latencyMs) || 0);
      const medianLatencyMs = medianOf(latencies);
      const latencyRangeMs = latencies.length > 1 ? Math.max(...latencies) - Math.min(...latencies) : 0;
      const absoluteDeviations = latencies.map(value => Math.abs(value - medianLatencyMs));
      const jitterMs = medianOf(absoluteDeviations);
      const allAddresses = normalizeDnsAnswerAddresses(successful.flatMap(item => item.addresses || []));
      const nonPublicAddresses = allAddresses
        .map(address => ({ address, scope: classifyDnsAnswerAddress(address) }))
        .filter(item => item.scope)
        .map(item => item.address + " (" + item.scope + ")");
      return {
        host,
        ok: successful.length > 0,
        stable,
        status: stable ? "STABLE" : successful.length ? "UNSTABLE" : (attempts[0] && attempts[0].status) || "NO_RESPONSE",
        successfulSamples: successful.length,
        totalSamples: samplingRounds,
        stabilityPercent: Math.round(dominant.count / samplingRounds * 100),
        medianLatencyMs,
        latencyMs: medianLatencyMs,
        latencyRangeMs,
        jitterMs,
        addresses: stable ? dominant.addresses : allAddresses,
        nonPublicAddresses,
        answerVariants: groups.length,
        comparisonStatus: "PENDING",
        samples: attempts.map((item, index) => ({
          sample: index + 1,
          ok: item.ok === true,
          status: item.status || "UNKNOWN",
          latencyMs: Number(item.latencyMs) || 0,
          addresses: normalizeDnsAnswerAddresses(item.addresses)
        }))
      };
    }));

    const successfulChecks = checks.filter(check => check.ok).length;
    const stableChecks = checks.filter(check => check.stable).length;
    const successfulSamples = checks.reduce((sum, check) => sum + check.successfulSamples, 0);
    const totalSamples = queryNames.length * samplingRounds;
    const stableAnswers = checks.reduce((sum, check) => sum + (check.stable ? check.samples.filter(sample => sample.ok && sample.addresses.join("|") === check.addresses.join("|")).length : 0), 0);
    const latencyValues = checks.filter(check => check.stable).map(check => check.medianLatencyMs);
    const averageLatencyMs = latencyValues.length
      ? Math.round(latencyValues.reduce((sum, value) => sum + value, 0) / latencyValues.length)
      : 0;
    const allLatencies = checks.flatMap(check => check.samples.filter(sample => sample.ok).map(sample => sample.latencyMs));
    const overallMedianLatencyMs = medianOf(allLatencies);
    const overallLatencyRangeMs = allLatencies.length > 1 ? Math.max(...allLatencies) - Math.min(...allLatencies) : 0;
    const overallJitterMs = medianOf(allLatencies.map(value => Math.abs(value - overallMedianLatencyMs)));
    return {
      ...candidate,
      ok: stableChecks === queryNames.length,
      status: stableChecks === queryNames.length ? "RESPONDED" : stableChecks ? "PARTIAL" : successfulSamples ? "UNSTABLE" : "NO_RESPONSE",
      successfulChecks,
      stableChecks,
      totalChecks: queryNames.length,
      successfulSamples,
      totalSamples,
      samplingSuccessPercent: Math.round(successfulSamples / totalSamples * 100),
      answerStabilityPercent: successfulSamples ? Math.round(stableAnswers / successfulSamples * 100) : 0,
      latencyMs: averageLatencyMs || overallMedianLatencyMs,
      averageLatencyMs,
      medianLatencyMs: overallMedianLatencyMs,
      latencyRangeMs: overallLatencyRangeMs,
      jitterMs: overallJitterMs,
      addresses: checks[0] ? checks[0].addresses : [],
      checks,
      nonPublicAddresses: Array.from(new Set(checks.flatMap(check => check.nonPublicAddresses))),
      integrityStatus: "PENDING"
    };
  }));

  const domainComparisons = queryNames.map((host, checkIndex) => {
    const responders = tested.filter(item => item.checks[checkIndex] && item.checks[checkIndex].stable);
    const groups = new Map();
    for (const resolver of responders) {
      const addresses = resolver.checks[checkIndex].addresses.slice().sort();
      const signature = addresses.join("|");
      if (!groups.has(signature)) groups.set(signature, { addresses, servers: [] });
      groups.get(signature).servers.push(resolver.server);
    }

    const orderedGroups = Array.from(groups.entries()).map(([signature, group]) => ({
      signature,
      addresses: group.addresses,
      servers: group.servers,
      count: group.servers.length
    })).sort((a, b) => b.count - a.count);
    const majorityCount = orderedGroups.length ? orderedGroups[0].count : 0;
    const hasMajority = orderedGroups.length > 1 && majorityCount > responders.length / 2;

    for (const resolver of tested) {
      const check = resolver.checks[checkIndex];
      if (!check.stable) {
        check.comparisonStatus = check.ok ? "REPEAT_ANSWER_UNSTABLE" : "NOT_COMPARED";
        continue;
      }
      const matchingGroup = orderedGroups.find(group => group.servers.includes(resolver.server));
      if (orderedGroups.length === 1 && responders.length >= 2) {
        check.comparisonStatus = "MATCHES_ALL_RESPONDERS";
      } else if (hasMajority) {
        check.comparisonStatus = matchingGroup && matchingGroup.count === majorityCount
          ? "MATCHES_PEER_MAJORITY"
          : "DIFFERS_FROM_PEER_MAJORITY";
      } else if (orderedGroups.length > 1) {
        check.comparisonStatus = "INCONCLUSIVE_DIVERGENCE";
      } else {
        check.comparisonStatus = "NOT_ENOUGH_PEERS";
      }
    }

    let status = "INSUFFICIENT_DATA";
    if (responders.length >= 2 && orderedGroups.length === 1) status = "CONSISTENT";
    else if (hasMajority) status = "DIVERGENCE_REVIEW";
    else if (orderedGroups.length > 1) status = "INCONCLUSIVE_DIVERGENCE";

    return {
      host,
      responderCount: responders.length,
      distinctAnswerGroups: orderedGroups.length,
      status,
      groups: orderedGroups.map(({ addresses, servers, count }) => ({ addresses, servers, count })),
      note: orderedGroups.length > 1
        ? "Different stable A-record sets were observed. CDN, GeoDNS, split-horizon DNS, filtering, or regional routing can explain differences; this is not proof of poisoning."
        : responders.length >= 2
          ? "All stable responding resolvers returned the same A-record set in this snapshot."
          : "Fewer than two resolvers produced a repeat-stable answer set."
    };
  });

  for (const resolver of tested) {
    const flags = [];
    if (resolver.nonPublicAddresses.length) flags.push("NON_PUBLIC_ANSWER_REVIEW");
    if (resolver.checks.some(check => check.comparisonStatus === "DIFFERS_FROM_PEER_MAJORITY")) {
      flags.push("ANSWER_DIVERGENCE_REVIEW");
    }
    if (resolver.checks.some(check => check.comparisonStatus === "INCONCLUSIVE_DIVERGENCE")) {
      flags.push("INCONCLUSIVE_DIVERGENCE");
    }
    if (resolver.checks.some(check => check.ok && !check.stable)) flags.push("REPEAT_ANSWER_INSTABILITY");
    resolver.flags = flags;
    resolver.integrityStatus = flags.includes("NON_PUBLIC_ANSWER_REVIEW") || flags.includes("ANSWER_DIVERGENCE_REVIEW")
      ? "REVIEW"
      : flags.includes("INCONCLUSIVE_DIVERGENCE") || flags.includes("REPEAT_ANSWER_INSTABILITY")
        ? "INCONCLUSIVE" : "NO_DIVERGENCE_OBSERVED";
  }

  tested.sort((a, b) => {
    if (a.stableChecks !== b.stableChecks) return b.stableChecks - a.stableChecks;
    if (a.successfulSamples !== b.successfulSamples) return b.successfulSamples - a.successfulSamples;
    return a.averageLatencyMs - b.averageLatencyMs;
  });
  const eligible = tested.filter(item => item.stableChecks === queryNames.length);
  const best = eligible[0] || null;
  const nonPublicCount = tested.reduce((count, item) => count + item.nonPublicAddresses.length, 0);
  const divergenceReviewCount = domainComparisons.filter(item => item.status === "DIVERGENCE_REVIEW").length;
  const inconclusiveCount = domainComparisons.filter(item => item.status === "INCONCLUSIVE_DIVERGENCE").length;
  const unstableResolverCount = tested.filter(item => item.flags.includes("REPEAT_ANSWER_INSTABILITY")).length;
  const allSamples = tested.reduce((sum, item) => sum + item.successfulSamples, 0);
  const possibleSamples = tested.reduce((sum, item) => sum + item.totalSamples, 0);
  const sampleSuccessPercent = possibleSamples ? Math.round(allSamples / possibleSamples * 100) : 0;
  let integritySummary = "INSUFFICIENT RESPONDERS FOR COMPARISON";
  if (nonPublicCount) integritySummary = "NON-PUBLIC DNS ANSWER — REVIEW";
  else if (divergenceReviewCount) integritySummary = "DNS ANSWER DIVERGENCE — REVIEW";
  else if (inconclusiveCount) integritySummary = "MIXED DNS ANSWERS — INCONCLUSIVE";
  else if (unstableResolverCount) integritySummary = "REPEATED DNS ANSWERS VARY — INCONCLUSIVE";
  else if (domainComparisons.every(item => item.status === "CONSISTENT")) integritySummary = "RESPONDERS CONSISTENT";

  return {
    supported: true,
    platform: "WINDOWS",
    collectedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    queryNames,
    samplingRounds,
    samplesPerResolver: queryNames.length * samplingRounds,
    totalDnsQueries: tested.length * queryNames.length * samplingRounds,
    queryType: "A",
    transport: "DNS OVER UDP / PORT 53",
    configuredDnsServers: configured,
    testedCount: tested.length,
    respondingCount: tested.filter(item => item.successfulChecks > 0).length,
    completeRespondingCount: eligible.length,
    stableResolverCount: eligible.length,
    unstableResolverCount,
    sampleSuccessPercent,
    bestResolver: best ? { server: best.server, label: best.label, latencyMs: best.averageLatencyMs, jitterMs: best.jitterMs, answerStabilityPercent: best.answerStabilityPercent } : null,
    integritySummary,
    integrityNote: "Each resolver receives three samples for each of two names. A repeat-stable answer requires at least two matching successful A-record sets out of three. Repeat variation can result from load balancing, CDN/GeoDNS, regional routing, or transient network conditions; it is not proof of poisoning.",
    domainComparisons,
    servers: tested,
    skipped,
    systemChangesMade: false,
    limitations: "The active system DNS list and three fixed public IPv4 resolver references are queried directly for example.com and iana.org, three samples each over UDP/53. IPv6 DNS entries are listed as skipped. This is not a scan of all devices or all port-53 hosts on the LAN."
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


ipcMain.handle("byte-phantom:dns-discovery", async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const senderUrl = event.senderFrame && event.senderFrame.url;
  if (!win || typeof senderUrl !== "string" || !senderUrl.startsWith("file://")) {
    throw new Error("DNS resolver discovery is only available to the local BYTE PHANTOM desktop window.");
  }
  return discoverDnsResolvers();
});


function getDnsFailoverStatePath() {
  return path.join(app.getPath("userData"), "dns-failover-state.json");
}

async function readDnsFailoverSavedState() {
  try {
    const raw = await fs.readFile(getDnsFailoverStatePath(), "utf8");
    const parsed = JSON.parse(raw.replace(/^\uFEFF/, ""));
    return parsed && parsed.schema === 1 ? parsed : null;
  } catch (error) {
    if (error && error.code === "ENOENT") return null;
    throw error;
  }
}

async function getDnsFailoverState() {
  if (process.platform !== "win32") {
    const networkPath = await collectNetworkPathInfo();
    return {
      supported: true,
      platform: process.platform.toUpperCase(),
      interfaceName: networkPath.interfaceName || "ANDROID ACTIVE NETWORK",
      dnsServers: Array.isArray(networkPath.dnsServers) ? networkPath.dnsServers : [],
      managed: false,
      canApplyAutomatically: false,
      canOpenSystemSettings: false,
      instructions: "Android does not allow an ordinary app to change device-wide DNS directly. Use the Android network settings screen and enter the recommended DNS manually."
    };
  }

  const [networkPath, savedState] = await Promise.all([
    collectNetworkPathInfo(),
    readDnsFailoverSavedState()
  ]);
  return {
    supported: true,
    platform: "WINDOWS",
    interfaceName: networkPath.interfaceName || "UNKNOWN",
    dnsServers: Array.isArray(networkPath.dnsServers) ? networkPath.dnsServers : [],
    gateway: networkPath.gateway || "NOT FOUND",
    defaultRoute: networkPath.defaultRoute === true,
    managed: !!savedState,
    savedState: savedState ? {
      interfaceName: savedState.interfaceName,
      originalAutomaticDns: savedState.originalAutomaticDns === true || savedState.originalDhcp === true,
      originalDnsServers: Array.isArray(savedState.originalDnsServers) ? savedState.originalDnsServers : [],
      appliedDnsServers: Array.isArray(savedState.appliedDnsServers) ? savedState.appliedDnsServers : [],
      savedAt: savedState.savedAt || null,
      appliedAt: savedState.appliedAt || null
    } : null,
    canApplyAutomatically: true,
    requiresAdministrator: true,
    canRestore: !!savedState,
    instructions: "Applying DNS changes the selected Windows network adapter and triggers a Windows UAC Administrator prompt. The original DHCP/static DNS configuration is backed up locally before the change."
  };
}

function encodePowerShell(script) {
  return Buffer.from(String(script), "utf16le").toString("base64");
}

async function executeDnsMutationAsAdministrator(action, settings) {
  const outputPath = path.join(os.tmpdir(), "byte-phantom-dns-" + process.pid + "-" + Date.now() + ".json");
  const config = {
    ...settings,
    action,
    statePath: getDnsFailoverStatePath(),
    outputPath
  };
  const configBase64 = Buffer.from(JSON.stringify(config), "utf8").toString("base64");
  const innerScript = [
    "$ErrorActionPreference = 'Stop'",
    "$cfg = ConvertFrom-Json ([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('" + configBase64 + "')))",
    "try {",
    "  $adapter = Get-NetAdapter -Name $cfg.interfaceName -ErrorAction Stop",
    "  $interfaceIndex = [int]$adapter.ifIndex",
    "  $null = Get-NetIPInterface -InterfaceIndex $interfaceIndex -AddressFamily IPv4 -ErrorAction Stop",
    "  $currentDns = @(Get-DnsClientServerAddress -InterfaceIndex $interfaceIndex -AddressFamily IPv4 -ErrorAction Stop | ForEach-Object { $_.ServerAddresses } | Where-Object { $_ })",
    "  if ($cfg.action -eq 'apply') {",
    "    $saved = $null",
    "    if (Test-Path -LiteralPath $cfg.statePath) {",
    "      $saved = Get-Content -LiteralPath $cfg.statePath -Raw | ConvertFrom-Json",
    "      if ([int]$saved.interfaceIndex -ne $interfaceIndex -or [string]$saved.interfaceName -ne [string]$adapter.Name) { throw 'A DNS override is already saved for a different adapter. Restore it before switching adapters.' }",
    "      $expected = @($saved.appliedDnsServers)",
    "      if (($currentDns -join '|') -ne ($expected -join '|')) { throw 'The adapter DNS changed outside BYTE PHANTOM after the last apply. Restore or inspect the current configuration before applying another override.' }",
    "      $originalAutomaticDns = if ($null -ne $saved.PSObject.Properties['originalAutomaticDns']) { [bool]$saved.originalAutomaticDns } else { [bool]$saved.originalDhcp }",
    "      $originalDns = @($saved.originalDnsServers)",
    "      $savedAt = [string]$saved.savedAt",
    "    } else {",
    "      $registryPath = 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces\\{' + ([string]$adapter.InterfaceGuid).Trim('{}') + '}'",
      "$registryEntry = Get-ItemProperty -LiteralPath $registryPath -ErrorAction SilentlyContinue",
      "$registryNameServer = [string]$registryEntry.NameServer",
      "$originalAutomaticDns = [string]::IsNullOrWhiteSpace($registryNameServer)",
      "$originalDns = if ($originalAutomaticDns) { @($currentDns) } else { @($registryNameServer -split '[,\\s]+' | Where-Object { $_ }) }",
      "      $savedAt = [DateTime]::UtcNow.ToString('o')",
    "    }",
    "    $state = [ordered]@{ schema = 1; interfaceName = [string]$adapter.Name; interfaceIndex = $interfaceIndex; originalAutomaticDns = $originalAutomaticDns; originalDnsServers = $originalDns; appliedDnsServers = @($cfg.server); savedAt = $savedAt; appliedAt = [DateTime]::UtcNow.ToString('o') }",
    "    $state | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $cfg.statePath -Encoding UTF8",
    "    Set-DnsClientServerAddress -InterfaceIndex $interfaceIndex -ServerAddresses @([string]$cfg.server) -ErrorAction Stop",
    "    Start-Sleep -Milliseconds 350",
    "    $verifiedDns = @(Get-DnsClientServerAddress -InterfaceIndex $interfaceIndex -AddressFamily IPv4 -ErrorAction Stop | ForEach-Object { $_.ServerAddresses } | Where-Object { $_ })",
    "    if (($verifiedDns -join '|') -ne ([string]$cfg.server)) { throw 'Windows did not report the requested DNS server after the change. The original DNS backup remains available for restoration.' }",
    "    $result = [pscustomobject]@{ ok = $true; action = 'APPLIED'; interfaceName = [string]$adapter.Name; dnsServers = $verifiedDns; originalAutomaticDns = $originalAutomaticDns; originalDnsServers = $originalDns; savedAt = $savedAt; appliedAt = [DateTime]::UtcNow.ToString('o'); verified = $true }",
    "  } elseif ($cfg.action -eq 'restore') {",
    "    if (-not (Test-Path -LiteralPath $cfg.statePath)) { throw 'No BYTE PHANTOM DNS backup is available to restore.' }",
    "    $saved = Get-Content -LiteralPath $cfg.statePath -Raw | ConvertFrom-Json",
    "    if ([int]$saved.interfaceIndex -ne $interfaceIndex -or [string]$saved.interfaceName -ne [string]$adapter.Name) { throw 'The saved DNS backup belongs to a different adapter. Connect that adapter before restoring it.' }",
    "    $expected = @($saved.appliedDnsServers)",
    "    $matchesApplied = (($currentDns -join '|') -eq ($expected -join '|'))",
    "    if (-not $matchesApplied -and -not [bool]$cfg.forceRestore) {",
    "      $result = [pscustomobject]@{ ok = $false; requiresForce = $true; action = 'RESTORE_REVIEW_REQUIRED'; interfaceName = [string]$adapter.Name; currentDnsServers = $currentDns; expectedAppliedDnsServers = $expected; message = 'Current DNS differs from the last BYTE PHANTOM setting. Confirm explicitly before overwriting it with the original configuration.' }",
    "    } else {",
    "      if ([bool]$saved.originalAutomaticDns -or ($null -eq $saved.PSObject.Properties['originalAutomaticDns'] -and [bool]$saved.originalDhcp)) {",
    "        Set-DnsClientServerAddress -InterfaceIndex $interfaceIndex -ResetServerAddresses -ErrorAction Stop",
    "      } else {",
    "        $original = @($saved.originalDnsServers)",
    "        if ($original.Count -lt 1) { throw 'The saved static DNS list is empty; refusing to guess a replacement.' }",
    "        Set-DnsClientServerAddress -InterfaceIndex $interfaceIndex -ServerAddresses $original -ErrorAction Stop",
    "      }",
    "      Start-Sleep -Milliseconds 350",
    "      $restoredDns = @(Get-DnsClientServerAddress -InterfaceIndex $interfaceIndex -AddressFamily IPv4 -ErrorAction Stop | ForEach-Object { $_.ServerAddresses } | Where-Object { $_ })",
    "      $restoreAutomatic = ([bool]$saved.originalAutomaticDns -or ($null -eq $saved.PSObject.Properties['originalAutomaticDns'] -and [bool]$saved.originalDhcp))",
    "      if ($restoreAutomatic) {",
    "        $registryPath = 'HKLM:\\\\SYSTEM\\\\CurrentControlSet\\\\Services\\\\Tcpip\\\\Parameters\\\\Interfaces\\\\{' + [string]$adapter.InterfaceGuid + '}'",
    "        $registryEntry = Get-ItemProperty -LiteralPath $registryPath -ErrorAction SilentlyContinue",
    "        if (-not [string]::IsNullOrWhiteSpace([string]$registryEntry.NameServer)) { throw 'Automatic DNS restore could not be verified because the adapter still has a static NameServer value.' }",
    "      } else {",
    "        $original = @($saved.originalDnsServers)",
    "        if (($restoredDns -join '|') -ne ($original -join '|')) { throw 'Static DNS restore verification failed. The saved backup remains available.' }",
    "      }",
    "      Remove-Item -LiteralPath $cfg.statePath -Force -ErrorAction Stop",
    "      $result = [pscustomobject]@{ ok = $true; action = 'RESTORED'; interfaceName = [string]$adapter.Name; dnsServers = $restoredDns; restoredAutomaticDns = $restoreAutomatic; restoredOriginalDnsServers = @($saved.originalDnsServers); verified = $true }",
    "    }",
    "  } else { throw 'Unsupported DNS configuration action.' }",
    "  $result | ConvertTo-Json -Depth 6 -Compress | Set-Content -LiteralPath $cfg.outputPath -Encoding UTF8",
    "} catch {",
    "  @{ ok = $false; action = [string]$cfg.action; error = $_.Exception.Message; backupAvailable = (Test-Path -LiteralPath $cfg.statePath) } | ConvertTo-Json -Depth 5 -Compress | Set-Content -LiteralPath $cfg.outputPath -Encoding UTF8",
    "  exit 1",
    "}"
  ].join("\r\n");

  const innerEncoded = encodePowerShell(innerScript);
  const adminCheckScript = "$p = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent()); if ($p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { 'ADMIN' } else { 'USER' }";
  let isAdmin = false;
  try {
    const check = await execFileAsync("powershell.exe", [
      "-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", adminCheckScript
    ], { windowsHide: true, timeout: 8000, maxBuffer: 32 * 1024, encoding: "utf8" });
    isAdmin = String(check.stdout || "").trim().includes("ADMIN");
  } catch {
    isAdmin = false;
  }

  try {
    if (isAdmin) {
      await execFileAsync("powershell.exe", [
        "-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand", innerEncoded
      ], { windowsHide: true, timeout: 90000, maxBuffer: 128 * 1024, encoding: "utf8" }).catch(() => {});
    } else {
      const outerScript = [
        "$ErrorActionPreference = 'Stop'",
        "$cfg = ConvertFrom-Json ([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('" + configBase64 + "')))",
        "$childArgs = '-NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -EncodedCommand " + innerEncoded + "'",
        "try {",
        "  $child = Start-Process -FilePath (Join-Path $PSHOME 'powershell.exe') -ArgumentList $childArgs -Verb RunAs -Wait -PassThru",
        "  if (-not (Test-Path -LiteralPath $cfg.outputPath)) { @{ ok = $false; cancelled = $true; error = 'Administrator elevation was cancelled or the elevated operation did not return a result.' } | ConvertTo-Json -Compress | Set-Content -LiteralPath $cfg.outputPath -Encoding UTF8 }",
        "} catch {",
        "  $message = $_.Exception.Message",
        "  $cancelled = ($message -match '1223|cancel|canceled|cancelled')",
        "  @{ ok = $false; cancelled = $cancelled; error = $message } | ConvertTo-Json -Compress | Set-Content -LiteralPath $cfg.outputPath -Encoding UTF8",
        "}"
      ].join("\r\n");
      await execFileAsync("powershell.exe", [
        "-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand", encodePowerShell(outerScript)
      ], { windowsHide: true, timeout: 120000, maxBuffer: 128 * 1024, encoding: "utf8" });
    }

    const raw = await fs.readFile(outputPath, "utf8");
    return JSON.parse(raw.replace(/^\uFEFF/, "").trim());
  } finally {
    await fs.rm(outputPath, { force: true }).catch(() => {});
  }
}

async function applyDnsResolver(settings) {
  if (process.platform !== "win32") return { ok: false, supported: false, message: "Automatic system DNS changes are not supported on this platform." };
  const server = String(settings && settings.server || "").trim();
  const interfaceName = String(settings && settings.interfaceName || "").trim();
  if (net.isIP(server) !== 4) throw new Error("Select a valid IPv4 DNS resolver from the verified test results.");
  const answerScope = classifyDnsAnswerAddress(server);
  if (answerScope && answerScope !== "PRIVATE") throw new Error("This DNS address belongs to a non-routable or reserved IPv4 range and cannot be applied.");
  const networkPath = await collectNetworkPathInfo();
  if (!interfaceName || interfaceName !== networkPath.interfaceName) throw new Error("The selected adapter is no longer the active default-route interface. Refresh Network Radar and test again.");
  const state = await readDnsFailoverSavedState();
  if (state && state.interfaceName !== interfaceName) throw new Error("A DNS backup already exists for a different adapter. Restore it before applying DNS to another adapter.");
  const result = await executeDnsMutationAsAdministrator("apply", { interfaceName, server });
  if (result.ok) appendDnsFailoverAudit("APPLIED", interfaceName, [server]);
  return result;
}

async function restoreDnsResolver(options = {}) {
  if (process.platform !== "win32") return { ok: false, supported: false, message: "Use Android network settings to restore the previous network configuration." };
  const saved = await readDnsFailoverSavedState();
  if (!saved) return { ok: false, message: "No saved BYTE PHANTOM DNS backup was found." };
  const networkPath = await collectNetworkPathInfo();
  const interfaceName = String(saved.interfaceName || "");
  if (!interfaceName) throw new Error("The saved adapter name is missing.");
  const result = await executeDnsMutationAsAdministrator("restore", {
    interfaceName,
    forceRestore: options && options.forceRestore === true
  });
  if (result.ok) appendDnsFailoverAudit("RESTORED", interfaceName, result.dnsServers || []);
  return result;
}

async function appendDnsFailoverAudit(action, interfaceName, servers) {
  const file = path.join(app.getPath("userData"), "dns-failover-audit.json");
  let events = [];
  try {
    const parsed = JSON.parse(await fs.readFile(file, "utf8"));
    if (Array.isArray(parsed)) events = parsed;
  } catch {
    // A missing or unreadable local audit starts a fresh history.
  }
  events.unshift({
    at: new Date().toISOString(),
    action,
    interfaceName,
    dnsServers: Array.isArray(servers) ? servers : []
  });
  await fs.writeFile(file, JSON.stringify(events.slice(0, 40), null, 2), "utf8").catch(() => {});
}

ipcMain.handle("byte-phantom:dns-failover-state", async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const senderUrl = event.senderFrame && event.senderFrame.url;
  if (!win || typeof senderUrl !== "string" || !senderUrl.startsWith("file://")) {
    throw new Error("DNS failover state is only available to the local BYTE PHANTOM desktop window.");
  }
  return getDnsFailoverState();
});

ipcMain.handle("byte-phantom:dns-failover-apply", async (event, settings) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const senderUrl = event.senderFrame && event.senderFrame.url;
  if (!win || typeof senderUrl !== "string" || !senderUrl.startsWith("file://")) {
    throw new Error("DNS failover changes are only available to the local BYTE PHANTOM desktop window.");
  }
  return applyDnsResolver(settings || {});
});

ipcMain.handle("byte-phantom:dns-failover-restore", async (event, options) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const senderUrl = event.senderFrame && event.senderFrame.url;
  if (!win || typeof senderUrl !== "string" || !senderUrl.startsWith("file://")) {
    throw new Error("DNS restore is only available to the local BYTE PHANTOM desktop window.");
  }
  return restoreDnsResolver(options || {});
});

ipcMain.handle("byte-phantom:system-snapshot", async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const senderUrl = event.senderFrame && event.senderFrame.url;
  if (!win || typeof senderUrl !== "string" || !senderUrl.startsWith("file://")) {
    throw new Error("System inventory is only available to the local BYTE PHANTOM desktop window.");
  }
  return collectSystemSnapshot();
});

ipcMain.handle("byte-phantom:process-snapshot", async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const senderUrl = event.senderFrame && event.senderFrame.url;
  if (!win || typeof senderUrl !== "string" || !senderUrl.startsWith("file://")) throw new Error("Process inventory is only available to the local BYTE PHANTOM desktop window.");
  return collectProcessSnapshot();
});

ipcMain.handle("byte-phantom:file-integrity", async (event, settings = {}) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const senderUrl = event.senderFrame && event.senderFrame.url;
  if (!win || typeof senderUrl !== "string" || !senderUrl.startsWith("file://")) throw new Error("File integrity is only available to the local BYTE PHANTOM desktop window.");
  return hashSelectedFile(win, settings.expectedSha256 || "");
});

ipcMain.handle("byte-phantom:firewall-snapshot", async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const senderUrl = event.senderFrame && event.senderFrame.url;
  if (!win || typeof senderUrl !== "string" || !senderUrl.startsWith("file://")) {
    throw new Error("Firewall intelligence is only available to the local BYTE PHANTOM desktop window.");
  }
  return collectFirewallSnapshot();
});

ipcMain.handle("byte-phantom:camera-privacy-snapshot", async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const senderUrl = event.senderFrame && event.senderFrame.url;
  if (!win || typeof senderUrl !== "string" || !senderUrl.startsWith("file://")) {
    throw new Error("Camera privacy audit is only available to the local BYTE PHANTOM desktop window.");
  }
  return collectCameraPrivacySnapshot();
});

ipcMain.handle("byte-phantom:camera-privacy-settings", async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const senderUrl = event.senderFrame && event.senderFrame.url;
  if (!win || typeof senderUrl !== "string" || !senderUrl.startsWith("file://")) {
    throw new Error("Camera privacy settings are only available to the local BYTE PHANTOM desktop window.");
  }
  await shell.openExternal("ms-settings:privacy-webcam");
  return { opened: true, destination: "WINDOWS_CAMERA_PRIVACY_SETTINGS" };
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
