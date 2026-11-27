package com.varagod.bytephantom;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.LinkAddress;
import android.net.LinkProperties;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.RouteInfo;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.InputStreamReader;
import java.net.Inet4Address;
import java.net.InterfaceAddress;
import java.net.NetworkInterface;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.ConcurrentHashMap;

@CapacitorPlugin(name = "NetworkRadar")
public class NetworkRadarPlugin extends Plugin {
    private static final int MAX_TARGETS = 1022;
    private static final int PING_WORKERS = 48;
    private static final String PING_BINARY = "/system/bin/ping";
    private final ExecutorService scanExecutor = Executors.newSingleThreadExecutor();

    @PluginMethod
    public void scan(PluginCall call) {
        final boolean activeSweep = Boolean.TRUE.equals(call.getBoolean("activeSweep"));
        scanExecutor.execute(() -> {
            try {
                call.resolve(scanLocalNetwork(activeSweep));
            } catch (Exception exception) {
                String message = exception.getMessage();
                call.reject("Android Network Radar failed: " +
                    (message == null ? exception.getClass().getSimpleName() : message));
            }
        });
    }

    private JSObject scanLocalNetwork(boolean activeSweep) throws Exception {
        long startedAt = System.currentTimeMillis();
        List<InterfaceInfo> interfaces = collectPrivateInterfaces();
        ScanPlan plan = buildPlan(interfaces);
        Set<String> ownAddresses = new HashSet<>();
        Set<String> candidateIps = new HashSet<>();
        for (InterfaceInfo item : interfaces) ownAddresses.add(item.address);
        for (TargetInfo item : plan.targets) candidateIps.add(item.ip);

        Set<String> responding = ConcurrentHashMap.newKeySet();
        AtomicInteger started = new AtomicInteger(0);
        AtomicInteger completed = new AtomicInteger(0);
        AtomicInteger errors = new AtomicInteger(0);
        if (activeSweep && !plan.targets.isEmpty() && new File(PING_BINARY).canExecute()) {
            CountDownLatch latch = new CountDownLatch(plan.targets.size());
            ExecutorService pool = Executors.newFixedThreadPool(Math.min(PING_WORKERS, plan.targets.size()));
            for (TargetInfo target : plan.targets) {
                started.incrementAndGet();
                pool.execute(() -> {
                    Process ping = null;
                    try {
                        // One ICMP echo only. ProcessBuilder avoids shell parsing and command injection.
                        ping = new ProcessBuilder(PING_BINARY, "-c", "1", "-W", "1", target.ip)
                            .redirectErrorStream(true).start();
                        if (ping.waitFor() == 0) responding.add(target.ip);
                    } catch (InterruptedException interrupted) {
                        if (ping != null) ping.destroy();
                        Thread.currentThread().interrupt();
                    } catch (Exception failure) {
                        errors.incrementAndGet();
                    } finally {
                        completed.incrementAndGet();
                        latch.countDown();
                    }
                });
            }
            try {
                latch.await(25L, TimeUnit.SECONDS);
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
            } finally {
                pool.shutdownNow();
            }
        }

        Map<String, NeighborInfo> neighbors = new TreeMap<>(Comparator.comparingLong(NetworkRadarPlugin::ipv4ToLong));
        readProcArp(neighbors, candidateIps);
        readIpNeighbors(neighbors, candidateIps);
        for (String ip : responding) {
            if (!neighbors.containsKey(ip)) {
                TargetInfo target = plan.byIp.get(ip);
                neighbors.put(ip, new NeighborInfo(ip, "UNRESOLVED",
                    target == null ? "UNKNOWN INTERFACE" : target.interfaceName, "RESPONDING"));
            }
        }

        List<NeighborInfo> devices = new ArrayList<>();
        for (NeighborInfo item : neighbors.values()) {
            if (!candidateIps.contains(item.ip) || ownAddresses.contains(item.ip)) continue;
            item.responding = responding.contains(item.ip);
            devices.add(item);
        }
        Collections.sort(devices, Comparator.comparingLong(item -> ipv4ToLong(item.ip)));

        JSArray interfacesJson = new JSArray();
        for (InterfaceInfo item : interfaces) {
            JSObject json = new JSObject();
            json.put("name", item.name);
            json.put("address", item.address);
            json.put("netmask", item.netmask);
            json.put("prefix", item.prefix);
            json.put("cidr", item.address + "/" + item.prefix);
            interfacesJson.put(json);
        }

        JSArray scopesJson = new JSArray();
        for (ScopeInfo item : plan.scopes) {
            JSObject json = new JSObject();
            json.put("interfaceName", item.interfaceName);
            json.put("localAddress", item.localAddress);
            json.put("cidr", item.cidr);
            json.put("hostCount", item.hostCount);
            scopesJson.put(json);
        }

        JSArray skippedJson = new JSArray();
        for (SkippedScope item : plan.skipped) {
            JSObject json = new JSObject();
            json.put("interfaceName", item.interfaceName);
            json.put("cidr", item.cidr);
            json.put("reason", item.reason);
            skippedJson.put(json);
        }

        JSArray devicesJson = new JSArray();
        int respondingCount = 0;
        for (NeighborInfo item : devices) {
            JSObject json = new JSObject();
            json.put("ipAddress", item.ip);
            json.put("macAddress", item.mac);
            json.put("interfaceName", item.interfaceName);
            json.put("state", item.state);
            json.put("responding", item.responding);
            devicesJson.put(json);
            if (item.responding) respondingCount++;
        }

        JSObject result = new JSObject();
        result.put("supported", true);
        result.put("platform", "ANDROID");
        result.put("collectedAt", java.time.Instant.now().toString());
        result.put("durationMs", Math.max(0L, System.currentTimeMillis() - startedAt));
        result.put("source", "ANDROID ICMP + ARP / NEIGHBOR TABLE");
        result.put("discoveryMode", activeSweep ? "ACTIVE / ICMP + ARP" : "LIVE WATCH / ANDROID NEIGHBOR CACHE");
        result.put("activeSweep", activeSweep);
        result.put("networkPath", collectNetworkPathInfo());
        result.put("interfaces", interfacesJson);
        result.put("scopes", scopesJson);
        result.put("skippedScopes", skippedJson);
        result.put("targetCount", plan.targets.size());
        result.put("hostsProbed", started.get());
        result.put("probesCompleted", completed.get());
        result.put("probeErrors", errors.get());
        result.put("devices", devicesJson);
        result.put("deviceCount", devices.size());
        result.put("respondingCount", respondingCount);
        result.put("networkProbesPerformed", activeSweep && started.get() > 0);
        result.put("probeType", activeSweep ? "ONE ICMP ECHO REQUEST PER PRIVATE IPV4 HOST" : "PASSIVE NEIGHBOR-TABLE READ");
        result.put("systemChangesMade", false);
        result.put("limitations",
            "Android discovery is limited to directly connected private IPv4 subnets (/22 to /30, up to 1,022 host addresses per scan). " +
            "ICMP-blocked devices may still appear when ARP resolves. Sleeping/offline hosts, client isolation, separate VLANs/subnets, " +
            "OEM restrictions, and filtered ICMP can limit visibility. This is not a guaranteed complete router client list; " +
            "that requires a supported router-management API. Physical devices scan their connected Wi-Fi/Ethernet LAN; an emulator may expose only its virtual NAT subnet."
        );
        if (!new File(PING_BINARY).canExecute() && activeSweep) {
            result.put("probeWarning", "The Android ping utility is unavailable. Results may contain only devices already present in the neighbour cache.");
        } else if (activeSweep && completed.get() < started.get()) {
            result.put("probeWarning", "The active sweep reached its 25-second safety limit; some host probes may not have completed.");
        }
        return result;
    }

    private JSObject collectNetworkPathInfo() {
        JSObject result=new JSObject();JSArray dns=new JSArray();JSArray addresses=new JSArray();
        String gateway="NOT REPORTED",iface="UNKNOWN",transport="UNKNOWN",source="ANDROID CONNECTIVITYMANAGER / LINKPROPERTIES";boolean defaultRoute=false;
        try {
            ConnectivityManager manager=(ConnectivityManager)getContext().getSystemService(Context.CONNECTIVITY_SERVICE);
            Network active=manager==null?null:manager.getActiveNetwork();
            LinkProperties properties=active==null?null:manager.getLinkProperties(active);
            NetworkCapabilities caps=active==null?null:manager.getNetworkCapabilities(active);
            if(properties!=null){
                iface=properties.getInterfaceName()==null?"UNKNOWN":properties.getInterfaceName();
                for(RouteInfo route:properties.getRoutes())if(route.isDefaultRoute()&&route.getGateway()!=null){gateway=route.getGateway().getHostAddress();defaultRoute=true;break;}
                for(java.net.InetAddress server:properties.getDnsServers())dns.put(server.getHostAddress());
                for(LinkAddress address:properties.getLinkAddresses())if(address.getAddress() instanceof Inet4Address&&isPrivate(address.getAddress().getHostAddress()))addresses.put(address.getAddress().getHostAddress()+"/"+address.getPrefixLength());
            }
            if(caps!=null){if(caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI))transport="WI-FI";else if(caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET))transport="ETHERNET";else if(caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR))transport="CELLULAR";else if(caps.hasTransport(NetworkCapabilities.TRANSPORT_VPN))transport="VPN";else transport="OTHER";}
        }catch(Exception ignored){source="ANDROID CONNECTIVITY SNAPSHOT PARTIALLY AVAILABLE";}
        result.put("gateway",gateway);result.put("dnsServers",dns);result.put("transport",transport);result.put("interfaceName",iface);result.put("addresses",addresses);result.put("defaultRoute",defaultRoute);result.put("source",source);return result;
    }

    private List<InterfaceInfo> collectPrivateInterfaces() throws Exception {
        List<InterfaceInfo> found = new ArrayList<>();
        Enumeration<NetworkInterface> all = NetworkInterface.getNetworkInterfaces();
        if (all == null) return found;
        while (all.hasMoreElements()) {
            NetworkInterface network = all.nextElement();
            try {
                if (!network.isUp() || network.isLoopback() || network.isPointToPoint() || isTunnel(network.getName())) continue;
            } catch (Exception ignored) {
                continue;
            }
            for (InterfaceAddress entry : network.getInterfaceAddresses()) {
                if (!(entry.getAddress() instanceof Inet4Address)) continue;
                String ip = entry.getAddress().getHostAddress();
                if (!isPrivate(ip)) continue;
                int prefix = entry.getNetworkPrefixLength();
                found.add(new InterfaceInfo(network.getName(), ip, netmask(prefix), prefix));
            }
        }
        Collections.sort(found, Comparator.comparing(item -> item.name + "|" + item.address));
        return found;
    }

    private ScanPlan buildPlan(List<InterfaceInfo> interfaces) {
        ScanPlan plan = new ScanPlan();
        int addressBudget = 0;
        for (InterfaceInfo item : interfaces) {
            if (item.prefix < 22 || item.prefix > 30) {
                plan.skipped.add(new SkippedScope(item.name, item.address + "/" + item.prefix,
                    "Active discovery supports directly connected subnet sizes from /22 through /30 only."));
                continue;
            }
            long address = ipv4ToLong(item.address);
            long mask = (0xffffffffL << (32 - item.prefix)) & 0xffffffffL;
            long network = address & mask;
            long broadcast = network | (~mask & 0xffffffffL);
            int hostCount = (int) Math.max(0L, broadcast - network - 1L);
            String cidr = ipv4FromLong(network) + "/" + item.prefix;
            if (hostCount < 1 || addressBudget + hostCount > MAX_TARGETS) {
                plan.skipped.add(new SkippedScope(item.name, cidr,
                    "The active-discovery safety cap is 1,022 host addresses per scan."));
                continue;
            }
            plan.scopes.add(new ScopeInfo(item.name, item.address, cidr, hostCount));
            addressBudget += hostCount;
            for (long cursor = network + 1L; cursor < broadcast; cursor++) {
                String ip = ipv4FromLong(cursor);
                if (!ip.equals(item.address) && !plan.byIp.containsKey(ip)) {
                    plan.byIp.put(ip, new TargetInfo(ip, item.name));
                }
            }
        }
        plan.targets.addAll(plan.byIp.values());
        Collections.sort(plan.targets, Comparator.comparingLong(item -> ipv4ToLong(item.ip)));
        return plan;
    }

    private void readProcArp(Map<String, NeighborInfo> output, Set<String> allowed) {
        File file = new File("/proc/net/arp");
        if (!file.isFile() || !file.canRead()) return;
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            boolean first = true;
            while ((line = reader.readLine()) != null) {
                if (first) { first = false; continue; }
                String[] row = line.trim().split("\\s+");
                if (row.length < 6 || !allowed.contains(row[0])) continue;
                String mac = row[3].toUpperCase(Locale.ROOT);
                if (!validMac(mac) || "0x0".equalsIgnoreCase(row[2])) continue;
                output.put(row[0], new NeighborInfo(row[0], mac, row[5], "ARP CACHE"));
            }
        } catch (Exception ignored) {
            // Some Android OEM builds restrict /proc/net/arp; ip neigh is attempted next.
        }
    }

    private void readIpNeighbors(Map<String, NeighborInfo> output, Set<String> allowed) {
        Process process = null;
        try {
            process = new ProcessBuilder("/system/bin/ip", "neigh", "show").redirectErrorStream(true).start();
            if (!process.waitFor(1500L, TimeUnit.MILLISECONDS)) {
                process.destroy();
                return;
            }
            try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    String[] row = line.trim().split("\\s+");
                    if (row.length < 4 || !allowed.contains(row[0])) continue;
                    String device = "UNKNOWN INTERFACE";
                    String mac = "UNRESOLVED";
                    for (int i = 1; i < row.length - 1; i++) {
                        if ("dev".equals(row[i]) && i + 1 < row.length) device = row[i + 1];
                        if ("lladdr".equals(row[i]) && i + 1 < row.length) mac = row[i + 1].toUpperCase(Locale.ROOT);
                    }
                    String state = row[row.length - 1].toUpperCase(Locale.ROOT);
                    if (validMac(mac)) output.put(row[0], new NeighborInfo(row[0], mac, device, state));
                }
            }
        } catch (Exception ignored) {
            // /proc/net/arp remains the fallback if the ip utility is unavailable.
        } finally {
            if (process != null) process.destroy();
        }
    }

    private static boolean isPrivate(String ip) {
        long value = ipv4ToLong(ip);
        if (value < 0L) return false;
        int a = (int) ((value >>> 24) & 255L);
        int b = (int) ((value >>> 16) & 255L);
        return a == 10 || (a == 172 && b >= 16 && b <= 31) || (a == 192 && b == 168);
    }

    private static long ipv4ToLong(String address) {
        if (address == null) return -1L;
        String[] parts = address.split("\\.");
        if (parts.length != 4) return -1L;
        long value = 0L;
        try {
            for (String part : parts) {
                int octet = Integer.parseInt(part);
                if (octet < 0 || octet > 255) return -1L;
                value = (value << 8) | octet;
            }
            return value;
        } catch (NumberFormatException ignored) {
            return -1L;
        }
    }

    private static String ipv4FromLong(long value) {
        return ((value >>> 24) & 255L) + "." + ((value >>> 16) & 255L) + "." +
            ((value >>> 8) & 255L) + "." + (value & 255L);
    }

    private static String netmask(int prefix) {
        if (prefix < 0 || prefix > 32) return "0.0.0.0";
        long mask = prefix == 0 ? 0L : (0xffffffffL << (32 - prefix)) & 0xffffffffL;
        return ipv4FromLong(mask);
    }

    private static boolean validMac(String mac) {
        if (mac == null || !mac.matches("(?i)[0-9a-f]{2}(:[0-9a-f]{2}){5}")) return false;
        String value = mac.replace(":", "").toUpperCase(Locale.ROOT);
        return !value.equals("000000000000") && !value.equals("FFFFFFFFFFFF");
    }

    private static boolean isTunnel(String name) {
        if (name == null) return true;
        String value = name.toLowerCase(Locale.ROOT);
        return value.startsWith("lo") || value.startsWith("tun") || value.startsWith("wg") ||
            value.startsWith("ppp") || value.startsWith("rmnet") || value.startsWith("clat") ||
            value.startsWith("dummy") || value.startsWith("sit") || value.startsWith("ip6tnl");
    }

    private static final class InterfaceInfo {
        final String name, address, netmask;
        final int prefix;
        InterfaceInfo(String name, String address, String netmask, int prefix) {
            this.name = name; this.address = address; this.netmask = netmask; this.prefix = prefix;
        }
    }
    private static final class TargetInfo {
        final String ip, interfaceName;
        TargetInfo(String ip, String interfaceName) { this.ip = ip; this.interfaceName = interfaceName; }
    }
    private static final class ScopeInfo {
        final String interfaceName, localAddress, cidr;
        final int hostCount;
        ScopeInfo(String interfaceName, String localAddress, String cidr, int hostCount) {
            this.interfaceName = interfaceName; this.localAddress = localAddress; this.cidr = cidr; this.hostCount = hostCount;
        }
    }
    private static final class SkippedScope {
        final String interfaceName, cidr, reason;
        SkippedScope(String interfaceName, String cidr, String reason) {
            this.interfaceName = interfaceName; this.cidr = cidr; this.reason = reason;
        }
    }
    private static final class NeighborInfo {
        final String ip, mac, interfaceName, state;
        boolean responding;
        NeighborInfo(String ip, String mac, String interfaceName, String state) {
            this.ip = ip; this.mac = mac; this.interfaceName = interfaceName; this.state = state; this.responding = false;
        }
    }
    private static final class ScanPlan {
        final List<ScopeInfo> scopes = new ArrayList<>();
        final List<SkippedScope> skipped = new ArrayList<>();
        final List<TargetInfo> targets = new ArrayList<>();
        final Map<String, TargetInfo> byIp = new LinkedHashMap<>();
    }
}
