# BYTE PHANTOM v1.6.0

**DIGITAL GHOST · CYBERSECURITY & NETWORK INTELLIGENCE**

BYTE PHANTOM is a local-first Cybersecurity & Network Intelligence workstation. Version 1.6.0 brings the real NETWORK RADAR to both Windows desktop and Android.

## Real modules

### NETWORK RADAR — Windows + Android

The same interface and live monitoring logic now work on both platforms:

- Windows: Electron IPC, Windows private IPv4 interface enumeration, one ICMP echo request per target, and Get-NetNeighbor MAC/interface enrichment.
- Android: a local Capacitor Java plugin enumerates private IPv4 interfaces, runs one ICMP echo request per target through the Android system ping utility, and reads /proc/net/arp plus ip neigh for MAC and neighbor-state data.
- The UI refreshes neighbor data every 4 seconds and schedules an active rediscovery every 30 seconds.
- Live events include new devices, IP address changes, reappearing devices, and nodes no longer visible in recent neighbor snapshots.
- Each result includes subnet scopes, addresses targeted, probe counts, responding hosts, MAC addresses where available, and skipped-scope warnings.

**Scope and safety:** active discovery is restricted to RFC1918 private IPv4 subnets directly connected to the scanning device, with prefix lengths /22 through /30 and a maximum of 1,022 host addresses per scan. Each active sweep sends one ICMP echo request per target. The app does not scan ports, test credentials, exploit devices, scan the public internet, elevate privileges, or change network settings. An entry marked "NOT SEEN" is not proof that a device disconnected.

This cannot guarantee a complete list of every client connected to a router. Sleeping/offline devices, filtered ICMP, client isolation, separate VLANs/subnets, OEM restrictions, and unavailable ARP data can hide devices. For a definitive router client inventory, a supported router-management API is needed.

**Android emulator note:** an emulator may expose only its virtual NAT subnet. A physical phone scans the Wi-Fi/Ethernet LAN to which that phone is connected.

### SYSTEM INTELLIGENCE — Windows desktop

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

**BYTE-PHANTOM-v1.6.0-Windows-x64.exe**

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

**BYTE-PHANTOM-v1.6.0-Android-debug.apk**

This is a debug APK for testing, not a Play Store release.

## Version records

- Root file: VERSION
- Runtime metadata: web/version.json
- Package version: package.json
- Change history: CHANGELOG.md
