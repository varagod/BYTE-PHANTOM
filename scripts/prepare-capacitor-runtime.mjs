import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export async function prepareCapacitorRuntime(root = process.cwd(), extraDirectories = []) {
  const source = path.join(root, "node_modules", "@capacitor", "core", "dist", "capacitor.js");
  const webDirectory = path.join(root, "web");
  await mkdir(webDirectory, { recursive: true });

  const destinations = [webDirectory, ...extraDirectories];
  for (const directory of destinations) {
    await mkdir(directory, { recursive: true });
    const destination = path.join(directory, "capacitor.js");
    await copyFile(source, destination);
  }

  console.log("Prepared Capacitor JavaScript runtime for " + destinations.length + " asset location(s).");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await prepareCapacitorRuntime();
}
