# BYTE PHANTOM — Changelog

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
