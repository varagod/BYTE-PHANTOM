# BYTE PHANTOM v1.15.0

**DIGITAL GHOST · CYBERSECURITY & NETWORK INTELLIGENCE**

BYTE PHANTOM is a local-first Cybersecurity & Network Intelligence workstation. Version 1.15.0 adds explicit DNS and HTTPS connectivity diagnostics to the persistent, cross-platform NETWORK RADAR.

## v1.15.0 hotfix

This patch repairs the Windows Electron main-process syntax error, restores the Windows diagnostics IPC route, and packages the Capacitor JavaScript runtime so the Android Network Radar plugin is registered and callable from the static HTML interface. Rebuild/install this patch rather than reusing a v1.10.0 APK or EXE.

## v1.15.0 — layered connectivity diagnosis

The Network Radar connectivity report now adds the active route/interface snapshot, one ICMP echo to the active private IPv4 gateway (when available), system DNS resolution for `example.com`, and two independent HTTPS/TLS checks. The report offers cautious interpretation: a gateway that does not answer ping may still forward traffic, and success against either HTTPS endpoint does not guarantee every site is reachable. These checks are started only by the operator and do not scan LAN peers or ports.

## v1.15.0 — DNS SERVER DISCOVERY & INTELLIGENCE

NETWORK RADAR includes a manual DNS stability and integrity test. It reads the active interface DNS list, tests each configured IPv4 resolver and compares it with Cloudflare (`1.1.1.1`), Google Public DNS (`8.8.8.8`), and Quad9 (`9.9.9.9`). Each resolver receives three direct DNS A-query samples for `example.com` and three for `iana.org` over UDP port 53. For each name, a repeat-stable answer requires at least two successful samples with the same normalized A-record set. The report shows sample success rate, answer consistency, median latency, latency range and median absolute deviation jitter. Cross-resolver comparison uses repeat-stable sets only. A resolver with varying repeated answers is marked inconclusive; DNS variation can be caused by load balancing, CDNs, GeoDNS, split-horizon policy or transient conditions and is not proof of poisoning. Recommendation is restricted to resolvers that return repeat-stable answers for both names and is ranked by median latency. Users can copy the IP manually; BYTE PHANTOM does not change system DNS settings. The last 20 report summaries are retained locally for up to 30 days, and the last eight tests appear as a response-rate bar trend. Configured IPv6 DNS entries are listed as skipped. No LAN-wide port scan is performed. The DNS FAILOVER CONTROL panel lets the user select only a repeat-stable IPv4 resolver. On Windows, applying a resolver changes only the active IPv4 default-route adapter, requires explicit in-app confirmation and a Windows UAC Administrator prompt, saves the original DNS mode (automatic/DHCP or static) and server list locally, then verifies the applied address. RESTORE ORIGINAL DNS returns to the saved mode/list; if the DNS values were changed outside BYTE PHANTOM after apply, a second confirmation is required before overwriting them. On Android, BYTE PHANTOM displays current DNS and opens system wireless/network settings so the user can edit DNS manually. The app does not use root privileges or create a VPN.

## v1.15.0 — DNS integrity review and history

The new DNS SERVER INTELLIGENCE panel compares A-record answers from two public names across the configured DNS list and three fixed public references. It marks non-public addresses and deviations from a clear peer majority, with an explicit warning that differences can have benign causes such as CDNs and GeoDNS. It recommends the fastest resolver that answered both names and lets the operator copy its IP, but does not apply the DNS configuration. Test summaries are stored locally for 30 days, up to 20 entries.

## Real modules

### NETWORK RADAR — Windows + Android

The same interface and live monitoring logic now work on both platforms:

- Windows: Electron IPC, Windows private IPv4 interface enumeration, one ICMP echo request per target, and Get-NetNeighbor MAC/interface enrichment.
- Android: a local Capacitor Java plugin enumerates private IPv4 interfaces, runs one ICMP echo request per target through the Android system ping utility, and reads /proc/net/arp plus ip neigh for MAC and neighbor-state data.
- The UI refreshes neighbor data every 4 seconds and schedules an active rediscovery every 30 seconds.
- Live events include new devices, IP address changes, reappearing devices, and nodes no longer visible in recent neighbor snapshots.
- Device records retain first-seen / last-seen timestamps and visibility state across app restarts.
- A local journal keeps up to 120 devices and 160 events for up to 30 days; reports can be copied as JSON or CSV, and the journal can be cleared from the radar panel.
- Each result includes subnet scopes, addresses targeted, probe counts, responding hosts, MAC addresses where available, and skipped-scope warnings.
- The Network Intelligence Dashboard plots up to 18 peers from the local journal and classifies them as ICMP responders, neighbor records, or not seen recently.
- Selecting a plotted peer shows its observed IP/MAC/interface/state and first/last-seen timestamps. The map lines describe scan observation relationships only; they are not physical links or confirmed router paths.

**Scope and safety:** active discovery is restricted to RFC1918 private IPv4 subnets directly connected to the scanning device, with prefix lengths /22 through /30 and a maximum of 1,022 host addresses per scan. Each active sweep sends one ICMP echo request per target. The app does not scan ports, test credentials, exploit devices, scan the public internet, elevate privileges, or change network settings. An entry marked "NOT SEEN" is not proof that a device disconnected.

This cannot guarantee a complete list of every client connected to a router. Sleeping/offline devices, filtered ICMP, client isolation, separate VLANs/subnets, OEM restrictions, and unavailable ARP data can hide devices. For a definitive router client inventory, a supported router-management API is needed.

**Android emulator note:** an emulator may expose only its virtual NAT subnet. A physical phone scans the Wi-Fi/Ethernet LAN to which that phone is connected.

**Local journal privacy:** the app stores IP/MAC/interface metadata and observation timestamps in this installation's local storage only. It does not sync or upload them. JSON and CSV reports are placed on the clipboard only after you press the matching copy action. The network map reads this same local journal and scan result; it performs no additional probes.

#### NETWORK CONNECTIVITY DIAGNOSTICS — Windows + Android

The operator can explicitly run a layered connectivity check from NETWORK RADAR. It reads the active interface, default route, gateway, and configured DNS servers; sends one ICMP echo to the active private IPv4 gateway when available; resolves `example.com` through the system resolver; and makes two HTTPS GET checks against fixed Microsoft and Google connectivity-check endpoints. A gateway that does not reply may simply filter ICMP. Each HTTPS result includes status, latency, and error details; success confirms reachability only to that endpoint, not every website. Diagnostics do not scan LAN hosts or ports, test credentials, or change network settings.

## SYSTEM INTELLIGENCE — Windows desktop

Reads local Windows hostname and OS details, CPU model/core count, memory totals, system-volume capacity when available, and non-loopback IPv4 adapter metadata. It remains Windows-only; NETWORK RADAR is cross-platform.

## Android permissions and native bridge

The Android app includes a small local Capacitor Java plugin registered from MainActivity. It uses only these normal Android permissions:

- INTERNET
- ACCESS_NETWORK_STATE

No location, nearby Wi-Fi, camera, or SSID permission is requested. The preparation script installs the plugin and verifies the manifest permissions after the Capacitor project is generated.

## Module status

The live modules are SYSTEM INTELLIGENCE (Windows) and NETWORK RADAR (Windows + Android). The other ten operation cards remain marked SIMULATION until implemented and tested:
- IP TRACE
- DEVICE INFILTRATION
- FIREWALL BREACH
- PASSWORD CRACKER
- CAMERA ACCESS
- SATELLITE LINK
- MAINFRAME OVERRIDE
- DATA EXTRACTION
- DIGITAL FORENSICS
- ENCRYPTION BREAKER

Future real modules will be limited to the local machine or systems the operator owns or is explicitly authorized to assess.

## Visual system

- Matrix glyph rain and persistent ASCII overlays
- Host radar, targeting reticle, telemetry plates, scanline and neon-edge effects
- Small interface text was enlarged in v1.4.0 and enlarged by a further 10% in v1.5.0
- Self-contained sidebar logo rendering with violet/cyan glow
- Responsive dashboard, operation windows, activity history, and terminal
- Original procedural audio with independent music/effects controls

## Windows desktop build

Requirements: Node.js 24+.

~~~powershell
npm install
npm run desktop:dev
npm run desktop:build
~~~

Portable x64 executable:

**BYTE-PHANTOM-v1.15.0-Windows-x64.exe**

The GitHub Actions workflow uploads a version-named artifact. The EXE is portable and does not require a separate installer. It is not code-signed, so Windows SmartScreen may show an unverified publisher warning.

## Android debug build

Requirements: Node.js 24+, JDK 17, Android SDK.

~~~powershell
npm install
npx cap add android
npx cap sync android
npm run android:prepare
cd android
.\gradlew.bat assembleDebug
~~~

CI artifact:

**BYTE-PHANTOM-v1.15.0-Android-debug.apk**

This is a debug APK for testing, not a Play Store release.

## Version records

- Root file: VERSION
- Runtime metadata: web/version.json
- Package version: package.json
- Change history: CHANGELOG.md
