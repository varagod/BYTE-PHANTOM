# BYTE PHANTOM v1.3.0

**DIGITAL GHOST · CYBERSECURITY & NETWORK INTELLIGENCE**

BYTE PHANTOM is evolving from a visual cyber simulator into a local-first Cybersecurity & Network Intelligence workstation. The v1.3.0 Windows desktop build introduces the first real capability: a read-only inventory of the Windows host running the app.

## v1.3.0 — Real capability

**SYSTEM INTELLIGENCE (Windows desktop only)** reads:
- Windows hostname, platform, OS release/version, and architecture
- CPU model, logical core count, and reported clock speed
- Total and available RAM
- System-volume capacity and available space (when Windows exposes it)
- Non-loopback IPv4 adapter names, IP addresses, and netmasks

This is a read-only snapshot. It does not send packets, probe networks, change system settings, request administrator privileges, read credentials, or collect MAC addresses. Data is displayed in the current app session and is not uploaded.

## Module status

Only SYSTEM INTELLIGENCE is live in v1.3.0. The remaining 11 operation cards are explicitly marked SIMULATION until each one is implemented and tested in a later version:

- NETWORK RADAR
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
- Dark cyberpunk interface with Matrix glyph rain and persistent ASCII overlays
- Local host radar, targeting reticle, telemetry plates, scanline and neon-edge effects
- Responsive dashboard, operation detail windows, activity history, and terminal
- Original procedural audio with independent music/effects controls
- Animated effects can be disabled in Settings and respect reduced-motion preferences

## Windows desktop build

Requirements for a local build: Node.js 24+.

~~~powershell
npm install
npm run desktop:dev
npm run desktop:build
~~~

The portable x64 executable is written to dist-desktop/ and named:

**BYTE-PHANTOM-v1.3.0-Windows-x64.exe**

The GitHub Actions workflow uploads a version-named artifact. The EXE is portable and does not require a separate app installer. It is not code-signed, so Windows SmartScreen may show an unverified publisher warning.

## Android debug build

The Android app retains the responsive interface, but the live SYSTEM INTELLIGENCE bridge is not available on Android yet. The operation explains that rather than showing fabricated Windows values.

Build prerequisites: Node.js 24+, JDK 17, Android SDK.

~~~powershell
npm install
npx cap add android
npx cap sync android
cd android
.gradlew.bat assembleDebug
~~~

The CI artifact is named:

**BYTE-PHANTOM-v1.3.0-Android-debug.apk**

This is a debug APK for testing, not a Play Store release.

## Version records
- Root file: VERSION
- Runtime metadata: web/version.json
- Package version: package.json
- Change history: CHANGELOG.md

