const crypto = require("crypto");
const client = require("../connection");

const ALLOWED_MCORHQ_TYPES = ["hq", "mc", "sp", "public"];

let tableReady = null;

const ensureOfficerPassKeyTable = async () => {
    if (tableReady) return tableReady;

    tableReady = (async () => {
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.officer_pass_keys (
                id                 SERIAL PRIMARY KEY,
                pass_key           VARCHAR(4),
                emp_name           VARCHAR(255) NOT NULL,
                emp_designation    VARCHAR(255) NOT NULL,
                emp_phone_number   BIGINT NOT NULL,
                emp_email          VARCHAR(255),
                login_id           INTEGER,
                mcorhq_type        VARCHAR(50),
                is_active          BOOLEAN NOT NULL DEFAULT TRUE,
                approval_status    VARCHAR(20) NOT NULL DEFAULT 'pending',
                approval_token     VARCHAR(64),
                approval_token_expires_at TIMESTAMPTZ,
                approved_at        TIMESTAMPTZ,
                rejected_at        TIMESTAMPTZ,
                request_remark     TEXT,
                last_used_at       TIMESTAMPTZ,
                created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);
        await client.query(`
            ALTER TABLE public.officer_pass_keys
                ALTER COLUMN pass_key DROP NOT NULL
        `).catch(() => {});
        await client.query(`ALTER TABLE public.officer_pass_keys ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) NOT NULL DEFAULT 'pending'`);
        await client.query(`ALTER TABLE public.officer_pass_keys ADD COLUMN IF NOT EXISTS approval_token VARCHAR(64)`);
        await client.query(`ALTER TABLE public.officer_pass_keys ADD COLUMN IF NOT EXISTS approval_token_expires_at TIMESTAMPTZ`);
        await client.query(`ALTER TABLE public.officer_pass_keys ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ`);
        await client.query(`ALTER TABLE public.officer_pass_keys ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ`);
        await client.query(`ALTER TABLE public.officer_pass_keys ADD COLUMN IF NOT EXISTS request_remark TEXT`);
        await client.query(`ALTER TABLE public.officer_pass_keys ADD COLUMN IF NOT EXISTS pending_request_type VARCHAR(20)`);
        await client.query(`
            UPDATE public.officer_pass_keys
            SET approval_status = 'approved',
                approved_at = COALESCE(approved_at, created_at)
            WHERE pass_key IS NOT NULL
              AND approval_status = 'pending'
        `);
        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS uniq_officer_pass_key_active
                ON public.officer_pass_keys (pass_key)
                WHERE is_active = TRUE AND pass_key IS NOT NULL
        `);
        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS uniq_officer_phone_active
                ON public.officer_pass_keys (emp_phone_number)
                WHERE is_active = TRUE
        `);
        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS uniq_officer_email_active
                ON public.officer_pass_keys (LOWER(emp_email))
                WHERE is_active = TRUE AND emp_email IS NOT NULL
        `);
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_officer_pass_keys_name
                ON public.officer_pass_keys (emp_name)
        `);
    })();

    try {
        await tableReady;
    } catch (err) {
        tableReady = null;
        throw err;
    }
};

const parsePhoneNumber = (value) => {
    if (value == null || value === "") return null;
    const digits = String(value).replace(/\D/g, "");
    if (!digits) return null;
    const num = Number(digits);
    return Number.isSafeInteger(num) ? num : null;
};

const normalizePassKey = (value) => {
    if (value == null || value === "") {
        return { error: "pass_key is required" };
    }
    const str = String(value).trim();
    if (!/^\d{4}$/.test(str)) {
        return { error: "Pass Key must be a 4-digit code" };
    }
    return { passKey: str };
};

const parseOfficerPayload = (body, { partial = false } = {}) => {
    const hasName = body.emp_name != null || body.name != null;
    const hasDesignation = body.emp_designation != null || body.designation != null;
    const hasPhone = body.emp_phone_number != null || body.phone_number != null || body.phone != null;
    const hasEmail = body.emp_email != null || body.email != null;
    const hasLoginId = body.login_id != null || body.user_id != null;
    const hasMcorhq = body.mcorhq_type != null;

    const emp_name = hasName ? String(body.emp_name ?? body.name ?? "").trim() : undefined;
    const emp_designation = hasDesignation
        ? String(body.emp_designation ?? body.designation ?? "").trim()
        : undefined;
    const emp_phone_number = hasPhone
        ? parsePhoneNumber(body.emp_phone_number ?? body.phone_number ?? body.phone)
        : undefined;
    const emp_email = hasEmail
        ? String(body.emp_email ?? body.email ?? "").trim().toLowerCase() || null
        : undefined;
    const login_id = hasLoginId ? (body.login_id ?? body.user_id ?? null) : undefined;
    const mcorhq_type = hasMcorhq
        ? (body.mcorhq_type ? String(body.mcorhq_type).trim().toLowerCase() : null)
        : undefined;

    if (!partial) {
        if (!emp_name) return { error: "emp_name is required" };
        if (!emp_designation) return { error: "emp_designation is required" };
        if (emp_phone_number == null) return { error: "emp_phone_number is required" };
    } else {
        if (hasName && !emp_name) return { error: "emp_name cannot be empty" };
        if (hasDesignation && !emp_designation) return { error: "emp_designation cannot be empty" };
        if (hasPhone && emp_phone_number == null) return { error: "emp_phone_number is required" };
    }

    if (emp_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emp_email)) {
        return { error: "emp_email is invalid" };
    }
    if (mcorhq_type && !ALLOWED_MCORHQ_TYPES.includes(mcorhq_type)) {
        return { error: "mcorhq_type must be one of hq, mc, sp, public" };
    }

    return { emp_name, emp_designation, emp_phone_number, emp_email, login_id, mcorhq_type };
};

const serializeOfficer = (row, { includePassKey = true } = {}) => {
    if (!row) return null;
    return {
        id: row.id,
        ...(includePassKey && row.pass_key && row.approval_status !== "pending"
            ? { pass_key: row.pass_key }
            : {}),
        emp_name: row.emp_name,
        emp_designation: row.emp_designation,
        emp_phone_number: row.emp_phone_number,
        emp_email: row.emp_email,
        login_id: row.login_id,
        mcorhq_type: row.mcorhq_type,
        approval_status: row.approval_status || (row.pass_key ? "approved" : "pending"),
        pending_request_type: row.pending_request_type || null,
        is_active: row.is_active,
        last_used_at: row.last_used_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
};

const applyOfficerToBody = (body, officer) => {
    body.emp_name = officer.emp_name;
    body.emp_designation = officer.emp_designation;
    body.emp_phone_number = officer.emp_phone_number;
    body.emp_email = officer.emp_email;
    if (body.login_id == null && officer.login_id != null) {
        body.login_id = officer.login_id;
    }
    if (!body.mcorhq_type && officer.mcorhq_type) {
        body.mcorhq_type = officer.mcorhq_type;
    }
};

const findActiveByPassKey = async (passKey) => {
    await ensureOfficerPassKeyTable();
    const result = await client.query(
        `SELECT * FROM public.officer_pass_keys
         WHERE pass_key = $1
           AND is_active = TRUE
           AND COALESCE(approval_status, 'approved') = 'approved'`,
        [passKey]
    );
    return result.rows[0] || null;
};

/** True when a reset is waiting for HQ — old Pass Key remains valid until approved. */
const hasPendingReset = (row) =>
    row?.pending_request_type === "reset" && row?.approval_token != null;

const findActiveById = async (id) => {
    await ensureOfficerPassKeyTable();
    const result = await client.query(
        `SELECT * FROM public.officer_pass_keys WHERE id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

const touchLastUsed = async (id) => {
    await client.query(
        `UPDATE public.officer_pass_keys SET last_used_at = NOW() WHERE id = $1`,
        [id]
    );
};

const generateUniquePassKey = async () => {
    await ensureOfficerPassKeyTable();
    for (let i = 0; i < 40; i++) {
        const passKey = String(crypto.randomInt(0, 10000)).padStart(4, "0");
        const existing = await client.query(
            `SELECT 1 FROM public.officer_pass_keys
             WHERE pass_key = $1 AND is_active = TRUE`,
            [passKey]
        );
        if (existing.rows.length === 0) return passKey;
    }
    const err = new Error("Unable to generate a unique Pass Key. Please try again.");
    err.statusCode = 503;
    throw err;
};

const findDuplicateOfficer = async ({ emp_phone_number, emp_email, excludeId = null }) => {
    await ensureOfficerPassKeyTable();

    if (emp_phone_number != null) {
        const phoneMatch = await client.query(
            `SELECT id, pass_key, emp_name, emp_phone_number, approval_status
             FROM public.officer_pass_keys
             WHERE emp_phone_number = $1 AND is_active = TRUE
               AND COALESCE(approval_status, 'approved') IN ('pending', 'approved')
               AND ($2::int IS NULL OR id <> $2)`,
            [emp_phone_number, excludeId]
        );
        if (phoneMatch.rows.length) {
            return { field: "emp_phone_number", row: phoneMatch.rows[0] };
        }
    }

    if (emp_email) {
        const emailMatch = await client.query(
            `SELECT id, pass_key, emp_name, emp_email, approval_status
             FROM public.officer_pass_keys
             WHERE LOWER(emp_email) = $1 AND is_active = TRUE
               AND COALESCE(approval_status, 'approved') IN ('pending', 'approved')
               AND ($2::int IS NULL OR id <> $2)`,
            [emp_email, excludeId]
        );
        if (emailMatch.rows.length) {
            return { field: "emp_email", row: emailMatch.rows[0] };
        }
    }

    return null;
};

const duplicateErrorMessage = (dup) => {
    const pending = dup.row?.approval_status === "pending";
    if (dup.field === "emp_email") {
        return pending
            ? "A Pass Key request for this email is already waiting for HQ approval."
            : "A Pass Key already exists for this email. Use Forgot Pass Key to recover it.";
    }
    return pending
        ? "A Pass Key request for this phone number is already waiting for HQ approval."
        : "A Pass Key already exists for this phone number. Use Forgot Pass Key to recover it.";
};

const hydratedBodies = new WeakSet();

/**
 * If body.pass_key is present, look up the officer and copy identity fields onto body.
 * Does nothing when pass_key is omitted.
 */
const hydrateOfficerFromPassKey = async (body) => {
    if (!body || typeof body !== "object") return { hydrated: false };
    if (hydratedBodies.has(body)) return { hydrated: true };

    const raw = body.pass_key ?? body.passKey;
    if (raw == null || raw === "") return { hydrated: false };

    const parsed = normalizePassKey(raw);
    if (parsed.error) return { error: parsed.error };

    const officer = await findActiveByPassKey(parsed.passKey);
    if (!officer) return { error: "Invalid Pass Key" };

    applyOfficerToBody(body, officer);
    hydratedBodies.add(body);
    await touchLastUsed(officer.id);
    return { hydrated: true, officer };
};

/**
 * Accept either pass_key (+ optional remark) or full officer identification fields.
 */
const resolveOfficerIdentity = async (body, { requireRemarkWithPassKey = false } = {}) => {
    const result = await hydrateOfficerFromPassKey(body);
    if (result.error) return result;

    if (result.hydrated) {
        if (requireRemarkWithPassKey && !String(body.remark ?? "").trim()) {
            return { error: "remark is required" };
        }
        return result;
    }

    const payload = parseOfficerPayload(body);
    if (payload.error) return { error: payload.error };
    return { hydrated: false };
};

module.exports = {
    ensureOfficerPassKeyTable,
    parsePhoneNumber,
    normalizePassKey,
    parseOfficerPayload,
    serializeOfficer,
    applyOfficerToBody,
    findActiveByPassKey,
    findActiveById,
    touchLastUsed,
    generateUniquePassKey,
    findDuplicateOfficer,
    duplicateErrorMessage,
    hydrateOfficerFromPassKey,
    resolveOfficerIdentity,
    hasPendingReset,
};
