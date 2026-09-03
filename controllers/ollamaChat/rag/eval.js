#!/usr/bin/env node
/**
 * Varsha RAG eval harness.
 *
 *   npm run rag:eval                 routing + retrieval only (fast, no LLM)
 *   npm run rag:eval -- --plan       also run the planner LLM and score api_id
 *   npm run rag:eval -- --filter=nav restrict to matching questions
 *
 * Run before and after every chunker, prompt, retrieval or model change.
 * Without a score you are tuning blind.
 */

const fs = require("fs");
const path = require("path");

const { route: routeQuestion } = require("./router");
const { retrieve, retrieveForPlanner, formatContext } = require("./retriever");
const { init } = require("./retriever");
const { askOllama, extractJsonObject, isOllamaUp } = require("../ollamaClient");
const { resolveAllowedApi } = require("../catalogLoader");
const {
  buildPlannerSystemPrompt,
  healNavigationContradiction,
} = require("../chatService");

const EVAL_PATH = path.join(__dirname, "../../../docs/rag_eval.jsonl");

function loadRows() {
  return fs
    .readFileSync(EVAL_PATH, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

function pct(n, d) {
  return d ? `${((n / d) * 100).toFixed(1)}%` : "n/a";
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
}

async function main() {
  const doPlan = process.argv.includes("--plan");
  const filterArg = process.argv.find((a) => a.startsWith("--filter="));
  const filter = filterArg ? filterArg.split("=")[1].toLowerCase() : null;

  let rows = loadRows();
  if (filter) {
    rows = rows.filter(
      (r) => r.question.toLowerCase().includes(filter) || r.route === filter
    );
  }

  init();

  const up = await isOllamaUp();
  if (!up.up) {
    console.error(`Ollama is not running at ${up.baseUrl}. Start it with: ollama serve`);
    process.exit(1);
  }

  console.log(`\niRAINS RAG eval — ${rows.length} questions${doPlan ? " (with planner LLM)" : ""}\n`);

  const stats = {
    route: { ok: 0, n: 0 },
    recall: { ok: 0, n: 0 },
    source: { ok: 0, n: 0 },
    apiId: { ok: 0, n: 0 },
    apiValid: { ok: 0, n: 0 },
  };
  const latencies = [];
  const contextTokens = [];
  const failures = [];

  for (const row of rows) {
    const t0 = Date.now();

    // --- routing ---
    const routing = await routeQuestion(row.question);
    stats.route.n++;
    const routeOk = routing.route === row.route;
    if (routeOk) stats.route.ok++;
    else
      failures.push(
        `ROUTE  got ${routing.route} want ${row.route}  (${routing.stage})  "${row.question}"`
      );

    // --- retrieval ---
    if (row.route === "knowledge") {
      const res = await retrieve(row.question, { topK: 6 });
      stats.source.n++;
      const hit =
        !row.expect_source ||
        res.chunks.some((c) =>
          c.heading.toLowerCase().includes(String(row.expect_source).toLowerCase())
        );
      if (hit) stats.source.ok++;
      else
        failures.push(
          `SOURCE want "${row.expect_source}" not in top6  "${row.question}"\n         got: ${res.chunks
            .slice(0, 3)
            .map((c) => c.heading.slice(0, 50))
            .join(" | ")}`
        );
      contextTokens.push(
        Math.ceil(formatContext({ chunks: res.chunks, pins: [] }).length / 4)
      );
    } else {
      const res = await retrieveForPlanner(row.question);
      const ctx = formatContext(res);
      contextTokens.push(Math.ceil(ctx.length / 4));

      // recall@6: is at least one acceptable api_id present in the context?
      if (row.api_id?.length) {
        stats.recall.n++;
        const present = new Set(res.chunks.flatMap((c) => c.api_ids || []));
        const navOk =
          row.api_id.includes("resolve_product_route") &&
          res.chunks.some((c) => c.type === "nav");
        const hit = navOk || row.api_id.some((id) => present.has(id));
        if (hit) stats.recall.ok++;
        else
          failures.push(
            `RECALL none of ${row.api_id.join("/")} in context  "${row.question}"`
          );
      }

      // --- optional: run the planner and score its choice ---
      if (doPlan && row.api_id?.length) {
        const plan = await askOllama(
          [
            { role: "system", content: buildPlannerSystemPrompt(ctx, { retrieved: true }) },
            { role: "user", content: row.question },
          ],
          { temperature: 0, formatJson: true }
        );
        let action = extractJsonObject(plan.content) || {};
        // Mirror production: the router/planner contradiction heal.
        action = await healNavigationContradiction({
          action,
          routing,
          plan,
          plannerContext: { text: ctx, retrieved: true },
          planQuestion: row.question,
        });
        stats.apiValid.n++;
        if (resolveAllowedApi(action)) stats.apiValid.ok++;
        else
          failures.push(
            `INVALID api_id "${action.api_id}" is not allowlisted  "${row.question}"`
          );

        stats.apiId.n++;
        if (row.api_id.includes(action.api_id)) stats.apiId.ok++;
        else
          failures.push(
            `API_ID got ${action.api_id} want ${row.api_id.join("/")}  "${row.question}"`
          );
      }
    }

    latencies.push(Date.now() - t0);
    process.stdout.write(`\r  ${latencies.length}/${rows.length}`);
  }

  // ---- report ----
  const sorted = [...latencies].sort((a, b) => a - b);
  const ctxSorted = [...contextTokens].sort((a, b) => a - b);

  console.log("\r" + " ".repeat(24) + "\r");
  console.log("  METRIC                    SCORE");
  console.log("  " + "-".repeat(46));
  console.log(
    `  routing accuracy          ${pct(stats.route.ok, stats.route.n).padStart(7)}  (${stats.route.ok}/${stats.route.n})`
  );
  console.log(
    `  api_id recall@6           ${pct(stats.recall.ok, stats.recall.n).padStart(7)}  (${stats.recall.ok}/${stats.recall.n})`
  );
  console.log(
    `  knowledge source hit@6    ${pct(stats.source.ok, stats.source.n).padStart(7)}  (${stats.source.ok}/${stats.source.n})`
  );
  if (doPlan) {
    console.log(
      `  planner api_id valid      ${pct(stats.apiValid.ok, stats.apiValid.n).padStart(7)}  (${stats.apiValid.ok}/${stats.apiValid.n})`
    );
    console.log(
      `  planner api_id exact      ${pct(stats.apiId.ok, stats.apiId.n).padStart(7)}  (${stats.apiId.ok}/${stats.apiId.n})`
    );
  }
  console.log("  " + "-".repeat(46));
  console.log(
    `  retrieval p50 / p95       ${percentile(sorted, 0.5)}ms / ${percentile(sorted, 0.95)}ms`
  );
  console.log(
    `  context tokens p50 / p95  ${percentile(ctxSorted, 0.5)} / ${percentile(ctxSorted, 0.95)}   (full catalog = 9233)`
  );

  if (failures.length) {
    console.log(`\n  ${failures.length} failure(s):\n`);
    failures.forEach((f) => console.log(`   - ${f}`));
  } else {
    console.log("\n  no failures.");
  }
  console.log();
}

main().catch((err) => {
  console.error("\nrag:eval failed:", err.message);
  process.exit(1);
});
