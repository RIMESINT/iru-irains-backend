/**
 * Name normalisation shared by the registry builder and the resolver.
 *
 * Both sides MUST produce identical keys, or a name that was indexed can never
 * be found. Keep every transformation here, never inline in a caller.
 */

/** Canonical key: lowercase, "&" read as "and", accents and punctuation gone. */
function norm(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]/g, "");
}

/** Station-type markers that users never type: "BANDA CWC", "KAVALI(A)". */
const TYPE_MARKERS = /\b(aws|arg|cwc|agro|agri|obsy|observatory|kvk|rg|sr|frm|ms|imd)\b/gi;

/** Official prefixes districts carry that users drop: "SPSR NELLORE". */
const OFFICIAL_PREFIX = /^(spsr|ysr|sas|sbs|ss|sri|shri|dr|n\.?t\.?r)\s+/i;

/**
 * Every key a name can be found under, strongest first.
 *
 * [0] is the primary key — the name as stored. The rest are variants: the
 * forms people actually type. A primary match always outranks a variant
 * match, so "chennai" finds the district CHENNAI before it finds the station
 * CHENNAI(N) through its stripped variant.
 */
function keysFor(name) {
  const raw = String(name || "").trim();
  const keys = [];
  const add = (v) => {
    const k = norm(v);
    if (k && k.length >= 2 && !keys.includes(k)) keys.push(k);
  };

  add(raw);                                            // KONKAN & GOA -> konkanandgoa

  const noParen = raw.replace(/\([^)]*\)/g, " ");
  add(noParen);                                        // CHENNAI(N)   -> chennai

  // Parenthetical content of 4+ letters is usually an alternate name:
  // "SAS NAGAR (MOHALI)" is also "mohali". 1-3 letters is a marker: "(A)".
  for (const m of raw.matchAll(/\(([^)]*)\)/g)) {
    if (m[1].replace(/[^a-z]/gi, "").length >= 4) add(m[1]);
  }

  add(raw.replace(/&|\band\b/gi, " "));                // KONKAN & GOA -> konkangoa
  add(noParen.replace(TYPE_MARKERS, " "));             // BANDA CWC    -> banda
  add(noParen.replace(/_/g, " ").replace(TYPE_MARKERS, " ")); // KARJAT_AGRI -> karjat
  add(raw.replace(OFFICIAL_PREFIX, ""));               // SPSR NELLORE -> nellore

  return keys;
}

/**
 * Words that can never be a place on their own, however a name collides.
 * "want" scored 0.75 against the station MANT and produced "Did you mean
 * Mant?" for "I want all india data". An exact index removes the fuzzy part
 * of that failure; this list removes the exact part ("data", "today", …).
 */
const NOT_A_PLACE = new Set(`
  a an the and or of in on at for to from by with about over under into near
  i me my we our you your it its is are was were be been being am do does did
  what which where when who whom whose why how can could would should will shall may might must
  want need give show tell get find see view list compare check look ask
  rain rainfall rainy data info information value values total amount report reports
  today todays yesterday yesterdays tomorrow now current latest recent daily weekly monthly
  seasonal season cumulative cummulative annual yearly year years month months week weeks day days date dates
  last past previous next this that these those so far till since upto until
  actual normal departure deficient excess large scanty heavy light moderate highest lowest
  wettest driest top bottom rank ranking above below more less than mm percent
  station stations stn block blocks district districts dist state states region regions
  subdivision subdivisions subdiv place places area areas location locations level
  india all country countrywide national nationwide pan whole entire
  monsoon spatial distribution activity weak active vigorous subdued map maps page
  yes no ok okay please thanks thank hello hi hey good morning evening
  january february march april june july august september october november december
  jan feb apr jun jul aug sep sept oct nov dec
  statistics statistic stats overview home dashboard graph graphs chart table entry verification
`.split(/\s+/).filter(Boolean));

/** Words that name a level, used to narrow candidates. */
const LEVEL_WORDS = [
  ["station", /\b(station|stations|stn|gauge|observatory|aws|arg)\b/i],
  ["block", /\b(block|blocks|mandal|taluk|taluka|tehsil)\b/i],
  ["district", /\b(district|districts|dist|zilla|zila)\b/i],
  ["subdivision", /\b(sub[- ]?division|subdivisions|subdiv|met\s+subdivision)\b/i],
  ["state", /\b(state|states|ut|union\s+territory)\b/i],
  ["region", /\b(region|regions)\b/i],
];

const COUNTRY_RE = /\b(all[\s-]?india|india|bharat|country|countrywide|nationwide|national|pan[\s-]?india|whole\s+india)\b/i;

module.exports = { norm, keysFor, NOT_A_PLACE, LEVEL_WORDS, COUNTRY_RE, TYPE_MARKERS };
