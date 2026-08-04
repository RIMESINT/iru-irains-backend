const client = require("../connection");

// ALL STATISTICS — default selection (which products open ticked).
// Table: all_statistics_default_selection
//        (migrations/create_all_statistics_default_selection.sql)

const SCOPES = ["DRMS", "REGIONAL", "BRMS", "STATE", "MC"];
const MAX_ITEMS = 500; // 5 DRMS + 1 BRMS + 36 states today, with room to grow

function parseUsername(value) {
    const username = String(value || "").trim();
    if (!username) return { error: "username is required" };
    if (username.length > 255) return { error: "username cannot exceed 255 characters" };
    return { username };
}

function parseScope(value) {
    const scope = String(value || "").toUpperCase().trim();
    if (!SCOPES.includes(scope)) {
        return { error: `scope must be one of ${SCOPES.join(", ")}` };
    }
    return { scope };
}

function parseKey(value) {
    const key = String(value || "").trim();
    if (!key) return { error: "key is required" };
    if (key.length > 120) return { error: "key cannot exceed 120 characters" };
    return { key };
}

/**
 * Normalise the ticked-products payload.
 * Rows with neither box ticked are dropped — absent means unticked.
 */
function parseItems(raw) {
    if (raw === undefined || raw === null) return { error: "items is required" };
    if (!Array.isArray(raw)) return { error: "items must be an array" };
    if (raw.length > MAX_ITEMS) return { error: `items cannot exceed ${MAX_ITEMS} entries` };

    const items = [];
    const seen = new Set();

    for (let i = 0; i < raw.length; i++) {
        const it = raw[i] || {};
        const s = parseScope(it.scope);
        if (s.error) return { error: `items[${i}].${s.error}` };
        const k = parseKey(it.key);
        if (k.error) return { error: `items[${i}].${k.error}` };

        const id = `${s.scope}::${k.key}`;
        if (seen.has(id)) return { error: `items contains ${id} more than once` };
        seen.add(id);

        const map = it.map === true;
        const doc = it.doc === true;
        if (!map && !doc) continue; // unticked = no row

        items.push({ scope: s.scope, key: k.key, map, doc });
    }

    return { items };
}

// GET /api/v1/all-statistics/default-selection?username=...
// Everything this user has ticked. Empty array when they have never saved.
exports.getDefaultSelection = async (req, res) => {
    try {
        const parsedUser = parseUsername(req.query.username);
        if (parsedUser.error) {
            return res.status(400).json({ success: false, message: parsedUser.error });
        }

        const result = await client.query(
            `SELECT scope, item_key AS key, map_selected AS map, doc_selected AS doc, updated_at
               FROM all_statistics_default_selection
              WHERE username = $1
              ORDER BY scope, item_key`,
            [parsedUser.username]
        );

        res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
    } catch (error) {
        console.error("[ALL STATISTICS DEFAULT] getDefaultSelection:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/v1/all-statistics/default-selection
// Body: { username, items: [{ scope, key, map, doc }] }
//
// Save Selection: replaces this user's whole default set with what is on
// screen. Sending an empty items array clears the default entirely, which is
// the correct outcome when the user unticks everything and saves.
exports.saveDefaultSelection = async (req, res) => {
    try {
        const parsedUser = parseUsername(req.body.username);
        if (parsedUser.error) {
            return res.status(400).json({ success: false, message: parsedUser.error });
        }
        const parsedItems = parseItems(req.body.items);
        if (parsedItems.error) {
            return res.status(400).json({ success: false, message: parsedItems.error });
        }

        const { username } = parsedUser;
        const { items } = parsedItems;

        // Replace-in-one-transaction: the user's saved default is exactly what
        // was on screen, and a mid-way failure leaves the old set untouched.
        await client.query("BEGIN");
        try {
            await client.query(
                `DELETE FROM all_statistics_default_selection WHERE username = $1`,
                [username]
            );

            if (items.length > 0) {
                // One multi-row INSERT rather than a statement per product —
                // 42 rows on a full selection. $1 is the username, then four
                // placeholders per item.
                const params = [username];
                const tuples = items.map((it) => {
                    const b = params.length + 1;
                    params.push(it.scope, it.key, it.map, it.doc);
                    return `($1, $${b}, $${b + 1}, $${b + 2}, $${b + 3})`;
                });

                await client.query(
                    `INSERT INTO all_statistics_default_selection
                         (username, scope, item_key, map_selected, doc_selected)
                     VALUES ${tuples.join(", ")}`,
                    params
                );
            }

            await client.query("COMMIT");
        } catch (inner) {
            await client.query("ROLLBACK");
            throw inner;
        }

        res.status(200).json({
            success: true,
            message: items.length
                ? `Default selection saved (${items.length} product${items.length === 1 ? "" : "s"})`
                : "Default selection cleared",
            count: items.length,
            data: items,
        });
    } catch (error) {
        console.error("[ALL STATISTICS DEFAULT] saveDefaultSelection:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/v1/all-statistics/default-selection/toggle
// Body: { username, scope, key, map, doc }
//
// Persist a single checkbox as it is clicked, for a page that saves on click
// instead of behind a Save button. Both boxes false removes the row.
exports.toggleDefaultSelection = async (req, res) => {
    try {
        const parsedUser = parseUsername(req.body.username);
        if (parsedUser.error) {
            return res.status(400).json({ success: false, message: parsedUser.error });
        }
        const s = parseScope(req.body.scope);
        if (s.error) return res.status(400).json({ success: false, message: s.error });
        const k = parseKey(req.body.key);
        if (k.error) return res.status(400).json({ success: false, message: k.error });

        const map = req.body.map === true;
        const doc = req.body.doc === true;

        if (!map && !doc) {
            const removed = await client.query(
                `DELETE FROM all_statistics_default_selection
                  WHERE username = $1 AND scope = $2 AND item_key = $3
                  RETURNING scope, item_key AS key`,
                [parsedUser.username, s.scope, k.key]
            );
            return res.status(200).json({
                success: true,
                message: "Unticked",
                data: { scope: s.scope, key: k.key, map: false, doc: false },
                removed: removed.rows.length > 0,
            });
        }

        const result = await client.query(
            `INSERT INTO all_statistics_default_selection
                 (username, scope, item_key, map_selected, doc_selected)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT ON CONSTRAINT uq_all_stats_default_user_item
             DO UPDATE SET map_selected = EXCLUDED.map_selected,
                           doc_selected = EXCLUDED.doc_selected,
                           updated_at   = NOW()
             RETURNING scope, item_key AS key, map_selected AS map, doc_selected AS doc`,
            [parsedUser.username, s.scope, k.key, map, doc]
        );

        res.status(200).json({ success: true, message: "Saved", data: result.rows[0] });
    } catch (error) {
        console.error("[ALL STATISTICS DEFAULT] toggleDefaultSelection:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/v1/all-statistics/default-selection?username=...
// Forget this user's default entirely; the console opens with nothing ticked.
exports.clearDefaultSelection = async (req, res) => {
    try {
        const parsedUser = parseUsername(req.body.username || req.query.username);
        if (parsedUser.error) {
            return res.status(400).json({ success: false, message: parsedUser.error });
        }

        const result = await client.query(
            `DELETE FROM all_statistics_default_selection WHERE username = $1`,
            [parsedUser.username]
        );

        res.status(200).json({
            success: true,
            message: "Default selection cleared",
            removed: result.rowCount,
        });
    } catch (error) {
        console.error("[ALL STATISTICS DEFAULT] clearDefaultSelection:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
