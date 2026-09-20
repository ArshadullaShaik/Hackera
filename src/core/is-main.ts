import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

/**
 * Check if the given module URL is the entry point module executed by Node.
 */
export function isMainModule(metaUrl: string): boolean {
  if (!process.argv[1]) return false;
  try {
    const currentFile = fileURLToPath(metaUrl);
    const entryFile = path.resolve(process.argv[1]);
    if (currentFile === entryFile) return true;
    if (fs.existsSync(currentFile) && fs.existsSync(entryFile)) {
      return fs.realpathSync(currentFile) === fs.realpathSync(entryFile);
    }
  } catch {
    // Ignore any path resolution errors
  }
  return false;
}
