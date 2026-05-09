#!/usr/bin/env node
/**
 * src/lib/site.ts の lastUpdated を当月にバンプする。月次 cron で動かす想定。
 *
 * 入力なし、副作用 = site.ts 書き換え。GitHub Actions の peter-evans/
 * create-pull-request が後段で diff を拾って PR 化する。
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SITE_TS = resolve(here, "..", "src", "lib", "site.ts");

const now = new Date();
const year = now.getUTCFullYear();
const month = now.getUTCMonth() + 1;

const src = await readFile(SITE_TS, "utf8");
const re = /lastUpdated:\s*\{\s*year:\s*(\d+),\s*month:\s*(\d+)\s*\}/;
const m = src.match(re);
if (!m) {
  console.error("[bump-last-updated] lastUpdated 行が見つかりません");
  process.exit(1);
}
const [oldYear, oldMonth] = [parseInt(m[1], 10), parseInt(m[2], 10)];
if (oldYear === year && oldMonth === month) {
  console.log(`[bump-last-updated] no change (${year}-${month})`);
  process.exit(0);
}
const next = `lastUpdated: { year: ${year}, month: ${month} }`;
const updated = src.replace(re, next);
await writeFile(SITE_TS, updated, "utf8");
console.log(
  `[bump-last-updated] ${oldYear}-${oldMonth} → ${year}-${month}`,
);
