const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("bytePhantomDesktop", Object.freeze({
  toggleFullscreen: () => ipcRenderer.invoke("byte-phantom:toggle-fullscreen"),
  getWindowState: () => ipcRenderer.invoke("byte-phantom:window-state"),
  getSystemSnapshot: () => ipcRenderer.invoke("byte-phantom:system-snapshot"),
  getProcessSnapshot: () => ipcRenderer.invoke("byte-phantom:process-snapshot"),
  getFirewallSnapshot: () => ipcRenderer.invoke("byte-phantom:firewall-snapshot"),
  pickAndHashFile: (settings) => ipcRenderer.invoke("byte-phantom:file-integrity", settings || {}),
  getNetworkRadar: (options) => ipcRenderer.invoke("byte-phantom:network-radar", options || {}),
  runConnectivityDiagnostics: () => ipcRenderer.invoke("byte-phantom:connectivity-diagnostics"),
  discoverDnsResolvers: () => ipcRenderer.invoke("byte-phantom:dns-discovery"),
  getDnsFailoverState: () => ipcRenderer.invoke("byte-phantom:dns-failover-state"),
  applyDnsResolver: (settings) => ipcRenderer.invoke("byte-phantom:dns-failover-apply", settings || {}),
  restoreDnsResolver: (options) => ipcRenderer.invoke("byte-phantom:dns-failover-restore", options || {}),
  onFullscreenChanged: (callback) => {
    if (typeof callback !== "function") return () => {};
    const listener = () => callback();
    ipcRenderer.on("byte-phantom:fullscreen-changed", listener);
    return () => ipcRenderer.removeListener("byte-phantom:fullscreen-changed", listener);
  }
}));
