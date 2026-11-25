#!/usr/bin/env node
/**
 * Rendang Rush · Dapur Nusantara — entry dossier check.
 *
 * Node 22, standard library only. Verifies that game/index.html exists,
 * extracts the game title from it, and prints a small text dossier of
 * the entry's files with their sizes. Exits 0 when everything is in
 * place, 1 when the game file is missing or has no <title>.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const gamePath = join(root, "game", "index.html");

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

if (!existsSync(gamePath)) {
  fail(`game file not found: ${gamePath}`);
}

const html = readFileSync(gamePath, "utf8");
const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
if (!titleMatch) {
  fail("game/index.html has no <title> element");
}
const title = titleMatch[1].trim();

/* Dishes and mechanics are declared in the game source; count them so
   the dossier reflects what actually ships, not a hand-written claim. */
const dishCount = (html.match(/"(Rendang|Nasi Goreng|Sate Ayam|Mie Goreng|Rendang Spesial|Nasi Komplit)":/g) || []).length;
const ingredientCount = (html.match(/\{id:"/g) || []).length;
const selfContained = !/<script[^>]+src=|<link[^>]+href="https?:|url\(https?:/i.test(html);

const files = [
  "game/index.html",
  "main.ts",
  "README.md",
  "screenshots/title.png",
  "screenshots/board.png",
  "screenshots/serve.png",
];

console.log("=== RENDANG RUSH — ENTRY DOSSIER ===");
console.log(`Title:           ${title}`);
console.log(`Game file:       game/index.html (${statSync(gamePath).size} bytes)`);
console.log(`Dishes on menu:  ${dishCount}`);
console.log(`Ingredients:     ${ingredientCount}`);
console.log(`Self-contained:  ${selfContained ? "yes — no external requests" : "NO"}`);
console.log("Files:");
for (const rel of files) {
  const p = join(root, rel);
  console.log(`  ${existsSync(p) ? String(statSync(p).size).padStart(8) + " B" : "   missing"}  ${rel}`);
}
if (!selfContained) fail("game/index.html references an external resource");
console.log("OK: entry dossier verified.");

