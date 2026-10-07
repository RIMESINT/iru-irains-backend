#!/usr/bin/env node
/**
 * Location resolver eval.   npm run location:eval
 *
 * Every row is a question that has actually been asked of the assistant, with
 * the outcome the resolver must produce. Add a row whenever a real question
 * resolves to the wrong place — that is the only thing that keeps this honest.
 */
const fs = require("fs");
const path = require("path");
const { resolve } = require("./resolver");

const FILE = path.join(__dirname, "../../../docs/location_eval.jsonl");
const rows = fs.readFileSync(FILE, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));

let pass = 0;
const fails = [];
const times = [];

for (const row of rows) {
  const t0 = process.hrtime.bigint();
  let r;
  try {
    r = resolve(row.q);
  } catch (e) {
    fails.push(`${row.q}\n      threw: ${e.message}`);
    continue;
  }
  times.push(Number(process.hrtime.bigint() - t0) / 1e6);

  let ok = r.status === row.status;
  let got = r.status;

  if (ok && row.status === "resolved") {
    const names = (r.targets || [r.target]).map((t) => t.name);
    got = `${r.target.level}:${r.target.name}`;
    if (row.level && r.target.level !== row.level) ok = false;
    if (row.name && !names.includes(row.name)) ok = false;
    if (row.also && !names.includes(row.also)) ok = false;
  } else if (ok && (row.status === "ambiguous" || row.status === "level_mismatch")) {
    const cands = r.candidates || [];
    got = `${cands.length} candidates`;
    if (row.level && row.status === "ambiguous" && !cands.some((c) => c.level === row.level)) ok = false;
  } else if (ok && row.status === "did_you_mean") {
    const names = (r.candidates || []).map((c) => c.name);
    got = names.slice(0, 2).join("/");
    if (row.name && !names.includes(row.name)) ok = false;
  }

  if (ok) pass++;
  else fails.push(`${row.q}\n      want ${row.status}${row.name ? ` ${row.name}` : ""}  ·  got ${got}`);
}

const sorted = times.sort((a, b) => a - b);
const pct = (p) => (sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] || 0).toFixed(2);

console.log(`\n  location resolver — ${rows.length} questions\n`);
console.log(`  accuracy      ${((100 * pass) / rows.length).toFixed(1)}%  (${pass}/${rows.length})`);
console.log(`  p50 / p95     ${pct(0.5)}ms / ${pct(0.95)}ms`);
if (fails.length) {
  console.log(`\n  ${fails.length} failure(s):\n`);
  fails.forEach((f) => console.log(`    - ${f}`));
} else {
  console.log("\n  no failures.");
}
console.log();
process.exit(fails.length ? 1 : 0);
