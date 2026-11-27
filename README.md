# BYTE PHANTOM v1.4.0

**DIGITAL GHOST · CYBERSECURITY & NETWORK INTELLIGENCE**

BYTE PHANTOM is a local-first Cybersecurity & Network Intelligence workstation. Version 1.4.0 adds real passive LAN neighbor discovery to the Windows desktop build and improves HUD typography and logo rendering.

## v1.4.0 — Real capabilities

### SYSTEM INTELLIGENCE (Windows desktop)
Reads local Windows hostname and OS details, CPU model/core count, memory totals, system-volume capacity when available, and non-loopback IPv4 adapter metadata.

### NETWORK RADAR (Windows desktop)
Reads the Windows IPv4 neighbor cache through the built-in `Get-NetNeighbor` cmdlet. It lists:
- Private RFC1918 IPv4 neighbors already present in the OS cache
- Neighbor MAC addresses and interface names
- Neighbor state (Reachable, Stale, Delay, Probe, or Permanent)
- Local private IPv4 interfaces and subnet prefixes

**Important limitation:** this is passive cache discovery, not a complete scan of every device connected to the router. Devices Windows has not recently contacted, sleeping devices, or expired cache entries may not appear. It sends no pings or packets, runs no port scans, does not require administrator rights, and makes no network or system configuration changes.

## Module status
The two live modules are SYSTEM INTELLIGENCE and NETWORK RADAR. The other ten operation cards remain marked SIMULATION until implemented and tested:
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

Future real modules will be limited to the local machine or systems the operator owns or is explicitly authorized to assess. No stealth access, unauthorized exploitation, or covert data collection is planned.

## Visual system
- Matrix glyph rain and persistent ASCII overlays
- Host radar, targeting reticle, telemetry plates, scanline and neon-edge effects
- Font sizes up to 25% larger for previously small interface text
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

**BYTE-PHANTOM-v1.4.0-Windows-x64.exe**

The GitHub Actions workflow uploads a version-named artifact. The EXE is portable and does not require a separate installer. It is not code-signed, so Windows SmartScreen may show an unverified publisher warning.

## Android debug build
The responsive interface and typography changes are included. Live SYSTEM INTELLIGENCE and NETWORK RADAR currently require the Windows desktop bridge; Android explains that limitation rather than showing invented results.

Build prerequisites: Node.js 24+, JDK 17, Android SDK.

~~~powershell
npm install
npx cap add android
npx cap sync android
cd android
.\gradlew.bat assembleDebug
~~~

CI artifact:

**BYTE-PHANTOM-v1.4.0-Android-debug.apk**

This is a debug APK for testing, not a Play Store release.

## Version records
- Root file: VERSION
- Runtime metadata: web/version.json
- Package version: package.json
- Change history: CHANGELOG.md
