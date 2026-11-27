import { mkdir, readFile, writeFile } from "node:fs/promises";
import { prepareCapacitorRuntime } from "./prepare-capacitor-runtime.mjs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const config = JSON.parse(await readFile(path.join(root, "capacitor.config.json"), "utf8"));
const appId = String(config.appId || "").trim();
if (!/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(appId)) {
  throw new Error("capacitor.config.json must contain a valid reverse-DNS appId.");
}

const androidPublicAssets = path.join(root, "android", "app", "src", "main", "assets", "public");
await prepareCapacitorRuntime(root, [androidPublicAssets]);

const sourceRoot = path.join(root, "native", "android", "src", "main", "java", "com", "varagod", "bytephantom");
const destinationRoot = path.join(root, "android", "app", "src", "main", "java", ...appId.split("."));
await mkdir(destinationRoot, { recursive: true });

const adaptPackage = (source) =>
  source.replace(/^package com\.varagod\.bytephantom;/m, "package " + appId + ";");
for (const filename of ["NetworkRadarPlugin.java", "MainActivity.java"]) {
  const source = await readFile(path.join(sourceRoot, filename), "utf8");
  await writeFile(path.join(destinationRoot, filename), adaptPackage(source), "utf8");
}

const manifestPath = path.join(root, "android", "app", "src", "main", "AndroidManifest.xml");
let manifest = await readFile(manifestPath, "utf8");
const permissions = ["android.permission.INTERNET", "android.permission.ACCESS_NETWORK_STATE"];
const missing = permissions.filter((permission) => !manifest.includes('android:name="' + permission + '"'));
if (missing.length) {
  const block = missing.map((permission) => '    <uses-permission android:name="' + permission + '" />').join("\n") + "\n";
  const applicationIndex = manifest.indexOf("<application");
  if (applicationIndex < 0) throw new Error("AndroidManifest.xml has no <application> element.");
  manifest = manifest.slice(0, applicationIndex) + block + manifest.slice(applicationIndex);
  await writeFile(manifestPath, manifest, "utf8");
}

console.log("Prepared BYTE PHANTOM Android native plugin in " + path.relative(root, destinationRoot) + ".");
console.log("Added/verified Android permissions: " + permissions.join(", ") + ".");
