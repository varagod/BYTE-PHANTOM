# BYTE PHANTOM — Changelog

## v1.4.0 — NETWORK RADAR / Passive LAN discovery
- Replaced the fictional NETWORK RADAR module with a real Windows-only passive IPv4 neighbor-cache reader.
- Lists private RFC1918 neighbor IP addresses, MAC addresses, interface aliases, and neighbor states.
- Lists active private IPv4 local interfaces and subnet prefixes.
- Uses the built-in Windows Get-NetNeighbor table; no ping sweep, port scan, packet transmission, privilege escalation, or configuration changes.
- Documents that sleeping devices or uncached neighbors may not appear.
- Enlarged small UI and startup typography by 25%.
- Fixed the sidebar logo by embedding the image data directly in mark.svg and adding violet/cyan glow for Windows Electron rendering.
- Added a terminal command: radar.
- Version appears in About, the window title, VERSION, web/version.json, Windows EXE filename, and CI artifact names.
- Windows artifact: BYTE-PHANTOM-v1.4.0-Windows-x64.exe
- Android debug artifact: BYTE-PHANTOM-v1.4.0-Android-debug.apk

## v1.3.0 — First Live Intelligence Module
- Added SYSTEM INTELLIGENCE, a real, read-only Windows host inventory.
- Reads Windows hostname and OS details, CPU model/core count, memory totals, disk capacity when available, and non-loopback IPv4 adapter metadata.
- No network probes, packet transmission, privilege escalation, or system configuration changes.
