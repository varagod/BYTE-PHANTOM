# BYTE PHANTOM — Changelog

## v1.5.0 — NETWORK RADAR / Active LAN discovery
- Replaced passive-only neighbor-cache viewing with active private IPv4 host discovery.
- Builds target ranges from the Windows PC's directly connected RFC1918 interfaces (/22 through /30), with a hard cap of 1,022 host addresses per active sweep.
- Sends one ICMP echo request per target host and enriches results with Windows ARP/neighbor-table MAC addresses and interface names.
- Adds continuous 4-second neighbor-table monitoring and a scheduled active rediscovery every 30 seconds.
- Adds live events for newly detected devices, IP-address changes, device reappearance, and nodes no longer visible in recent neighbor snapshots.
- Adds scan coverage, hosts-probed, ICMP-response, and current device metrics.
- Keeps scope limited to private LAN interfaces; no port scanning, credential testing, exploitation, external targets, privilege escalation, or system configuration changes.
- Documents limits: this is not a guaranteed complete router client list; client isolation, sleeping hosts, filtered ICMP, VLANs, and router-specific behavior may hide devices.
- Enlarged small UI font declarations by a further 10%.
- Windows and Android packages are rebuilt under the v1.5.0 label; real NETWORK RADAR remains Windows desktop only.

## v1.4.1 — NETWORK RADAR / PowerShell command fix
- Fixed PowerShell command construction so the multiline Get-NetNeighbor filter is passed as valid script text.
- Set UTF-8 console output for interface names and neighbor metadata.
- Rebuilt both Windows and Android packages under the v1.4.1 version label.

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

## v1.3.0 — First Live Intelligence Module
- Added SYSTEM INTELLIGENCE, a real, read-only Windows host inventory.
- Reads Windows hostname and OS details, CPU model/core count, memory totals, disk capacity when available, and non-loopback IPv4 adapter metadata.
- No network probes, packet transmission, privilege escalation, or system configuration changes.
