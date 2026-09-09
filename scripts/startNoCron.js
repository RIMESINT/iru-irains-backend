#!/usr/bin/env node
/**
 * Start the backend with scheduled jobs disabled.
 *
 *   npm run start:nocron
 *
 * Same Express app, same routes, same database — but controllers/CronJobs.js
 * is never evaluated. Use this for local development and demos so the machine
 * does not fire data-entry locks, publish flags, AWS fetchers, season
 * aggregation or reminder emails against the live database.
 *
 * Use `npm start` for anything that is meant to run those jobs.
 */
const path = require("path");
const Module = require("module");

const ROOT = path.join(__dirname, "..");
const cronPath = path.join(ROOT, "controllers/CronJobs.js");

const stub = new Module(cronPath, null);
stub.filename = cronPath;
stub.loaded = true;
stub.exports = {};
require.cache[cronPath] = stub;

console.log("[nocron] CronJobs.js stubbed — no scheduled DB writes, no reminder emails");

process.chdir(ROOT);
require(path.join(ROOT, "index.js"));
