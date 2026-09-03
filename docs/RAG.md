# Varsha RAG — operator guide

The chat assistant answers from **retrieval**, not fine-tuning. To change what
it knows, edit a markdown source and rebuild the index.

## Quick start

```bash
ollama serve                 # must be running
ollama pull llama3.2         # chat model
ollama pull nomic-embed-text # embedding model
npm run rag:build            # build docs/rag_index.json
npm start
```

Check it worked: `GET /api/v1/ollama-chat/health` → `rag.ready: true`.

## The bug this replaced

`askOllama()` never set `num_ctx`, so Ollama used its **2048-token default**
while the planner prompt (rules + the whole API catalog) was **~11,250 tokens**.
Ollama truncates silently — it does not error. The model saw only the last
~2,048 tokens and never read the JSON output contract, the date rules, the API
definitions or a single few-shot example.

Measured, same question and model:

| `options` | `prompt_eval_count` | "rainfall for Maharashtra?" | "which districts are deficient today?" |
|---|---|---|---|
| `{temperature:0}` | 2,050 / 11,251 | `fetch_station_data` ✗ | `fetch_district_deficiency` ✗ invented |
| `{temperature:0, num_ctx:16384}` | 11,251 / 11,251 | `fetch_state_data` ✓ | `fetch_district_data` ✓ |

The invented `api_id` failed `resolveAllowedApi()` and became
"That one is outside iRAINS" — the reported symptom. The allowlist was working
correctly; it was catching a hallucination that truncation caused.

**Never remove `num_ctx` from `ollamaClient.js`.** `/health` → `context_budget`
reports it, and `askOllama` warns when a prompt exceeds the window.

## How a question is answered

```
question
  → router.js          data / knowledge / navigation   (deterministic rules first)
  → knowledge  → retriever (technical document) → grounded answer + sources
  → data / nav → retriever (catalog sections) → planner LLM → allowlist → executor
```

Retrieval feeds the planner. It does **not** replace `resolveAllowedApi`, the
`sanitize*` chain or `executeApiAction` — those still decide what actually runs.

## Files

| File | Role |
|---|---|
| `rag/chunker.js` | Heading-aware markdown splitter. Fences and tables are atomic. |
| `rag/embedder` | `embedTexts()` in `ollamaClient.js` |
| `rag/indexStore.js` | Save/load, float32 packing, staleness hashing, cosine |
| `rag/buildIndex.js` | `npm run rag:build` |
| `rag/retriever.js` | Hybrid BM25 + dense, RRF fusion, boosts, pins |
| `rag/router.js` | data / knowledge / navigation |
| `rag/knowledge.js` | Grounded documentation answers with citations |
| `rag/eval.js` | `npm run rag:eval` |

## Sources

| Source | Feeds |
|---|---|
| `docs/IRAINS_API_CATALOG.md` | API planning (endpoint specs, worked examples) |
| `docs/IRAINS_READONLY_API_CATALOG.md` | Broader endpoint reference |
| `docs/IRAINS_TECHNICAL_DOCUMENT.md` | How modules work, terminology, workflows |
| `SAMPLE_QUESTIONS` in `catalogLoader.js` | Labelled intents for the router |

**Edit a source → run `npm run rag:build`.** The index stores a hash per source;
`/health` reports `rag.stale: true` and the server warns at boot when they drift.

## Chunk types

`api_spec` `contract` `few_shot` `nav` `concept` `glossary` `workflow`
`schema` `sample`

Two are withheld from user-facing answers by default:

- **`schema`** — Appendix A, the database schema. Internal reference only.
- **`sample`** — the 44 curated questions. Router labels, not content. Indexed
  as retrievable content they outranked the catalog's own worked examples on
  every question-shaped query, and the planner got six restatements of the
  question instead of one API definition.

Appendices **D (Glossary)** and **E (IMD Rainfall Classification)** are typed
`glossary`, not `schema` — they are the best answers in the corpus for "what
does Large Deficient mean" and must stay user-visible.

## Retrieval design

**Hybrid, not dense-only.** Users type exact identifiers — `Large Deficient`,
`QPF`, `fetch_block_data`, `MC/RMC` — and embeddings blur precisely those.
BM25 catches the identifier, the embedding catches the paraphrase. Fused with
Reciprocal Rank Fusion (k=60).

**Stratified for the planner.** `retrieveForPlanner()` retrieves api_spec and
few_shot separately, so the prompt always contains real endpoint definitions.
Plain top-K returned six worked examples and zero API specs.

**Boosts.** Administrative level (district/state/subdivision/…) → matching
`api_spec`; explicit `api_id`; topic-vs-heading, which breaks the tie between
the near-identical `Module: X > APIs` sections.

**Pins.** The JSON output contract and date rules are always prepended.
Retrieval decides *which APIs* the model sees, never *whether it knows the
output format*.

## Eval

```bash
npm run rag:eval             # routing + retrieval, no LLM (~30s)
npm run rag:eval -- --plan   # also runs the planner and scores api_id (~7min)
```

Dataset: `docs/rag_eval.jsonl` (56 questions). Current scores:

```
routing accuracy           100.0%  (56/56)
api_id recall@6            100.0%  (44/44)
knowledge source hit@6     100.0%  (12/12)
planner api_id valid       100.0%  (44/44)
planner api_id exact       100.0%  (44/44)
context tokens p50 / p95     2597 / 3522   (full catalog = 9233)
```

Run it before and after every chunker, prompt, retrieval or model change.
Add a row whenever a real question is answered wrongly — that is how the set
stays worth running.

## Tuning

| Variable | Default | Notes |
|---|---|---|
| `OLLAMA_NUM_CTX` | `16384` | Clamped to ≥4096. Below the prompt size = silent truncation. |
| `OLLAMA_MODEL` | `llama3.2` | See below. |
| `OLLAMA_EMBED_MODEL` | `nomic-embed-text` | Changing it requires `rag:build`. |
| `RAG_ENABLED` | `true` | `false` falls back to full-catalog prompts. |
| `RAG_TOP_K` | `6` | Fused results per question. |

## Known limits

- **llama3.2 is 3.2B** and is the weakest link in structured planning. It still
  answers `resolve_product_route` to "Which MCs have stations missing today?"
  because "MC" matches the MC/RMC map route — retrieval ranks the right chunk
  first and the model ignores it. `healNavigationContradiction()` catches this
  by re-planning when the deterministic router and the planner disagree. With
  prompts now ~2,600 tokens, `qwen2.5:7b-instruct` or `llama3.1:8b` is worth an
  A/B; measure with `npm run rag:eval -- --plan` before switching.
- **Two resident models** (chat + embedder, ~300MB). Confirm RAM on the server.
- **Latency**: two sequential LLM calls per data question. p50 ≈ 7s end to end.
  If that is too slow, collapse planning and answering into one call for simple
  cases before adding hardware.
- **No vector database, deliberately.** 567 chunks is a sub-5ms in-memory scan.
  Revisit around ~50k chunks.

## Deployment checklist

1. `ollama serve` running and supervised (systemd / pm2).
2. `ollama pull llama3.2 && ollama pull nomic-embed-text`.
3. `npm run rag:build` — after every documentation change.
4. `GET /api/v1/ollama-chat/health` → `success: true`, `rag.ready: true`,
   `rag.stale: false`, `context_budget.warning: null`.
