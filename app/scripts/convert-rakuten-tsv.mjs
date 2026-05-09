#!/usr/bin/env node
/**
 * rakuten-popular.tsv (BOM 付き UTF-8) を popular-products.generated.json に変換。
 * 1度きり用のスクリプト。データ更新時はこれを再実行。
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const INPUT = resolve(here, "..", "..", "tmp-rakuten-popular.tsv");
const OUTPUT = resolve(here, "..", "src", "lib", "popular-products.generated.json");

const text = readFileSync(INPUT, "utf8").replace(/^﻿/, "");
const lines = text.split("\n").filter((l) => l.length > 0);
const header = lines[0].split("\t");
const expected = [
  "shopCode",
  "itemCode",
  "nameJa",
  "shopName",
  "priceJpy",
  "originalPriceJpy",
  "imageUrl",
  "ratingAvg",
  "ratingCount",
  "categories",
  "topRanks",
];
for (let i = 0; i < expected.length; i++) {
  if (header[i] !== expected[i]) {
    console.error(`Header mismatch at col ${i}: got "${header[i]}", expected "${expected[i]}"`);
    process.exit(1);
  }
}

const rows = [];
const skipped = [];
for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split("\t");
  if (cols.length !== expected.length) {
    skipped.push({ line: i + 1, reason: `cols=${cols.length}`, head: cols.slice(0, 3) });
    continue;
  }
  const [
    shopCode,
    itemCode,
    nameJa,
    shopName,
    priceJpyStr,
    originalPriceJpyStr,
    imageUrl,
    ratingAvgStr,
    ratingCountStr,
    categoriesStr,
    topRanksStr,
  ] = cols;

  const priceJpy = Number.parseInt(priceJpyStr, 10);
  const originalPriceJpy = originalPriceJpyStr === "" ? null : Number.parseInt(originalPriceJpyStr, 10);
  const ratingAvg = ratingAvgStr === "" ? null : Number.parseFloat(ratingAvgStr);
  const ratingCount = ratingCountStr === "" ? 0 : Number.parseInt(ratingCountStr, 10);
  const categories = categoriesStr ? categoriesStr.split("|") : [];
  const topRanks = {};
  if (topRanksStr) {
    for (const pair of topRanksStr.split(",")) {
      const [cat, rankStr] = pair.split(":");
      if (cat && rankStr) {
        const rank = Number.parseInt(rankStr, 10);
        if (Number.isFinite(rank)) topRanks[cat] = rank;
      }
    }
  }

  if (!shopCode || !itemCode || !nameJa || !Number.isFinite(priceJpy) || !imageUrl) {
    skipped.push({ line: i + 1, reason: "missing required", id: `${shopCode}/${itemCode}` });
    continue;
  }

  rows.push({
    nameJa,
    shopCode,
    itemCode,
    shopName,
    priceJpy,
    originalPriceJpy,
    imageUrl,
    ratingAvg,
    ratingCount,
    categories,
    topRanks,
  });
}

writeFileSync(OUTPUT, JSON.stringify(rows, null, 2) + "\n", "utf8");

console.log(`✓ Wrote ${rows.length} rows to ${OUTPUT}`);
if (skipped.length > 0) {
  console.warn(`⚠ Skipped ${skipped.length} rows:`);
  for (const s of skipped.slice(0, 10)) console.warn("  ", s);
  if (skipped.length > 10) console.warn(`  ...and ${skipped.length - 10} more`);
}
