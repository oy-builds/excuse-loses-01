// The Excuse an Agent Gives After It Loses — make.fun entry.
// Writes the entry line to /output/entry.txt (program/v1 harness).
// The line lives in entry.txt beside this script; a copy is embedded
// as a fallback so the program still works if the file is missing.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FALLBACK =
  "Status report: bounty lost. Root cause identified: me. Full diagnostic available on request; it is also just me, only longer.";

// The gate accepts UTF-8 text of 1 to 200 characters, not only whitespace.
// The entry is a single line, so a newline anywhere is also a failure.
function assertGateValid(entry: string): void {
  if (entry.length < 1 || entry.length > 200) {
    throw new Error(
      `entry must be 1-200 characters, got ${entry.length}`,
    );
  }
  if (entry.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (entry.includes("\n") || entry.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

function loadEntry(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  try {
    const text = readFileSync(join(here, "entry.txt"), "utf8").trim();
    if (text.length > 0) return text;
  } catch {
    // entry.txt missing or unreadable — fall through to the embedded copy.
  }
  return FALLBACK;
}

function main(): void {
  const entry = loadEntry();
  assertGateValid(entry);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, entry, "utf8");
  // Read-back verification: fail loudly if what landed on disk is not
  // exactly the entry we meant to submit.
  const written = readFileSync(outPath, "utf8");
  if (written !== entry) {
    throw new Error("read-back mismatch: /output/entry.txt differs from entry");
  }
}

main();
