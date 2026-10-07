#!/usr/bin/env node
/**
 * Build the location registry.   npm run location:build
 *
 * Reads normal_district_details and station_details and writes
 * docs/location_registry.json: every region, subdivision, state, district,
 * block and station, each with its CODE and its full ancestry.
 *
 * Why a built file and not a table: the hierarchy already lives in those two
 * tables. A new table would mean a migration, a sync job every time a station
 * is added, and writes to production. A build artefact needs none of that,
 * and the source hash tells /health when it has gone stale.
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Client } = require("pg");
const { keysFor, norm } = require("./normalize");

const ROOT = path.join(__dirname, "../../..");
const OUT = path.join(ROOT, "docs/location_registry.json");
const ALIASES = path.join(ROOT, "docs/location_aliases.json");
const VERSION = 1;

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n !== 0 ? n : null;
};

async function main() {
  const db = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB,
    connectionTimeoutMillis: 20000,
  });
  await db.connect();

  const dist = (
    await db.query(`
      SELECT region_code, region_name, subdiv_code, subdiv_name,
             new_state_code, state_name, district_code, district_name
        FROM public.normal_district_details
       WHERE district_code IS NOT NULL
       ORDER BY district_code`)
  ).rows;

  const stn = (
    await db.query(`
      SELECT station_code, station_name, station_type, district_code,
             block_code, block_name, centre_name, latitude, longitude
        FROM public.station_details
       WHERE station_code IS NOT NULL
       ORDER BY station_code`)
  ).rows;
  await db.end();

  const entries = [];
  const byCode = {};
  const put = (e) => {
    e.id = `${e.level}:${e.code}`;
    e.keys = keysFor(e.name);
    if (e.extraNames) {
      for (const n of e.extraNames) for (const k of keysFor(n)) if (!e.keys.includes(k)) e.keys.push(k);
      delete e.extraNames;
    }
    entries.push(e);
    byCode[e.id] = e;
  };

  // ---- region / subdivision / state / district from normal_district_details
  const seen = new Set();
  for (const r of dist) {
    const region = { region: r.region_name, region_code: String(r.region_code) };
    const subdiv = { subdiv: r.subdiv_name, subdiv_code: String(r.subdiv_code) };
    const state = { state: r.state_name, state_code: String(r.new_state_code) };

    if (!seen.has(`region:${r.region_code}`)) {
      seen.add(`region:${r.region_code}`);
      put({ level: "region", code: String(r.region_code), name: r.region_name, parents: {} });
    }
    if (!seen.has(`subdivision:${r.subdiv_code}`)) {
      seen.add(`subdivision:${r.subdiv_code}`);
      put({ level: "subdivision", code: String(r.subdiv_code), name: r.subdiv_name, parents: { ...region } });
    }
    if (!seen.has(`state:${r.new_state_code}`)) {
      seen.add(`state:${r.new_state_code}`);
      put({ level: "state", code: String(r.new_state_code), name: r.state_name, parents: { ...region } });
    }
    put({
      level: "district",
      code: String(r.district_code),
      name: r.district_name,
      parents: { ...state, ...subdiv, ...region },
    });
  }

  const districtOf = (code) => byCode[`district:${code}`] || null;

  // ---- blocks (one entry per block_code; a few codes carry two spellings)
  const blocks = new Map();
  for (const s of stn) {
    if (!s.block_code) continue;
    const b = blocks.get(String(s.block_code)) || { names: new Map(), district_code: String(s.district_code) };
    b.names.set(s.block_name, (b.names.get(s.block_name) || 0) + 1);
    blocks.set(String(s.block_code), b);
  }
  for (const [code, b] of blocks) {
    const names = [...b.names.entries()].sort((a, z) => z[1] - a[1]).map(([n]) => n).filter(Boolean);
    const d = districtOf(b.district_code);
    if (!names.length) continue;
    put({
      level: "block",
      code,
      name: names[0],
      extraNames: names.slice(1),
      parents: d
        ? { district: d.name, district_code: d.code, ...d.parents }
        : { district_code: b.district_code },
    });
  }

  // ---- stations
  let prefixOk = 0;
  for (const s of stn) {
    const d = districtOf(s.district_code);
    const blk = s.block_code ? byCode[`block:${s.block_code}`] : null;
    if (blk && String(s.station_code).startsWith(String(s.block_code)) &&
        String(s.block_code).startsWith(String(s.district_code))) prefixOk++;
    put({
      level: "station",
      code: String(s.station_code),
      name: s.station_name,
      type: s.station_type || null,
      centre: s.centre_name || null,
      lat: num(s.latitude),
      lon: num(s.longitude),
      parents: {
        ...(blk ? { block: blk.name, block_code: blk.code } : {}),
        ...(d ? { district: d.name, district_code: d.code, ...d.parents } : { district_code: String(s.district_code) }),
      },
    });
  }

  // ---- aliases, resolved to ids; a target that does not exist is an error
  const aliasSrc = fs.existsSync(ALIASES) ? JSON.parse(fs.readFileSync(ALIASES, "utf8")).aliases || {} : {};
  const aliases = {};
  const missing = [];
  for (const [alias, targets] of Object.entries(aliasSrc)) {
    const ids = [];
    for (const t of targets) {
      const hit = entries.find((e) => e.level === t.level && norm(e.name) === norm(t.name));
      if (hit) ids.push(hit.id);
      else missing.push(`${alias} -> ${t.level}:${t.name}`);
    }
    if (ids.length) aliases[norm(alias)] = ids;
  }

  const counts = entries.reduce((a, e) => ((a[e.level] = (a[e.level] || 0) + 1), a), {});
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(dist) + JSON.stringify(stn) + JSON.stringify(aliasSrc))
    .digest("hex")
    .slice(0, 16);

  fs.writeFileSync(
    OUT,
    JSON.stringify({ version: VERSION, built_at: new Date().toISOString(), source_hash: hash, counts, aliases, entries })
  );

  console.log("\n  location registry built\n");
  for (const lv of ["region", "subdivision", "state", "district", "block", "station"]) {
    console.log(`  ${lv.padEnd(12)} ${String(counts[lv] || 0).padStart(6)}`);
  }
  console.log(`  ${"aliases".padEnd(12)} ${String(Object.keys(aliases).length).padStart(6)}`);
  console.log(`\n  code hierarchy station⊂block⊂district: ${prefixOk}/${stn.length} (${((100 * prefixOk) / stn.length).toFixed(1)}%)`);
  console.log(`  stations with coordinates: ${entries.filter((e) => e.level === "station" && e.lat && e.lon).length}`);
  console.log(`  wrote ${path.relative(process.cwd(), OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);

  if (missing.length) {
    console.error(`\n  FAIL: ${missing.length} alias target(s) do not exist:`);
    missing.forEach((m) => console.error(`    - ${m}`));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("location:build failed:", e.message);
  process.exit(1);
});
