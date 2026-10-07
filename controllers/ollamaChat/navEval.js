#!/usr/bin/env node
/** Product-page resolver eval.  npm run nav:eval */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { resolvePage, routeWithPages } = require("./fastPath");
const { route } = require("./rag/router");

(async () => {
  const rows = fs.readFileSync(path.join(__dirname, "../../docs/nav_eval.jsonl"), "utf8")
    .trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
  let pass = 0, asked = 0;
  const fails = [];
  for (const r of rows) {
    // Exactly the production routing: keyword router, then page rerouting.
    const rt = await routeWithPages(r.q, await route(r.q));
    const out = rt.route === "navigation" ? await resolvePage(r.q) : null;
    const got = out?.action?.route_path || null;
    if (out?.clarify) {
      // asking is acceptable only when the right page is among the options
      const ok = r.route && out.clarify.options.some((o) => o.route_path === r.route);
      if (ok) { pass++; asked++; } else fails.push(`${r.q}\n      want ${r.route} · got ASK ${out.clarify.options.map((o) => o.route_path).join(" | ")}`);
      continue;
    }
    if (got === r.route) pass++;
    else fails.push(`${r.q}\n      want ${r.route} · got ${got}`);
  }
  console.log(`\n  page resolver — ${rows.length} questions\n`);
  console.log(`  accuracy   ${((100 * pass) / rows.length).toFixed(1)}%  (${pass}/${rows.length})${asked ? `  — ${asked} via a clarify` : ""}`);
  if (fails.length) { console.log(`\n  ${fails.length} failure(s):\n`); fails.forEach((f) => console.log(`    - ${f}`)); }
  else console.log("\n  no failures.");
  console.log();
  process.exit(fails.length ? 1 : 0);
})();
