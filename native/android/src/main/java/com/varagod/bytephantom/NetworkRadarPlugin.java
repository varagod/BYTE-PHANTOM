package com.varagod.bytephantom;

import android.content.Context;
import android.Manifest;
import android.app.AppOpsManager;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.app.ActivityManager;
import android.database.Cursor;
import android.net.Uri;
import android.os.Debug;
import android.provider.OpenableColumns;
import android.content.Intent;
import android.provider.Settings;
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
import com.getcapacitor.annotation.ActivityCallback;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.io.File;
import java.io.FileReader;
import java.io.InputStreamReader;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.URL;
import java.net.HttpURLConnection;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.SocketTimeoutException;
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
import java.util.Random;
import java.util.concurrent.Future;
import java.util.Set;
import java.util.TreeMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.json.JSONArray;
import org.json.JSONObject;
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

    @PluginMethod
    public void discoverDnsResolvers(PluginCall call) {
        scanExecutor.execute(() -> {
            try {
                call.resolve(runDnsResolverDiscovery());
            } catch (Exception exception) {
                call.reject("DNS resolver discovery failed: " +
                    (exception.getMessage() == null ? exception.getClass().getSimpleName() : exception.getMessage()));
            }
        });
    }

    @PluginMethod
    public void getDnsFailoverState(PluginCall call) {
        scanExecutor.execute(() -> {
            try {
                JSObject networkPath = collectNetworkPathInfo();
                JSObject result = new JSObject();
                result.put("supported", true);
                result.put("platform", "ANDROID");
                result.put("interfaceName", networkPath.optString("interfaceName", "ANDROID ACTIVE NETWORK"));
                JSONArray configured = networkPath.optJSONArray("dnsServers");
                JSArray dnsServers = new JSArray();
                if (configured != null) {
                    for (int i = 0; i < configured.length(); i++) dnsServers.put(configured.optString(i, ""));
                }
                result.put("dnsServers", dnsServers);
                result.put("managed", false);
                result.put("canApplyAutomatically", false);
                result.put("canOpenSystemSettings", true);
                result.put("networkPath", networkPath);
                result.put("instructions",
                    "Android does not allow an ordinary app to change device-wide DNS directly. Open Android network settings, choose the active Wi-Fi/mobile network and enter the recommended DNS manually. The app does not change settings or create a VPN.");
                call.resolve(result);
            } catch (Exception exception) {
                call.reject("Could not read Android DNS settings: " +
                    (exception.getMessage() == null ? exception.getClass().getSimpleName() : exception.getMessage()));
            }
        });
    }

    @PluginMethod
    public void openDnsSettings(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            try {
                Intent intent = new Intent(Settings.ACTION_WIRELESS_SETTINGS);
                getActivity().startActivity(intent);
                JSObject result = new JSObject();
                result.put("opened", true);
                result.put("automaticChange", false);
                result.put("message", "Android network settings opened. Select your active network and apply the copied DNS address manually.");
                call.resolve(result);
            } catch (Exception firstError) {
                try {
                    Intent fallback = new Intent(Settings.ACTION_SETTINGS);
                    getActivity().startActivity(fallback);
                    JSObject result = new JSObject();
                    result.put("opened", true);
                    result.put("automaticChange", false);
                    result.put("message", "Android settings opened. Navigate to Network & Internet to change DNS manually.");
                    call.resolve(result);
                } catch (Exception secondError) {
                    call.reject("Unable to open Android network settings: " + secondError.getMessage());
                }
            }
        });
    }

    @PluginMethod
    public void getCameraPrivacySnapshot(PluginCall call) {
        try {
            String packageName = getContext().getPackageName();
            PackageInfo packageInfo = getContext().getPackageManager().getPackageInfo(
                packageName, PackageManager.GET_PERMISSIONS
            );
            boolean permissionDeclared = false;
            if (packageInfo.requestedPermissions != null) {
                for (String permission : packageInfo.requestedPermissions) {
                    if (Manifest.permission.CAMERA.equals(permission)) {
                        permissionDeclared = true;
                        break;
                    }
                }
            }

            int permissionResult;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                permissionResult = getContext().checkSelfPermission(Manifest.permission.CAMERA);
            } else {
                permissionResult = getContext().getPackageManager().checkPermission(
                    Manifest.permission.CAMERA, packageName
                );
            }
            boolean permissionGranted = permissionResult == PackageManager.PERMISSION_GRANTED;

            String appOpMode = "UNAVAILABLE";
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                AppOpsManager appOps = (AppOpsManager) getContext().getSystemService(Context.APP_OPS_SERVICE);
                if (appOps != null) {
                    int mode = appOps.checkOpNoThrow(
                        AppOpsManager.OPSTR_CAMERA, android.os.Process.myUid(), packageName
                    );
                    if (mode == AppOpsManager.MODE_ALLOWED) appOpMode = "ALLOWED";
                    else if (mode == AppOpsManager.MODE_IGNORED) appOpMode = "IGNORED";
                    else if (mode == AppOpsManager.MODE_ERRORED) appOpMode = "ERRORED";
                    else if (mode == AppOpsManager.MODE_DEFAULT) appOpMode = "DEFAULT";
                    else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q &&
                        mode == AppOpsManager.MODE_FOREGROUND) appOpMode = "FOREGROUND";
                    else appOpMode = "UNKNOWN (" + mode + ")";
                }
            }

            JSObject result = new JSObject();
            result.put("supported", true);
            result.put("platform", "ANDROID");
            result.put("status", "OWN_APP_PERMISSION_SNAPSHOT");
            result.put("collectedAt", java.time.Instant.now().toString());
            result.put("packageName", packageName);
            result.put("cameraPermissionDeclared", permissionDeclared);
            result.put("cameraPermissionGranted", permissionGranted);
            result.put("cameraPermissionState", !permissionDeclared ? "NOT_DECLARED_BY_BYTE_PHANTOM" :
                (permissionGranted ? "GRANTED_TO_BYTE_PHANTOM" : "NOT_GRANTED_TO_BYTE_PHANTOM"));
            result.put("cameraAppOpMode", appOpMode);
            result.put("scope", "BYTE PHANTOM PACKAGE ONLY; DOES NOT ENUMERATE OTHER APPS OR DEVICE-WIDE CAMERA HISTORY");
            result.put("otherAppPermissionsInspected", false);
            result.put("cameraHardwareEnumerated", false);
            result.put("cameraOpened", false);
            result.put("cameraFramesCaptured", false);
            result.put("systemChangesMade", false);
            result.put("networkProbesPerformed", false);
            result.put("historyAvailable", false);
            call.resolve(result);
        } catch (Exception exception) {
            call.reject("Android camera privacy audit failed: " +
                (exception.getMessage() == null ? exception.getClass().getSimpleName() : exception.getMessage()), exception);
        }
    }

    @PluginMethod
    public void openCameraPrivacySettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_PRIVACY_SETTINGS);
            String destination = "ANDROID_PRIVACY_SETTINGS";
            if (intent.resolveActivity(getContext().getPackageManager()) == null) {
                intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                    Uri.parse("package:" + getContext().getPackageName()));
                destination = "ANDROID_APP_DETAILS";
            }
            if (intent.resolveActivity(getContext().getPackageManager()) == null) {
                call.reject("Android does not provide an available privacy settings activity.");
                return;
            }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            JSObject result = new JSObject();
            result.put("opened", true);
            result.put("destination", destination);
            result.put("cameraPermissionRequestedByApp", false);
            call.resolve(result);
        } catch (Exception exception) {
            call.reject("Could not open Android privacy settings: " +
                (exception.getMessage() == null ? exception.getClass().getSimpleName() : exception.getMessage()), exception);
        }
    }

    @PluginMethod
    public void getFirewallSnapshot(PluginCall call) {
        JSObject result = new JSObject();
        result.put("supported", false);
        result.put("platform", "ANDROID");
        result.put("status", "NOT_EXPOSED");
        result.put("reason", "Android's public APIs for ordinary applications do not expose a system-wide firewall profile or rule inventory. BYTE PHANTOM will not infer firewall status from VPN, DNS, captive-portal or network-validation signals.");
        result.put("scope", "NO GLOBAL FIREWALL RULES READ / NO NETWORK PROBES / NO SETTINGS CHANGED");
        result.put("systemChangesMade", false);
        result.put("elevatedPrivilegesRequested", false);
        result.put("networkProbesPerformed", false);
        call.resolve(result);
    }

    @PluginMethod
    public void getProcessSnapshot(PluginCall call) {
        scanExecutor.execute(() -> {
            try {
                ActivityManager manager = (ActivityManager) getContext().getSystemService(Context.ACTIVITY_SERVICE);
                ActivityManager.MemoryInfo systemMemory = new ActivityManager.MemoryInfo();
                if (manager != null) manager.getMemoryInfo(systemMemory);
                Runtime runtime = Runtime.getRuntime();
                Debug.MemoryInfo appMemory = new Debug.MemoryInfo();
                Debug.getMemoryInfo(appMemory);
                JSObject process = new JSObject();
                process.put("name", getContext().getPackageName());
                process.put("pid", android.os.Process.myPid());
                process.put("uid", android.os.Process.myUid());
                process.put("memoryPssBytes", Math.max(0L, (long) appMemory.getTotalPss() * 1024L));
                process.put("heapUsedBytes", Math.max(0L, runtime.totalMemory() - runtime.freeMemory()));
                process.put("heapAllocatedBytes", runtime.totalMemory());
                process.put("heapMaxBytes", runtime.maxMemory());
                JSObject memory = new JSObject();
                memory.put("totalBytes", systemMemory.totalMem);
                memory.put("availableBytes", systemMemory.availMem);
                memory.put("lowMemory", systemMemory.lowMemory);
                memory.put("thresholdBytes", systemMemory.threshold);
                JSObject result = new JSObject();
                result.put("supported", true);
                result.put("platform", "ANDROID");
                result.put("collectedAt", java.time.Instant.now().toString());
                result.put("process", process);
                result.put("systemMemory", memory);
                result.put("totalCount", 1);
                result.put("returnedCount", 1);
                result.put("truncated", true);
                result.put("scope", "ANDROID PRIVACY LIMIT: CURRENT BYTE PHANTOM APP PROCESS ONLY; OTHER APPS' PROCESS DETAILS ARE NOT ENUMERATED");
                result.put("systemChangesMade", false);
                result.put("networkProbesPerformed", false);
                call.resolve(result);
            } catch (Exception exception) {
                call.reject("Android process snapshot failed: " +
                    (exception.getMessage() == null ? exception.getClass().getSimpleName() : exception.getMessage()));
            }
        });
    }

    @PluginMethod
    public void pickAndHashFile(PluginCall call) {
        String expected = call.getString("expectedSha256");
        expected = expected == null ? "" : expected.trim().toLowerCase(Locale.ROOT);
        if (!expected.isEmpty() && !expected.matches("[0-9a-f]{64}")) {
            call.reject("Expected SHA-256 must contain exactly 64 hexadecimal characters.");
            return;
        }
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        startActivityForResult(call, intent, "handleFileIntegritySelection");
    }

    @ActivityCallback
    private void handleFileIntegritySelection(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result == null || result.getResultCode() != android.app.Activity.RESULT_OK ||
            result.getData() == null || result.getData().getData() == null) {
            JSObject cancelled = new JSObject();
            cancelled.put("supported", true);
            cancelled.put("cancelled", true);
            cancelled.put("platform", "ANDROID");
            call.resolve(cancelled);
            return;
        }
        Uri uri = result.getData().getData();
        String expected = call.getString("expectedSha256");
        expected = expected == null ? "" : expected.trim().toLowerCase(Locale.ROOT);
        final String expectedHash = expected;
        scanExecutor.execute(() -> {
            try {
                String fileName = uri.getLastPathSegment() == null ? "Selected document" : uri.getLastPathSegment();
                Cursor cursor = null;
                try {
                    cursor = getContext().getContentResolver().query(uri, new String[] {OpenableColumns.DISPLAY_NAME}, null, null, null);
                    if (cursor != null && cursor.moveToFirst()) {
                        int nameColumn = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                        if (nameColumn >= 0) fileName = cursor.getString(nameColumn);
                    }
                } finally {
                    if (cursor != null) cursor.close();
                }
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                long bytesRead = 0L;
                try (InputStream input = getContext().getContentResolver().openInputStream(uri)) {
                    if (input == null) throw new IOException("The selected document provider did not return a readable stream.");
                    byte[] buffer = new byte[64 * 1024];
                    int count;
                    while ((count = input.read(buffer)) != -1) {
                        digest.update(buffer, 0, count);
                        bytesRead += count;
                    }
                }
                StringBuilder hex = new StringBuilder(64);
                for (byte value : digest.digest()) hex.append(String.format(Locale.ROOT, "%02x", value & 0xff));
                String sha256 = hex.toString();
                String mimeType = getContext().getContentResolver().getType(uri);
                JSObject resultData = new JSObject();
                resultData.put("supported", true);
                resultData.put("cancelled", false);
                resultData.put("platform", "ANDROID");
                resultData.put("fileName", fileName);
                resultData.put("mimeType", mimeType == null ? "" : mimeType);
                resultData.put("sizeBytes", bytesRead);
                resultData.put("sha256", sha256);
                resultData.put("expectedSha256", expectedHash.isEmpty() ? JSONObject.NULL : expectedHash);
                resultData.put("match", expectedHash.isEmpty() ? JSONObject.NULL : Boolean.valueOf(sha256.equals(expectedHash)));
                resultData.put("stableRead", JSONObject.NULL);
                resultData.put("collectedAt", java.time.Instant.now().toString());
                resultData.put("scope", "USER-SELECTED ANDROID DOCUMENT PROVIDER / STREAMED READ-ONLY SHA-256 / NO UPLOAD / NO FILE MODIFICATION");
                resultData.put("providerNote", "Android document providers may expose local or cloud-backed files. A cloud provider may fetch the selected content when opened.");
                resultData.put("systemChangesMade", false);
                call.resolve(resultData);
            } catch (NoSuchAlgorithmException exception) {
                call.reject("SHA-256 is unavailable on this Android runtime.", exception);
            } catch (Exception exception) {
                call.reject("Could not read and hash the selected document: " +
                    (exception.getMessage() == null ? exception.getClass().getSimpleName() : exception.getMessage()), exception);
            }
        });
    }

    @PluginMethod
    public void diagnoseConnectivity(PluginCall call) {
        scanExecutor.execute(() -> {
            try { call.resolve(runConnectivityDiagnostics()); }
            catch (Exception exception) { call.reject("Connectivity diagnostics failed: " + (exception.getMessage()==null?exception.getClass().getSimpleName():exception.getMessage())); }
        });
    }

    private JSObject runConnectivityDiagnostics() {
        long startedAt=System.currentTimeMillis();JSObject networkPath=collectNetworkPathInfo();
        JSObject gatewayProbe=checkDefaultGateway(networkPath.optString("gateway","NOT REPORTED"));
        String[] dnsHosts={"example.com","iana.org","cloudflare.com"};
        String[] endpoints={"https://www.msftconnecttest.com/connecttest.txt","https://connectivitycheck.gstatic.com/generate_204","https://cp.cloudflare.com/generate_204","https://captive.apple.com/hotspot-detect.html"};
        int[][] expectedCodes={{200},{200,204},{200,204},{200}};
        String[] expectedBodies={"Microsoft Connect Test","","","Success"};
        boolean[] emptyBodies={false,true,true,false};
        ExecutorService executor=Executors.newFixedThreadPool(dnsHosts.length+endpoints.length);
        List<Future<JSObject>> dnsJobs=new ArrayList<>(),httpsJobs=new ArrayList<>();
        JSArray dnsChecks=new JSArray(),httpsResults=new JSArray();JSObject primaryDns=new JSObject();
        try{
            for(String host:dnsHosts)dnsJobs.add(executor.submit(()->checkSystemDns(host)));
            for(int i=0;i<endpoints.length;i++){final int index=i;httpsJobs.add(executor.submit(()->checkHttpsEndpoint(endpoints[index],expectedCodes[index],expectedBodies[index],emptyBodies[index])));}
            for(int i=0;i<dnsJobs.size();i++){JSObject row=awaitConnectivityProbe(dnsJobs.get(i),"DNS",dnsHosts[i]);dnsChecks.put(row);if(i==0)primaryDns=row;}
            for(int i=0;i<httpsJobs.size();i++)httpsResults.put(awaitConnectivityProbe(httpsJobs.get(i),"HTTPS",endpoints[i]));
        }finally{executor.shutdownNow();}
        JSObject result=new JSObject();result.put("supported",true);result.put("platform","ANDROID");
        result.put("collectedAt",java.time.Instant.now().toString());result.put("durationMs",Math.max(0L,System.currentTimeMillis()-startedAt));
        result.put("networkPath",networkPath);result.put("gatewayProbe",gatewayProbe);result.put("dns",primaryDns);
        result.put("dnsChecks",dnsChecks);result.put("https",httpsResults);result.put("systemChangesMade",false);
        result.put("scope","ACTIVE ROUTE + ANDROID CAPTIVE PORTAL CAPABILITY + GATEWAY ICMP + THREE SYSTEM DNS LOOKUPS + FOUR STRICT HTTPS RESPONSE-INTEGRITY PROBES");
        return result;
    }

    private JSObject checkSystemDns(String host){
        long started=System.currentTimeMillis();JSObject result=new JSObject();JSArray addresses=new JSArray();
        try{InetAddress[] resolved=InetAddress.getAllByName(host);for(InetAddress address:resolved)addresses.put(address.getHostAddress());result.put("host",host);result.put("ok",resolved.length>0);result.put("addresses",addresses);}
        catch(Exception error){result.put("host",host);result.put("ok",false);result.put("addresses",addresses);result.put("error",error.getClass().getSimpleName()+": "+String.valueOf(error.getMessage()));}
        result.put("latencyMs",Math.max(0L,System.currentTimeMillis()-started));return result;
    }

    private JSObject awaitConnectivityProbe(Future<JSObject> future,String kind,String target){
        try{return future.get(6500L,TimeUnit.MILLISECONDS);}
        catch(Exception error){
            future.cancel(true);if(error instanceof InterruptedException)Thread.currentThread().interrupt();
            JSObject failed=new JSObject();failed.put("ok",false);failed.put("latencyMs",6500);failed.put("error",error.getClass().getSimpleName()+": "+String.valueOf(error.getMessage()));
            if("DNS".equals(kind)){failed.put("host",target);failed.put("addresses",new JSArray());}
            else{failed.put("url",target);failed.put("responseReceived",false);failed.put("statusCode",0);failed.put("bodyMatches",false);failed.put("redirected",false);failed.put("portalSignal",false);failed.put("responseIntegrity","PROBE_TIMEOUT");}
            return failed;
        }
    }

    private JSObject checkHttpsEndpoint(String endpoint,int[] expectedCodes,String expectedBody,boolean requireEmptyBody){
        long started=System.currentTimeMillis();HttpURLConnection connection=null;JSObject result=new JSObject();
        try{
            connection=(HttpURLConnection)new URL(endpoint).openConnection();connection.setRequestMethod("GET");connection.setConnectTimeout(5000);connection.setReadTimeout(5000);
            connection.setInstanceFollowRedirects(false);connection.setUseCaches(false);connection.setRequestProperty("User-Agent","BYTE-PHANTOM-Network-Diagnostics/1.19.0");
            int status=connection.getResponseCode();String location=connection.getHeaderField("Location");
            boolean redirected=(status>=300&&status<400)||(location!=null&&!location.trim().isEmpty());String locationHost="";
            if(location!=null&&!location.trim().isEmpty())try{locationHost=new URL(new URL(endpoint),location).getHost().toLowerCase(Locale.ROOT);}catch(Exception ignored){}
            ByteArrayOutputStream body=new ByteArrayOutputStream();int responseBytes=0;boolean truncated=false;
            java.io.InputStream stream=status>=400?connection.getErrorStream():connection.getInputStream();
            if(stream!=null)try(java.io.InputStream input=stream){byte[] buffer=new byte[512];int count;while((count=input.read(buffer))!=-1){responseBytes+=count;int keep=Math.min(count,Math.max(0,4096-body.size()));if(keep>0)body.write(buffer,0,keep);if(body.size()>=4096){truncated=true;break;}}}
            String text=new String(body.toByteArray(),StandardCharsets.UTF_8);boolean statusMatches=false;for(int expected:expectedCodes)if(status==expected)statusMatches=true;
            boolean bodyMatches=requireEmptyBody?responseBytes==0:text.contains(expectedBody);boolean ok=statusMatches&&bodyMatches&&!redirected;
            result.put("url",endpoint);result.put("statusCode",status);result.put("expectedStatusCode",expectedCodes.length==1?String.valueOf(expectedCodes[0]):expectedCodes[0]+" OR "+expectedCodes[1]);
            result.put("ok",ok);result.put("responseReceived",true);result.put("bodyMatches",bodyMatches);result.put("responseBytes",responseBytes);result.put("bodyTruncated",truncated);
            result.put("contentType",connection.getContentType()==null?"":connection.getContentType());result.put("redirected",redirected);result.put("locationHost",locationHost);
            result.put("responseIntegrity",ok?"VALIDATED":redirected?"REDIRECTED":!statusMatches?"STATUS_MISMATCH":"CONTENT_MISMATCH");
            result.put("portalSignal",status==511||redirected||(status>=200&&status<300&&!ok));
            if(location!=null&&!location.trim().isEmpty())result.put("location",location.substring(0,Math.min(256,location.length())));
        }catch(Exception error){
            result.put("url",endpoint);result.put("statusCode",0);result.put("ok",false);result.put("responseReceived",false);result.put("bodyMatches",false);
            result.put("responseBytes",0);result.put("redirected",false);result.put("locationHost","");result.put("responseIntegrity","NO_HTTP_RESPONSE");result.put("portalSignal",false);
            result.put("error",error.getClass().getSimpleName()+": "+String.valueOf(error.getMessage()));
        }finally{if(connection!=null)connection.disconnect();}
        result.put("latencyMs",Math.max(0L,System.currentTimeMillis()-started));return result;
    }

    private JSObject checkDefaultGateway(String gateway) {
        long started = System.currentTimeMillis();
        JSObject result = new JSObject();
        result.put("gateway", gateway == null || gateway.trim().isEmpty() ? "NOT REPORTED" : gateway);

        if (!isPrivate(gateway) || !new File(PING_BINARY).canExecute()) {
            result.put("supported", false);
            result.put("replied", false);
            result.put("status", "SKIPPED");
            result.put("latencyMs", Math.max(0L, System.currentTimeMillis() - started));
            result.put("reason", !isPrivate(gateway)
                ? "No private IPv4 default gateway is available on the active route."
                : "The Android ping utility is unavailable on this device.");
            return result;
        }

        Process process = null;
        try {
            process = new ProcessBuilder(PING_BINARY, "-c", "1", "-W", "1", gateway)
                .redirectErrorStream(true)
                .start();
            int exitCode = process.waitFor();
            result.put("supported", true);
            result.put("replied", exitCode == 0);
            result.put("status", exitCode == 0 ? "REPLIED" : "NO_REPLY");
            result.put("method", "ONE ICMP ECHO REQUEST");
        } catch (InterruptedException interrupted) {
            if (process != null) process.destroy();
            Thread.currentThread().interrupt();
            result.put("supported", true);
            result.put("replied", false);
            result.put("status", "INTERRUPTED");
            result.put("error", "Gateway probe was interrupted.");
        } catch (Exception error) {
            if (process != null) process.destroy();
            result.put("supported", true);
            result.put("replied", false);
            result.put("status", "ERROR");
            result.put("error", error.getClass().getSimpleName() + ": " + String.valueOf(error.getMessage()));
        } finally {
            if (process != null) process.destroy();
        }

        result.put("latencyMs", Math.max(0L, System.currentTimeMillis() - started));
        return result;
    }

    private JSObject checkHttpsEndpoint(String endpoint) {
        long started=System.currentTimeMillis();HttpURLConnection connection=null;JSObject result=new JSObject();
        try {connection=(HttpURLConnection)new URL(endpoint).openConnection();connection.setRequestMethod("GET");connection.setConnectTimeout(4500);connection.setReadTimeout(4500);connection.setInstanceFollowRedirects(true);connection.setUseCaches(false);int status=connection.getResponseCode();result.put("url",endpoint);result.put("statusCode",status);result.put("ok",status>=200&&status<400);}
        catch(Exception error){result.put("url",endpoint);result.put("statusCode",0);result.put("ok",false);result.put("error",error.getClass().getSimpleName()+": "+String.valueOf(error.getMessage()));}
        finally{if(connection!=null)connection.disconnect();}
        result.put("latencyMs",Math.max(0L,System.currentTimeMillis()-started));return result;
    }

    private JSObject runDnsResolverDiscovery() {
        long startedAt = System.currentTimeMillis();
        JSObject networkPath = collectNetworkPathInfo();
        JSONArray configuredJson = networkPath.optJSONArray("dnsServers");
        List<String> configured = new ArrayList<>();
        if (configuredJson != null) {
            for (int i = 0; i < configuredJson.length(); i++) {
                String value = configuredJson.optString(i, "").trim();
                if (!value.isEmpty()) configured.add(value);
            }
        }

        String[] queryNames = new String[] {"example.com", "iana.org"};
        final int samplingRounds = 3;
        LinkedHashMap<String, DnsCandidate> candidates = new LinkedHashMap<>();
        JSArray skipped = new JSArray();
        for (String server : configured) {
            if (!isIPv4Literal(server)) {
                JSObject skip = new JSObject();
                skip.put("server", server);
                skip.put("reason", "Only IPv4 DNS servers are queried by this release; IPv6 entries are listed as skipped.");
                skipped.put(skip);
                continue;
            }
            DnsCandidate existing = candidates.get(server);
            if (existing == null) {
                String known = knownResolverLabel(server);
                existing = new DnsCandidate(server, known == null ? "CONFIGURED DNS" : known);
                existing.sources.add("SYSTEM CONFIGURATION");
                candidates.put(server, existing);
            } else if (!existing.sources.contains("SYSTEM CONFIGURATION")) {
                existing.sources.add("SYSTEM CONFIGURATION");
            }
        }

        String[][] references = new String[][] {
            {"1.1.1.1", "CLOUDFLARE"},
            {"8.8.8.8", "GOOGLE PUBLIC DNS"},
            {"9.9.9.9", "QUAD9"}
        };
        for (String[] item : references) {
            DnsCandidate existing = candidates.get(item[0]);
            if (existing == null) {
                existing = new DnsCandidate(item[0], item[1]);
                existing.sources.add("PUBLIC REFERENCE");
                candidates.put(item[0], existing);
            } else if (!existing.sources.contains("PUBLIC REFERENCE")) {
                existing.sources.add("PUBLIC REFERENCE");
            }
        }

        List<DnsCandidate> ordered = new ArrayList<>(candidates.values());
        ExecutorService queryPool = Executors.newFixedThreadPool(Math.min(12, Math.max(6, ordered.size() * queryNames.length * samplingRounds)));
        Map<String, Map<String, List<Future<JSObject>>>> pending = new LinkedHashMap<>();
        for (DnsCandidate candidate : ordered) {
            Map<String, List<Future<JSObject>>> byName = new LinkedHashMap<>();
            for (String host : queryNames) {
                List<Future<JSObject>> attempts = new ArrayList<>();
                for (int sample = 0; sample < samplingRounds; sample++) {
                    attempts.add(queryPool.submit(() -> queryDnsResolver(candidate.server, host)));
                }
                byName.put(host, attempts);
            }
            pending.put(candidate.server, byName);
        }

        List<JSObject> serverRows = new ArrayList<>();
        try {
            for (DnsCandidate candidate : ordered) {
                JSArray checks = new JSArray();
                int successfulChecks = 0;
                int stableChecks = 0;
                int successfulSamples = 0;
                int stableAnswerSamples = 0;
                long totalStableMedianLatency = 0L;
                List<Long> allLatencies = new ArrayList<>();
                JSArray nonPublicAddresses = new JSArray();

                for (String host : queryNames) {
                    JSArray samples = new JSArray();
                    Map<String, Integer> answerCounts = new LinkedHashMap<>();
                    Map<String, List<String>> answerGroups = new LinkedHashMap<>();
                    List<Long> successfulLatencies = new ArrayList<>();
                    List<String> unionAddresses = new ArrayList<>();
                    int hostSuccessCount = 0;

                    for (Future<JSObject> future : pending.get(candidate.server).get(host)) {
                        JSObject response;
                        try {
                            response = future.get(2500L, TimeUnit.MILLISECONDS);
                        } catch (Exception failure) {
                            response = new JSObject();
                            response.put("ok", false);
                            response.put("status", "QUERY_TIMEOUT");
                            response.put("latencyMs", 2500L);
                            response.put("addresses", new JSArray());
                            response.put("error", failure.getClass().getSimpleName() + ": " + String.valueOf(failure.getMessage()));
                        }

                        boolean sampleOk = response.optBoolean("ok", false);
                        long latency = response.optLong("latencyMs", 0L);
                        JSONArray addressArray = response.optJSONArray("addresses");
                        List<String> addresses = new ArrayList<>();
                        if (sampleOk && addressArray != null) {
                            for (int i = 0; i < addressArray.length(); i++) {
                                String address = addressArray.optString(i, "");
                                if (!address.isEmpty() && !addresses.contains(address)) addresses.add(address);
                            }
                        }
                        Collections.sort(addresses);
                        if (sampleOk) {
                            hostSuccessCount++;
                            successfulSamples++;
                            successfulLatencies.add(latency);
                            allLatencies.add(latency);
                            String signature = dnsAddressSignature(addresses);
                            answerCounts.put(signature, answerCounts.containsKey(signature) ? answerCounts.get(signature) + 1 : 1);
                            answerGroups.put(signature, addresses);
                            for (String address : addresses) if (!unionAddresses.contains(address)) unionAddresses.add(address);
                        }

                        JSObject sampleJson = new JSObject();
                        sampleJson.put("ok", sampleOk);
                        sampleJson.put("status", response.optString("status", "UNKNOWN"));
                        sampleJson.put("latencyMs", latency);
                        sampleJson.put("addresses", new JSONArray(addresses));
                        if (response.has("error")) sampleJson.put("error", response.optString("error"));
                        samples.put(sampleJson);
                    }

                    String dominantSignature = null;
                    int dominantCount = 0;
                    for (Map.Entry<String, Integer> entry : answerCounts.entrySet()) {
                        if (entry.getValue() > dominantCount) {
                            dominantCount = entry.getValue();
                            dominantSignature = entry.getKey();
                        }
                    }
                    boolean stable = dominantCount >= 2;
                    if (hostSuccessCount > 0) successfulChecks++;
                    if (stable) stableChecks++;
                    List<String> selectedAddresses = stable && dominantSignature != null
                        ? new ArrayList<>(answerGroups.get(dominantSignature)) : new ArrayList<>(unionAddresses);
                    List<Long> sortedLatencies = new ArrayList<>(successfulLatencies);
                    Collections.sort(sortedLatencies);
                    long medianLatency = medianLongValues(sortedLatencies);
                    long latencyRange = sortedLatencies.size() > 1
                        ? sortedLatencies.get(sortedLatencies.size() - 1) - sortedLatencies.get(0) : 0L;
                    List<Long> deviations = new ArrayList<>();
                    for (Long latency : sortedLatencies) deviations.add(Math.abs(latency - medianLatency));
                    long jitter = medianLongValues(deviations);
                    if (stable) {
                        totalStableMedianLatency += medianLatency;
                        stableAnswerSamples += dominantCount;
                    }

                    JSArray flagged = new JSArray();
                    for (String address : selectedAddresses) {
                        String scope = classifyDnsAnswerAddress(address);
                        if (scope != null) {
                            String value = address + " (" + scope + ")";
                            flagged.put(value);
                            boolean exists = false;
                            for (int i = 0; i < nonPublicAddresses.length(); i++) {
                                if (value.equals(nonPublicAddresses.optString(i))) { exists = true; break; }
                            }
                            if (!exists) nonPublicAddresses.put(value);
                        }
                    }

                    JSObject check = new JSObject();
                    check.put("host", host);
                    check.put("ok", hostSuccessCount > 0);
                    check.put("stable", stable);
                    check.put("status", stable ? "STABLE" : hostSuccessCount > 0 ? "UNSTABLE" : "NO_RESPONSE");
                    check.put("successfulSamples", hostSuccessCount);
                    check.put("totalSamples", samplingRounds);
                    check.put("stabilityPercent", Math.round((double) dominantCount / samplingRounds * 100.0));
                    check.put("medianLatencyMs", medianLatency);
                    check.put("latencyMs", medianLatency);
                    check.put("latencyRangeMs", latencyRange);
                    check.put("jitterMs", jitter);
                    check.put("addresses", new JSONArray(selectedAddresses));
                    check.put("nonPublicAddresses", flagged);
                    check.put("answerVariants", answerCounts.size());
                    check.put("comparisonStatus", "PENDING");
                    check.put("samples", samples);
                    checks.put(check);
                }

                List<Long> sortedAll = new ArrayList<>(allLatencies);
                Collections.sort(sortedAll);
                long overallMedian = medianLongValues(sortedAll);
                long overallRange = sortedAll.size() > 1
                    ? sortedAll.get(sortedAll.size() - 1) - sortedAll.get(0) : 0L;
                List<Long> allDeviations = new ArrayList<>();
                for (Long latency : sortedAll) allDeviations.add(Math.abs(latency - overallMedian));
                long overallJitter = medianLongValues(allDeviations);
                long averageStableLatency = stableChecks > 0
                    ? Math.round((double) totalStableMedianLatency / stableChecks) : 0L;
                int totalSamples = queryNames.length * samplingRounds;

                JSObject row = new JSObject();
                row.put("server", candidate.server);
                row.put("label", candidate.label);
                row.put("sources", new JSONArray(candidate.sources));
                row.put("ok", stableChecks == queryNames.length);
                row.put("status", stableChecks == queryNames.length ? "RESPONDED" : stableChecks > 0 ? "PARTIAL" : successfulSamples > 0 ? "UNSTABLE" : "NO_RESPONSE");
                row.put("successfulChecks", successfulChecks);
                row.put("stableChecks", stableChecks);
                row.put("totalChecks", queryNames.length);
                row.put("successfulSamples", successfulSamples);
                row.put("totalSamples", totalSamples);
                row.put("samplingSuccessPercent", Math.round((double) successfulSamples / totalSamples * 100.0));
                row.put("answerStabilityPercent", successfulSamples > 0
                    ? Math.round((double) stableAnswerSamples / successfulSamples * 100.0) : 0);
                row.put("latencyMs", averageStableLatency > 0 ? averageStableLatency : overallMedian);
                row.put("averageLatencyMs", averageStableLatency);
                row.put("medianLatencyMs", overallMedian);
                row.put("latencyRangeMs", overallRange);
                row.put("jitterMs", overallJitter);
                JSONArray firstAddresses = checks.optJSONObject(0) == null
                    ? new JSONArray() : checks.optJSONObject(0).optJSONArray("addresses");
                row.put("addresses", firstAddresses == null ? new JSONArray() : firstAddresses);
                row.put("checks", checks);
                row.put("nonPublicAddresses", nonPublicAddresses);
                row.put("integrityStatus", "PENDING");
                serverRows.add(row);
            }
        } finally {
            queryPool.shutdownNow();
        }

        JSArray domainComparisons = new JSArray();
        int divergenceReviewCount = 0;
        int inconclusiveCount = 0;
        for (int checkIndex = 0; checkIndex < queryNames.length; checkIndex++) {
            String host = queryNames[checkIndex];
            List<JSObject> responders = new ArrayList<>();
            Map<String, List<String>> groupServers = new LinkedHashMap<>();
            Map<String, List<String>> groupAddresses = new LinkedHashMap<>();
            for (JSObject serverRow : serverRows) {
                JSONArray checks = serverRow.optJSONArray("checks");
                Object rawCheck = checks == null ? null : checks.opt(checkIndex);
                JSObject check = rawCheck instanceof JSObject ? (JSObject) rawCheck : null;
                if (check == null || !check.optBoolean("stable", false)) continue;
                responders.add(serverRow);
                JSONArray addressArray = check.optJSONArray("addresses");
                List<String> addresses = new ArrayList<>();
                if (addressArray != null) {
                    for (int i = 0; i < addressArray.length(); i++) {
                        String address = addressArray.optString(i, "");
                        if (!address.isEmpty() && !addresses.contains(address)) addresses.add(address);
                    }
                }
                Collections.sort(addresses);
                String signature = dnsAddressSignature(addresses);
                if (!groupServers.containsKey(signature)) groupServers.put(signature, new ArrayList<>());
                groupServers.get(signature).add(serverRow.optString("server"));
                groupAddresses.put(signature, addresses);
            }

            int majorityCount = 0;
            String majoritySignature = null;
            for (Map.Entry<String, List<String>> entry : groupServers.entrySet()) {
                if (entry.getValue().size() > majorityCount) {
                    majorityCount = entry.getValue().size();
                    majoritySignature = entry.getKey();
                }
            }
            boolean hasMajority = groupServers.size() > 1 && majorityCount > responders.size() / 2;

            for (JSObject serverRow : serverRows) {
                JSONArray checks = serverRow.optJSONArray("checks");
                Object rawCheck = checks == null ? null : checks.opt(checkIndex);
                JSObject check = rawCheck instanceof JSObject ? (JSObject) rawCheck : null;
                if (check == null || !check.optBoolean("stable", false)) {
                    if (check != null) check.put("comparisonStatus", check.optBoolean("ok", false)
                        ? "REPEAT_ANSWER_UNSTABLE" : "NOT_COMPARED");
                    continue;
                }
                JSONArray addressArray = check.optJSONArray("addresses");
                List<String> addresses = new ArrayList<>();
                if (addressArray != null) {
                    for (int i = 0; i < addressArray.length(); i++) addresses.add(addressArray.optString(i, ""));
                }
                Collections.sort(addresses);
                String signature = dnsAddressSignature(addresses);
                if (groupServers.size() == 1 && responders.size() >= 2) {
                    check.put("comparisonStatus", "MATCHES_ALL_RESPONDERS");
                } else if (hasMajority) {
                    check.put("comparisonStatus", signature.equals(majoritySignature)
                        ? "MATCHES_PEER_MAJORITY" : "DIFFERS_FROM_PEER_MAJORITY");
                } else if (groupServers.size() > 1) {
                    check.put("comparisonStatus", "INCONCLUSIVE_DIVERGENCE");
                } else {
                    check.put("comparisonStatus", "NOT_ENOUGH_PEERS");
                }
            }

            String status = "INSUFFICIENT_DATA";
            if (responders.size() >= 2 && groupServers.size() == 1) status = "CONSISTENT";
            else if (hasMajority) { status = "DIVERGENCE_REVIEW"; divergenceReviewCount++; }
            else if (groupServers.size() > 1) { status = "INCONCLUSIVE_DIVERGENCE"; inconclusiveCount++; }

            JSArray groups = new JSArray();
            for (Map.Entry<String, List<String>> entry : groupServers.entrySet()) {
                JSObject group = new JSObject();
                group.put("addresses", new JSONArray(groupAddresses.get(entry.getKey())));
                group.put("servers", new JSONArray(entry.getValue()));
                group.put("count", entry.getValue().size());
                groups.put(group);
            }
            JSObject comparison = new JSObject();
            comparison.put("host", host);
            comparison.put("responderCount", responders.size());
            comparison.put("distinctAnswerGroups", groupServers.size());
            comparison.put("status", status);
            comparison.put("groups", groups);
            comparison.put("note", groupServers.size() > 1
                ? "Different repeat-stable A-record sets were observed. CDN, GeoDNS, split-horizon DNS, filtering, or regional routing can explain differences; this is not proof of poisoning."
                : responders.size() >= 2
                    ? "All repeat-stable responding resolvers returned the same A-record set in this snapshot."
                    : "Fewer than two resolvers produced a repeat-stable answer set.");
            domainComparisons.put(comparison);
        }

        int respondingCount = 0;
        int completeCount = 0;
        int unstableResolverCount = 0;
        int nonPublicCount = 0;
        int allSuccessSamples = 0;
        int possibleSamples = 0;
        for (JSObject row : serverRows) {
            int successCount = row.optInt("successfulChecks", 0);
            int stableCount = row.optInt("stableChecks", 0);
            if (successCount > 0) respondingCount++;
            if (stableCount == queryNames.length) completeCount++;
            allSuccessSamples += row.optInt("successfulSamples", 0);
            possibleSamples += row.optInt("totalSamples", 0);

            JSArray flags = new JSArray();
            JSONArray badAddresses = row.optJSONArray("nonPublicAddresses");
            if (badAddresses != null && badAddresses.length() > 0) {
                flags.put("NON_PUBLIC_ANSWER_REVIEW");
                nonPublicCount += badAddresses.length();
            }
            JSONArray checks = row.optJSONArray("checks");
            boolean repeatUnstable = false;
            if (checks != null) {
                for (int i = 0; i < checks.length(); i++) {
                    Object rawCheck = checks.opt(i);
                    JSObject check = rawCheck instanceof JSObject ? (JSObject) rawCheck : null;
                    if (check == null) continue;
                    String comparison = check.optString("comparisonStatus", "");
                    if ("DIFFERS_FROM_PEER_MAJORITY".equals(comparison)) flags.put("ANSWER_DIVERGENCE_REVIEW");
                    else if ("INCONCLUSIVE_DIVERGENCE".equals(comparison)) flags.put("INCONCLUSIVE_DIVERGENCE");
                    if (check.optBoolean("ok", false) && !check.optBoolean("stable", false)) repeatUnstable = true;
                }
            }
            if (repeatUnstable) {
                flags.put("REPEAT_ANSWER_INSTABILITY");
                unstableResolverCount++;
            }

            boolean review = false;
            boolean inconclusive = false;
            for (int i = 0; i < flags.length(); i++) {
                String flag = flags.optString(i);
                if ("NON_PUBLIC_ANSWER_REVIEW".equals(flag) || "ANSWER_DIVERGENCE_REVIEW".equals(flag)) review = true;
                if ("INCONCLUSIVE_DIVERGENCE".equals(flag) || "REPEAT_ANSWER_INSTABILITY".equals(flag)) inconclusive = true;
            }
            row.put("flags", flags);
            row.put("integrityStatus", review ? "REVIEW" : inconclusive ? "INCONCLUSIVE" : "NO_DIVERGENCE_OBSERVED");
        }

        Collections.sort(serverRows, (a, b) -> {
            int stable = Integer.compare(b.optInt("stableChecks", 0), a.optInt("stableChecks", 0));
            if (stable != 0) return stable;
            int samples = Integer.compare(b.optInt("successfulSamples", 0), a.optInt("successfulSamples", 0));
            if (samples != 0) return samples;
            return Long.compare(a.optLong("averageLatencyMs", Long.MAX_VALUE), b.optLong("averageLatencyMs", Long.MAX_VALUE));
        });
        JSArray ranked = new JSArray();
        DnsCandidate bestCandidate = null;
        long bestLatency = Long.MAX_VALUE;
        long bestJitter = 0L;
        int bestStability = 0;
        for (JSObject row : serverRows) {
            ranked.put(row);
            if (row.optInt("stableChecks", 0) == queryNames.length &&
                row.optLong("averageLatencyMs", Long.MAX_VALUE) < bestLatency) {
                bestLatency = row.optLong("averageLatencyMs", Long.MAX_VALUE);
                bestJitter = row.optLong("jitterMs", 0L);
                bestStability = row.optInt("answerStabilityPercent", 0);
                for (DnsCandidate candidate : ordered) {
                    if (candidate.server.equals(row.optString("server"))) { bestCandidate = candidate; break; }
                }
            }
        }

        String integritySummary = "INSUFFICIENT RESPONDERS FOR COMPARISON";
        if (nonPublicCount > 0) integritySummary = "NON-PUBLIC DNS ANSWER — REVIEW";
        else if (divergenceReviewCount > 0) integritySummary = "DNS ANSWER DIVERGENCE — REVIEW";
        else if (inconclusiveCount > 0) integritySummary = "MIXED DNS ANSWERS — INCONCLUSIVE";
        else if (unstableResolverCount > 0) integritySummary = "REPEATED DNS ANSWERS VARY — INCONCLUSIVE";
        else if (domainComparisons.length() == queryNames.length) {
            boolean allConsistent = true;
            for (int i = 0; i < domainComparisons.length(); i++) {
                Object raw = domainComparisons.opt(i);
                if (!(raw instanceof JSObject) || !"CONSISTENT".equals(((JSObject) raw).optString("status"))) allConsistent = false;
            }
            if (allConsistent) integritySummary = "RESPONDERS CONSISTENT";
        }

        JSObject result = new JSObject();
        result.put("supported", true);
        result.put("platform", "ANDROID");
        result.put("collectedAt", java.time.Instant.now().toString());
        result.put("durationMs", Math.max(0L, System.currentTimeMillis() - startedAt));
        JSArray queryNamesJson = new JSArray();
        for (String queryName : queryNames) queryNamesJson.put(queryName);
        result.put("queryNames", queryNamesJson);
        result.put("samplingRounds", samplingRounds);
        result.put("samplesPerResolver", queryNames.length * samplingRounds);
        result.put("totalDnsQueries", ranked.length() * queryNames.length * samplingRounds);
        result.put("queryType", "A");
        result.put("transport", "DNS OVER UDP / PORT 53");
        result.put("configuredDnsServers", new JSONArray(configured));
        result.put("testedCount", ranked.length());
        result.put("respondingCount", respondingCount);
        result.put("completeRespondingCount", completeCount);
        result.put("stableResolverCount", completeCount);
        result.put("unstableResolverCount", unstableResolverCount);
        result.put("sampleSuccessPercent", possibleSamples > 0 ? Math.round((double) allSuccessSamples / possibleSamples * 100.0) : 0);
        if (bestCandidate != null) {
            JSObject bestJson = new JSObject();
            bestJson.put("server", bestCandidate.server);
            bestJson.put("label", bestCandidate.label);
            bestJson.put("latencyMs", bestLatency);
            bestJson.put("jitterMs", bestJitter);
            bestJson.put("answerStabilityPercent", bestStability);
            result.put("bestResolver", bestJson);
        }
        result.put("integritySummary", integritySummary);
        result.put("integrityNote", "Each resolver receives three samples for each of two names. A repeat-stable answer requires at least two matching successful A-record sets out of three. Repeat variation can result from load balancing, CDN/GeoDNS, regional routing, or transient network conditions; it is not proof of poisoning.");
        result.put("domainComparisons", domainComparisons);
        result.put("servers", ranked);
        result.put("skipped", skipped);
        result.put("systemChangesMade", false);
        result.put("limitations",
            "The active system DNS list and three fixed public IPv4 resolver references are queried directly for example.com and iana.org, three samples each over UDP/53. IPv6 DNS entries are listed as skipped. This is not a scan of all devices or all port-53 hosts on the LAN.");
        return result;
    }

    private static long medianLongValues(List<Long> values) {
        if (values == null || values.isEmpty()) return 0L;
        List<Long> sorted = new ArrayList<>(values);
        Collections.sort(sorted);
        int middle = sorted.size() / 2;
        if (sorted.size() % 2 == 1) return sorted.get(middle);
        return Math.round((sorted.get(middle - 1) + sorted.get(middle)) / 2.0);
    }


    private static String dnsAddressSignature(List<String> addresses) {
        StringBuilder builder = new StringBuilder();
        for (String address : addresses) {
            if (builder.length() > 0) builder.append('|');
            builder.append(address);
        }
        return builder.toString();
    }

    private static String classifyDnsAnswerAddress(String value) {
        if (!isIPv4Literal(value)) return "INVALID";
        String[] parts = value.split("\\.");
        int a = Integer.parseInt(parts[0]);
        int b = Integer.parseInt(parts[1]);
        int c = Integer.parseInt(parts[2]);
        if (a == 0) return "UNSPECIFIED";
        if (a == 10 || (a == 172 && b >= 16 && b <= 31) || (a == 192 && b == 168)) return "PRIVATE";
        if (a == 127) return "LOOPBACK";
        if (a == 169 && b == 254) return "LINK_LOCAL";
        if (a == 100 && b >= 64 && b <= 127) return "CARRIER_GRADE_NAT";
        if (a == 192 && b == 0 && c == 2) return "DOCUMENTATION";
        if (a == 198 && (b == 18 || b == 19)) return "BENCHMARK";
        if (a == 198 && b == 51 && c == 100) return "DOCUMENTATION";
        if (a == 203 && b == 0 && c == 113) return "DOCUMENTATION";
        if (a >= 224) return "MULTICAST_OR_RESERVED";
        return null;
    }

    private JSObject queryDnsResolver(String server, String host) {
        long started = System.currentTimeMillis();
        JSObject result = new JSObject();
        DatagramSocket socket = null;
        try {
            int id = new Random().nextInt(65536);
            byte[] query = buildDnsAQuery(host, id);
            socket = new DatagramSocket();
            socket.setSoTimeout(1800);
            InetAddress destination = InetAddress.getByName(server);
            socket.send(new DatagramPacket(query, query.length, destination, 53));

            byte[] buffer = new byte[1500];
            DatagramPacket response = new DatagramPacket(buffer, buffer.length);
            socket.receive(response);
            JSObject parsed = parseDnsAResponse(response.getData(), response.getLength(), id);
            result.put("ok", parsed.optBoolean("ok", false));
            result.put("status", parsed.optString("status", "UNKNOWN"));
            result.put("responseCode", parsed.optInt("responseCode", -1));
            result.put("responseCodeName", parsed.optString("responseCodeName", ""));
            result.put("answerCount", parsed.optInt("answerCount", 0));
            result.put("addresses", parsed.optJSONArray("addresses") == null ? new JSArray() : parsed.optJSONArray("addresses"));
        } catch (SocketTimeoutException timeout) {
            result.put("ok", false);
            result.put("status", "TIMEOUT");
            result.put("addresses", new JSArray());
            result.put("error", "No DNS response within 1800 ms.");
        } catch (Exception error) {
            result.put("ok", false);
            result.put("status", "QUERY_ERROR");
            result.put("addresses", new JSArray());
            result.put("error", error.getClass().getSimpleName() + ": " + String.valueOf(error.getMessage()));
        } finally {
            if (socket != null) socket.close();
        }
        result.put("latencyMs", Math.max(0L, System.currentTimeMillis() - started));
        return result;
    }

    private byte[] buildDnsAQuery(String host, int id) throws IOException {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        DataOutputStream out = new DataOutputStream(bytes);
        out.writeShort(id);
        out.writeShort(0x0100);
        out.writeShort(1);
        out.writeShort(0);
        out.writeShort(0);
        out.writeShort(0);
        for (String label : host.split("\\.")) {
            byte[] encoded = label.getBytes(StandardCharsets.US_ASCII);
            if (encoded.length == 0 || encoded.length > 63) throw new IOException("Invalid DNS label.");
            out.writeByte(encoded.length);
            out.write(encoded);
        }
        out.writeByte(0);
        out.writeShort(1);
        out.writeShort(1);
        out.flush();
        return bytes.toByteArray();
    }

    private JSObject parseDnsAResponse(byte[] packet, int length, int expectedId) throws IOException {
        if (length < 12 || readDnsU16(packet, 0) != expectedId) throw new IOException("Invalid or mismatched DNS response.");
        int flags = readDnsU16(packet, 2);
        if ((flags & 0x8000) == 0) throw new IOException("DNS packet is not a response.");
        int responseCode = flags & 0x000f;
        int questionCount = readDnsU16(packet, 4);
        int answerCount = readDnsU16(packet, 6);
        int offset = 12;

        for (int i = 0; i < questionCount; i++) {
            offset = skipDnsName(packet, length, offset);
            if (offset < 0 || offset + 4 > length) throw new IOException("Malformed DNS question section.");
            offset += 4;
        }

        JSArray addresses = new JSArray();
        int found = 0;
        for (int i = 0; i < answerCount; i++) {
            offset = skipDnsName(packet, length, offset);
            if (offset < 0 || offset + 10 > length) throw new IOException("Malformed DNS answer section.");
            int type = readDnsU16(packet, offset);
            int klass = readDnsU16(packet, offset + 2);
            int dataLength = readDnsU16(packet, offset + 8);
            offset += 10;
            if (offset + dataLength > length) throw new IOException("Truncated DNS answer data.");
            if (type == 1 && klass == 1 && dataLength == 4) {
                String address = (packet[offset] & 255) + "." + (packet[offset + 1] & 255) + "." +
                    (packet[offset + 2] & 255) + "." + (packet[offset + 3] & 255);
                addresses.put(address);
                found++;
            }
            offset += dataLength;
        }

        String[] codes = new String[] {"NOERROR", "FORMERR", "SERVFAIL", "NXDOMAIN", "NOTIMP", "REFUSED"};
        String codeName = responseCode >= 0 && responseCode < codes.length ? codes[responseCode] : "RCODE_" + responseCode;
        JSObject result = new JSObject();
        result.put("responseCode", responseCode);
        result.put("responseCodeName", codeName);
        result.put("answerCount", answerCount);
        result.put("addresses", addresses);
        result.put("ok", responseCode == 0 && found > 0);
        result.put("status", responseCode == 0 ? (found > 0 ? "RESPONDED" : "NO_A_RECORD") : codeName);
        return result;
    }

    private static int readDnsU16(byte[] packet, int offset) throws IOException {
        if (offset < 0 || offset + 2 > packet.length) throw new IOException("Truncated DNS packet.");
        return ((packet[offset] & 255) << 8) | (packet[offset + 1] & 255);
    }

    private static int skipDnsName(byte[] packet, int length, int start) {
        int offset = start;
        while (offset < length) {
            int labelLength = packet[offset] & 255;
            if ((labelLength & 0xc0) == 0xc0) return offset + 2 <= length ? offset + 2 : -1;
            if ((labelLength & 0xc0) != 0) return -1;
            offset++;
            if (labelLength == 0) return offset;
            if (offset + labelLength > length) return -1;
            offset += labelLength;
        }
        return -1;
    }

    private static boolean isIPv4Literal(String value) {
        if (value == null || !value.matches("\\d{1,3}(\\.\\d{1,3}){3}")) return false;
        String[] parts = value.split("\\.");
        for (String part : parts) {
            try {
                int octet = Integer.parseInt(part);
                if (octet < 0 || octet > 255) return false;
            } catch (NumberFormatException ignored) {
                return false;
            }
        }
        return true;
    }

    private static String knownResolverLabel(String server) {
        if ("1.1.1.1".equals(server)) return "CLOUDFLARE";
        if ("8.8.8.8".equals(server)) return "GOOGLE PUBLIC DNS";
        if ("9.9.9.9".equals(server)) return "QUAD9";
        return null;
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
            if(caps!=null){
                if(caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI))transport="WI-FI";else if(caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET))transport="ETHERNET";else if(caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR))transport="CELLULAR";else if(caps.hasTransport(NetworkCapabilities.TRANSPORT_VPN))transport="VPN";else transport="OTHER";
                result.put("captivePortalKnown",true);result.put("captivePortal",caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_CAPTIVE_PORTAL));
                result.put("networkValidated",caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED));result.put("internetCapability",caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET));
            }else{result.put("captivePortalKnown",false);result.put("captivePortal",false);result.put("networkValidated",false);result.put("internetCapability",false);}
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

    private static final class DnsCandidate {
        final String server;
        final String label;
        final List<String> sources = new ArrayList<>();
        DnsCandidate(String server, String label) {
            this.server = server;
            this.label = label;
        }
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
