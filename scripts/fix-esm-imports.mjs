import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const addJsExtension = (_match, prefix, specifier, suffix) =>
  `${prefix}${specifier.endsWith(".js") ? specifier : `${specifier}.js`}${suffix}`;

async function rewriteImports(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await rewriteImports(path);
    } else if (entry.name.endsWith(".js")) {
      const source = await readFile(path, "utf8");
      const output = source
        .replace(/(from\s+["'])(\.{1,2}\/[^"']+)(["'])/g, addJsExtension)
        .replace(/(import\(\s*["'])(\.{1,2}\/[^"']+)(["']\s*\))/g, addJsExtension);
      if (output !== source) await writeFile(path, output);
    }
  }
}

await rewriteImports("dist");
