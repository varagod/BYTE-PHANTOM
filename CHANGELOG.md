# BYTE PHANTOM — Changelog

## v1.12.0 — DNS SERVER DISCOVERY & INTELLIGENCE
- Added a user-initiated resolver intelligence panel to NETWORK RADAR.
- Reads configured DNS server addresses from the active Windows interface or Android LinkProperties, then tests each configured IPv4 resolver directly using one DNS A query for example.com over UDP port 53.
- Adds fixed Cloudflare (1.1.1.1), Google Public DNS (8.8.8.8), and Quad9 (9.9.9.9) IPv4 reference resolvers for comparison, deduplicating configured matches.
- Displays resolver identity/source, direct response status, DNS response code, elapsed time, and returned A records; ranks responding resolvers by latency.
- Lists configured IPv6 DNS entries as skipped in this release rather than silently ignoring them.
- Results are retained as the latest local report in this app installation. No DNS settings are changed and no LAN-wide port scan is performed.
- Implemented direct UDP DNS query handling in Electron and the native Android Capacitor plugin.
- Updated both platform builds to v1.12.0.


## v1.11.0 — NETWORK FAILURE ISOLATION
- Expanded the manual connectivity report with the active interface, default IPv4 route, gateway, and configured DNS servers.
- Added exactly one ICMP echo test to the active private IPv4 gateway when available; a missing reply is reported as inconclusive because gateways may filter ping.
- Retained the system DNS lookup and two independent HTTPS/TLS requests, now with separate route, gateway, DNS, and web-path evidence.
- Added diagnosis guidance to distinguish likely DNS resolution failures, missing default routes, and HTTPS/TLS filtering or endpoint failures without claiming certainty from one probe.
- Implemented the same result contract in the Windows Electron main process and native Android Capacitor plugin.
- Diagnostics remain user-initiated and do not scan LAN peers, ports, credentials, or change network settings.
- Updated both platform build metadata to v1.11.0.


## v1.10.1 — WINDOWS STARTUP + ANDROID NATIVE BRIDGE HOTFIX
- Rebuilt the corrupted Windows Network Path PowerShell function as a valid line-array script; removed stray duplicated source fragments that prevented Electron's main process from parsing.
- Restored the Windows connectivity-diagnostics IPC handler and included gateway/DNS/default-route data in Network Radar results.
- Bundled the Capacitor 6 JavaScript runtime before app code and registered the Android NetworkRadar plugin through `Capacitor.registerPlugin('NetworkRadar')`, with a legacy shim fallback.
- Copied `capacitor.js` into both Android WebView assets and Windows desktop web assets so native plugin registration is available in static HTML builds.
- Incremented the release to v1.10.1 for fresh Windows and Android packages.


## v1.10.0 — NETWORK CONNECTIVITY DIAGNOSTICS
- Added a user-initiated system DNS lookup and two independent HTTPS connectivity checks to NETWORK RADAR on Windows and Android.
- Windows uses Node.js system DNS resolution and HTTPS requests through Electron's main process; Android uses InetAddress and HttpURLConnection in the native Capacitor plugin.
- Displays DNS resolution status, resolved addresses, HTTP status codes, and elapsed time for each HTTPS endpoint.
- HTTPS checks use fixed Microsoft and Google connectivity-check endpoints; success confirms reachability to at least one endpoint, not all websites.
- Diagnostics do not scan LAN hosts, ports, credentials, or change network settings.
- Updated release metadata and both platform build workflows to v1.10.0.


## v1.8.0 — NETWORK INTELLIGENCE / Observed LAN Map
- Added an interactive SVG Network Intelligence Dashboard inside NETWORK RADAR on Windows and Android.
- Plots the local scanning device and up to 18 recently observed peers from the existing Network Radar journal.
- Adds live counters for journaled peers, peers visible in the current observation window, ICMP responders, and records not seen recently.
- Shows directly connected subnet/interface scope chips and a selectable peer detail panel with observed IP, MAC, interface, neighbor state, and first/last-seen timestamps.
- Uses distinct visual states for ICMP responses, neighbor-only records, and historical records not seen recently.
- The map is a visualization of scan observations, not verified physical topology, router paths, or device-to-device connectivity.
- The dashboard adds no new network probes and remains within the existing private IPv4 scope and limits.
- Updated release metadata, documentation, and Windows/Android CI builds to v1.8.0.

## v1.7.0 — NETWORK RADAR / Persistent Local Journal
- Added a versioned on-device journal that survives closing and reopening BYTE PHANTOM on Windows and Android.
- Stores device first-seen / last-seen timestamps, current visibility state, and network-change events for up to 30 days.
- Caps retained history at 120 device records and 160 events to keep local storage bounded.
- Restores prior observations when Network Radar opens and marks older observations as NOT SEEN without treating that state as proof a device disconnected.
- Added JSON and CSV report copying for use in local files or spreadsheets, plus a clear-journal action.
- Network identifiers and timestamps remain in local app storage; reports are copied only after an explicit user action. No cloud sync or upload was added.
- Added responsive journal controls and first/last-seen timestamps to discovered-device cards.
- Updated release metadata and both platform CI builds to v1.7.0.

## v1.6.0 — NETWORK RADAR / Windows + Android Native Support
- Added a native Capacitor Java NetworkRadar plugin to the Android APK and registered it in MainActivity.
- Android now discovers directly connected private IPv4 subnets from its own active Wi-Fi/Ethernet interfaces.
- Android active sweeps send one ICMP echo request per target address using the system ping utility, then enrich results from /proc/net/arp and ip neigh when available.
- Added Android interface, subnet, target, responding-host, MAC, neighbor-state, and limitation data using the same response contract as Windows.
- Updated the shared UI bridge to use Electron IPC on Windows and the native Capacitor plugin on Android.
- The same live monitor now works on both platforms: neighbor refresh every 4 seconds, active rediscovery every 30 seconds, and events for new devices, IP changes, reappearance, and no-longer-visible nodes.
- Added an Android preparation script that installs the native Java files and verifies INTERNET / ACCESS_NETWORK_STATE manifest permissions after Capacitor project generation.
- No location, SSID, Wi-Fi scanning, or dangerous runtime permission is requested by this implementation.
- Kept private-LAN scope limited to /22 through /30 and a maximum of 1,022 host addresses per scan.
- Updated documentation and CI validation for both platform builds.

## v1.5.0 — NETWORK RADAR / Active LAN discovery
- Replaced passive-only neighbor-cache viewing with active private IPv4 host discovery on Windows.
- Builds target ranges from directly connected RFC1918 interfaces (/22 through /30), with a hard cap of 1,022 host addresses per active sweep.
- Sends one ICMP echo request per target host and enriches results with Windows ARP/neighbor-table MAC addresses and interface names.
- Adds continuous 4-second neighbor-table monitoring and a scheduled active rediscovery every 30 seconds.
- Adds live events for newly detected devices, IP-address changes, device reappearance, and nodes no longer visible in recent neighbor snapshots.
- Enlarged small UI font declarations by a further 10%.

## v1.4.1 — NETWORK RADAR / PowerShell command fix
- Fixed PowerShell command construction so the multiline Get-NetNeighbor filter is passed as valid script text.
- Set UTF-8 console output for interface names and neighbor metadata.
- Rebuilt both Windows and Android packages under the v1.4.1 version label.

## v1.4.0 — NETWORK RADAR / Passive LAN discovery
- Replaced the fictional NETWORK RADAR module with a real Windows-only passive IPv4 neighbor-cache reader.
- Lists private RFC1918 neighbor IP addresses, MAC addresses, interface aliases, and neighbor states.
- Lists active private IPv4 local interfaces and subnet prefixes.
- Documents that sleeping devices or uncached neighbors may not appear.
- Enlarged small UI and startup typography by 25%.
- Fixed the sidebar logo by embedding the image data directly in mark.svg and adding violet/cyan glow for Windows Electron rendering.
- Added a terminal command: radar.

## v1.3.0 — First Live Intelligence Module
- Added SYSTEM INTELLIGENCE, a real, read-only Windows host inventory.
- Reads Windows hostname and OS details, CPU model/core count, memory totals, disk capacity when available, and non-loopback IPv4 adapter metadata.
