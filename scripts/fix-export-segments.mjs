// Works around a Windows-only path bug in the Next.js 16.4 static export.
//
// The client router prefetches segment data from flat files such as
//   /services/__next.services.__PAGE__.txt
// but on Windows `next build` joins the segment path with backslashes and
// writes  /services/__next.services/__PAGE__.txt  instead, so prefetches 404.
// On Linux/macOS the export is already correct and this script does nothing.
//
// Runs automatically after `npm run build` (postbuild) and in scripts/build-e2e.mjs.
// Usage: node scripts/fix-export-segments.mjs [outDir=out]
import { readdir, rename, rm, stat } from "node:fs/promises";
import path from "node:path";

const outDir = path.resolve(process.argv[2] ?? "out");

async function filesUnder(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((e) => (e.isDirectory() ? filesUnder(path.join(dir, e.name)) : [path.join(dir, e.name)])),
  );
  return nested.flat();
}

async function walk(dir) {
  let moved = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (!entry.name.startsWith("__next.")) {
      if (entry.name !== "_next") moved += await walk(full);
      continue;
    }
    for (const file of await filesUnder(full)) {
      const flatName = [entry.name, ...path.relative(full, file).split(path.sep)].join(".");
      const dest = path.join(dir, flatName);
      const exists = await stat(dest).then(() => true, () => false);
      if (exists) throw new Error(`Refusing to overwrite ${dest}`);
      await rename(file, dest);
      moved++;
    }
    await rm(full, { recursive: true });
  }
  return moved;
}

const moved = await walk(outDir);
console.log(moved ? `fix-export-segments: flattened ${moved} segment file(s) in ${outDir}` : "fix-export-segments: nothing to fix");
