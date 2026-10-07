/**
 * Location registry: load, index, and answer "is this row inside that place?".
 *
 * Built by buildRegistry.js into docs/location_registry.json. Everything here
 * works on CODES. Names are only how people find a place; once found, a place
 * is its code — which is what keeps "Banda" from matching "Porbandar".
 */

const fs = require("fs");
const path = require("path");

const FILE = process.env.LOCATION_REGISTRY_PATH ||
  path.join(__dirname, "../../../docs/location_registry.json");

/** Area rank: larger units rank higher. Used for nesting and prominence. */
const RANK = { station: 1, block: 2, district: 3, subdivision: 4, state: 5, region: 6, country: 7 };

/** Parent key that holds the code of an ancestor at each level. */
const PARENT_KEY = {
  region: "region_code",
  subdivision: "subdiv_code",
  state: "state_code",
  district: "district_code",
  block: "block_code",
};

let cache = null;

function load({ force = false } = {}) {
  if (cache && !force) return cache;
  if (!fs.existsSync(FILE)) {
    const err = new Error(`Location registry not found at ${FILE}. Build it with: npm run location:build`);
    err.code = "LOCATION_REGISTRY_MISSING";
    throw err;
  }
  const raw = JSON.parse(fs.readFileSync(FILE, "utf8"));
  const byId = new Map();
  const index = new Map(); // key -> [{ id, how: "primary"|"variant" }]

  for (const e of raw.entries) {
    byId.set(e.id, e);
    e.keys.forEach((k, i) => {
      const list = index.get(k) || [];
      list.push({ id: e.id, how: i === 0 ? "primary" : "variant" });
      index.set(k, list);
    });
  }

  cache = {
    meta: { version: raw.version, built_at: raw.built_at, source_hash: raw.source_hash, counts: raw.counts },
    byId,
    index,
    aliases: raw.aliases || {},
  };
  return cache;
}

function isReady() {
  try {
    load();
    return true;
  } catch (_) {
    return false;
  }
}

function getMeta() {
  try {
    const r = load();
    return { ready: true, ...r.meta, keys: r.index.size, aliases: Object.keys(r.aliases).length, path: FILE };
  } catch (e) {
    return { ready: false, error: e.message, path: FILE };
  }
}

function get(id) {
  return load().byId.get(id) || null;
}

/**
 * Every entry reachable from a normalised key, with how it was reached.
 * Aliases rank with primaries: an alias is a deliberate, curated statement.
 */
function lookup(key) {
  const r = load();
  const out = [];
  const seen = new Set();
  for (const id of r.aliases[key] || []) {
    if (!seen.has(id)) { seen.add(id); out.push({ entry: r.byId.get(id), how: "alias" }); }
  }
  for (const hit of r.index.get(key) || []) {
    if (!seen.has(hit.id)) { seen.add(hit.id); out.push({ entry: r.byId.get(hit.id), how: hit.how }); }
  }
  return out.filter((x) => x.entry);
}

/** Is `inner` the same place as, or contained in, `outer`? */
function isWithin(inner, outer) {
  if (!inner || !outer) return false;
  if (inner.id === outer.id) return true;
  const key = PARENT_KEY[outer.level];
  return Boolean(key && inner.parents && String(inner.parents[key]) === String(outer.code));
}

/** The registry entry an API row describes, from the most specific code it carries. */
function entryForRow(row = {}) {
  const r = load();
  const probe = [
    ["station", row.station_code],
    ["block", row.block_code],
    ["district", row.district_code],
    ["state", row.new_state_code ?? (row.district_code ? null : row.state_code)],
    ["subdivision", row.s_code ?? (row.district_code || row.station_code ? null : row.subdiv_code)],
    ["region", row.r_code ?? (row.district_code || row.station_code || row.state_code ? null : row.region_code)],
  ];
  for (const [level, code] of probe) {
    if (code === undefined || code === null || code === "") continue;
    const e = r.byId.get(`${level}:${code}`);
    if (e) return e;
  }
  return null;
}

/**
 * Keep the rows that are the target place or lie inside it.
 *
 * Returns null when the rows cannot be mapped onto the registry (an API whose
 * rows carry no codes) so the caller can fall back to its old name logic
 * rather than silently returning nothing.
 */
function filterRowsByLocation(rows, target) {
  if (!Array.isArray(rows) || !target?.level || !target?.code) return null;
  const outer = get(`${target.level}:${target.code}`) ||
    { id: `${target.level}:${target.code}`, level: target.level, code: String(target.code) };

  let mapped = 0;
  const kept = rows.filter((row) => {
    const e = entryForRow(row);
    if (!e) return false;
    mapped++;
    return isWithin(e, outer);
  });

  // Too few rows carry codes the registry knows: not safe to trust the filter.
  if (rows.length && mapped / rows.length < 0.5) return null;
  return kept;
}

/** Display label with the parent that tells same-named places apart. */
function label(e) {
  if (!e) return "";
  const p = e.parents || {};
  const where =
    e.level === "station" ? [p.district, p.state].filter(Boolean).join(", ") :
    e.level === "block" ? [p.district, p.state].filter(Boolean).join(", ") :
    e.level === "district" ? p.state :
    e.level === "subdivision" || e.level === "state" ? p.region : "";
  return `${e.name} (${e.level}${where ? `, ${where}` : ""})`;
}

/**
 * Every name at one level, from the built file — no database needed.
 * The DB-loaded place lists fall back to this when the database is
 * unreachable, so a DB outage is never reported as "unknown place".
 */
function namesByLevel(level) {
  try {
    const out = new Set();
    for (const e of load().byId.values()) if (e.level === level) out.add(e.name);
    return [...out];
  } catch (_) {
    return [];
  }
}

module.exports = {
  namesByLevel,
  load, isReady, getMeta, get, lookup, isWithin, entryForRow,
  filterRowsByLocation, label, RANK, PARENT_KEY, FILE,
};
