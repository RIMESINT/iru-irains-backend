/**
 * Shared database status, set by index.js.
 *
 * Lets the chat answer "the rainfall database can't be reached" in
 * milliseconds instead of letting a query sit on a dead connection for 90s.
 */
const state = { up: null, since: null, reason: null };

module.exports = {
  setUp() { state.up = true; state.since = new Date().toISOString(); state.reason = null; },
  setDown(reason) { state.up = false; state.since = new Date().toISOString(); state.reason = reason || null; },
  isDown() { return state.up === false; },
  get() { return { ...state }; },
};
