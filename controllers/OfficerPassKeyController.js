const client = require("../connection");
const crypto = require("crypto");
const sendEmail = require("../configEmail");
const {
    ensureOfficerPassKeyTable,
    parseOfficerPayload,
    serializeOfficer,
    findActiveByPassKey,
    findActiveById,
    generateUniquePassKey,
    findDuplicateOfficer,
    duplicateErrorMessage,
    hydrateOfficerFromPassKey,
    parsePhoneNumber,
    hasPendingReset,
} = require("../utils/officerPassKey");

const sendPassKeyEmail = async ({ to, emp_name, pass_key, action }) => {
    const recipient = process.env.PASS_KEY_EMAIL_TO || to;
    if (!recipient) return { sent: false };
    const subject =
        action === "forgot"
            ? "iRAINS Pass Key recovery"
            : action === "regenerate"
            ? "iRAINS Pass Key updated"
            : "Your iRAINS Data Management Pass Key";

    const intro =
        action === "forgot"
            ? "You requested recovery of your Data Management Pass Key."
            : action === "regenerate"
            ? "Your Data Management Pass Key was regenerated. The previous Pass Key is no longer valid."
            : "A Data Management Pass Key has been created for you.";

    const html = `
        <p>Dear ${emp_name || "Officer"},</p>
        <p>${intro}</p>
        <p>Your 4-digit Pass Key is: <strong style="font-size:20px;letter-spacing:4px">${pass_key}</strong></p>
        <p>Use this Pass Key with Reason/Remarks when you visit Data Management. Do not share it with others.</p>
        <p>Regards,<br/>iRAINS</p>
    `;

    try {
        const result = await sendEmail({
            to: recipient,
            subject,
            text: `${intro} Your Pass Key is ${pass_key}.`,
            html,
        });
        return { sent: Boolean(result?.success) };
    } catch (err) {
        console.error("[OFFICER PASS KEY] email failed:", err.message);
        return { sent: false };
    }
};

const escapeHtml = (value) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

const approvalHtmlPage = ({ title, heading, body, ok }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 32px; color: #222; }
    .card { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 8px; padding: 28px 32px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
    h1 { margin: 0 0 12px; font-size: 22px; color: ${ok ? "#0b7a3b" : "#b42318"}; }
    p { line-height: 1.5; color: #444; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(heading)}</h1>
    <p>${body}</p>
  </div>
</body>
</html>`;

const getApprovalBaseUrl = (req) => {
    if (process.env.API_BASE_URL) return String(process.env.API_BASE_URL).replace(/\/$/, "");
    const host = req?.get?.("host");
    if (host) return `${req.protocol}://${host}`;
    return `http://localhost:${process.env.PORT || 3000}`;
};

const getHqApprovalEmails = async () => {
    const emails = new Set();
    const configured = process.env.HQ_APPROVAL_EMAIL || process.env.PASS_KEY_EMAIL_TO;
    if (configured) {
        String(configured)
            .split(",")
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean)
            .forEach((e) => emails.add(e));
    }
    try {
        const result = await client.query(
            `SELECT DISTINCT username
             FROM public.login
             WHERE LOWER(TRIM(mcorhq)) = 'hq'
               AND username LIKE '%@%'
               AND (status IS NULL OR status = 1)`
        );
        result.rows.forEach((row) => emails.add(String(row.username).trim().toLowerCase()));
    } catch (err) {
        console.error("[OFFICER PASS KEY] HQ emails:", err.message);
    }
    return Array.from(emails);
};

const sendHqApprovalEmail = async ({ officer, approveUrl, rejectUrl, requestType = "create" }) => {
    const recipients = await getHqApprovalEmails();
    if (!recipients.length) return { sent: false, to: [] };

    const isReset = requestType === "reset";
    const subject = isReset
        ? `iRAINS: Approve Pass Key reset — ${officer.emp_name}`
        : `iRAINS: Approve Pass Key request — ${officer.emp_name}`;
    const intro = isReset
        ? "An officer has requested a <strong>Pass Key reset</strong>. The current Pass Key stays valid until you approve; a new 4-digit code will be issued after approval."
        : "An officer has requested a new Data Management Pass Key.";
    const actionNote = isReset
        ? "A new 4-digit Pass Key will be generated only after you approve. The previous Pass Key will stop working once approved."
        : "The 4-digit Pass Key will be generated only after you approve.";
    const html = `
        <p>${intro}</p>
        <table cellpadding="6" cellspacing="0" border="1" style="border-collapse:collapse">
          <tr><td><strong>Name</strong></td><td>${escapeHtml(officer.emp_name)}</td></tr>
          <tr><td><strong>Designation</strong></td><td>${escapeHtml(officer.emp_designation)}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${escapeHtml(officer.emp_phone_number)}</td></tr>
          <tr><td><strong>Email</strong></td><td>${escapeHtml(officer.emp_email || "-")}</td></tr>
          <tr><td><strong>Remarks</strong></td><td>${escapeHtml(officer.request_remark || "-")}</td></tr>
          ${isReset && officer.pass_key ? `<tr><td><strong>Current Pass Key</strong></td><td>${escapeHtml(officer.pass_key)} (valid until reset approved)</td></tr>` : ""}
        </table>
        <p>${actionNote}</p>
        <p style="margin:24px 0">
          <a href="${approveUrl}" style="background:#1a73e8;color:#ffffff;padding:12px 22px;text-decoration:none;border-radius:4px;font-weight:bold;display:inline-block">Approve</a>
          &nbsp;&nbsp;
          <a href="${rejectUrl}" style="background:#d93025;color:#ffffff;padding:12px 22px;text-decoration:none;border-radius:4px;font-weight:bold;display:inline-block">Reject</a>
        </p>
        <p>This link is valid for 7 days.</p>
        <p>Regards,<br/>iRAINS</p>
    `;

    let sent = false;
    for (const to of recipients) {
        const result = await sendEmail({
            to,
            subject,
            text: `${officer.emp_name} requested a Pass Key${isReset ? " reset" : ""}. Approve: ${approveUrl}`,
            html,
        });
        sent = sent || Boolean(result?.success);
    }
    return { sent, to: recipients };
};

const sendHqApprovalForOfficer = async (req, officer, requestType) => {
    const approval_token = crypto.randomBytes(32).toString("hex");
    const updated = await client.query(
        `UPDATE public.officer_pass_keys
         SET pending_request_type = $2,
             approval_token = $3,
             approval_token_expires_at = NOW() + INTERVAL '7 days',
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [officer.id, requestType, approval_token]
    );
    const row = updated.rows[0];
    const baseUrl = getApprovalBaseUrl(req);
    const approveUrl = `${baseUrl}/api/v1/officer-pass-keys/approve/${approval_token}`;
    const rejectUrl = `${baseUrl}/api/v1/officer-pass-keys/reject/${approval_token}`;
    const hqMail = await sendHqApprovalEmail({
        officer: row,
        approveUrl,
        rejectUrl,
        requestType,
    });
    return { officer: row, hqMail };
};

const parseId = (value) => {
    const id = Number.parseInt(value, 10);
    return Number.isInteger(id) && id > 0 ? id : null;
};

// POST /api/v1/officer-pass-keys
exports.createPassKey = async (req, res) => {
    try {
        await ensureOfficerPassKeyTable();
        const payload = parseOfficerPayload(req.body);
        if (payload.error) {
            return res.status(400).json({ success: false, message: payload.error });
        }

        const dup = await findDuplicateOfficer(payload);
        if (dup) {
            return res.status(409).json({
                success: false,
                code: "PASS_KEY_EXISTS",
                message: duplicateErrorMessage(dup),
            });
        }

        const approval_token = crypto.randomBytes(32).toString("hex");
        const request_remark = String(req.body.remark ?? req.body.reason ?? "").trim() || null;

        const result = await client.query(
            `INSERT INTO public.officer_pass_keys (
                emp_name, emp_designation, emp_phone_number,
                emp_email, login_id, mcorhq_type,
                approval_status, approval_token, approval_token_expires_at,
                pending_request_type, request_remark, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, NOW() + INTERVAL '7 days', 'create', $8, TRUE)
            RETURNING *`,
            [
                payload.emp_name,
                payload.emp_designation,
                payload.emp_phone_number,
                payload.emp_email,
                payload.login_id ?? null,
                payload.mcorhq_type ?? null,
                approval_token,
                request_remark,
            ]
        );

        const officer = result.rows[0];
        const baseUrl = getApprovalBaseUrl(req);
        const approveUrl = `${baseUrl}/api/v1/officer-pass-keys/approve/${approval_token}`;
        const rejectUrl = `${baseUrl}/api/v1/officer-pass-keys/reject/${approval_token}`;
        const hqMail = await sendHqApprovalEmail({
            officer,
            approveUrl,
            rejectUrl,
            requestType: "create",
        });

        res.status(201).json({
            success: true,
            status: "pending",
            message: "Pass Key request sent to HQ for approval. The 4-digit code will be issued after HQ clicks Approve.",
            hq_email_sent: hqMail.sent,
            officer: serializeOfficer(officer, { includePassKey: false }),
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                code: "PASS_KEY_EXISTS",
                message: "A Pass Key request already exists for this officer.",
            });
        }
        console.error("[OFFICER PASS KEY] createPassKey:", error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

const findRequestByToken = async (token) => {
    await ensureOfficerPassKeyTable();
    if (!token || !/^[a-f0-9]{64}$/i.test(token)) return null;
    const result = await client.query(
        `SELECT * FROM public.officer_pass_keys WHERE approval_token = $1`,
        [token]
    );
    return result.rows[0] || null;
};

const renderApproval = (res, status, payload) => {
    res.status(status).type("html").send(approvalHtmlPage(payload));
};

// GET /api/v1/officer-pass-keys/approve/:token
exports.approvePassKey = async (req, res) => {
    try {
        const officer = await findRequestByToken(req.params.token);
        if (!officer) {
            return renderApproval(res, 404, {
                title: "Invalid link",
                heading: "Invalid approval link",
                body: "This Approve link is invalid or has already been used.",
                ok: false,
            });
        }
        if (officer.approval_status === "approved" && officer.pass_key && !hasPendingReset(officer)) {
            return renderApproval(res, 200, {
                title: "Already approved",
                heading: "Already approved",
                body: `A Pass Key was already issued for ${escapeHtml(officer.emp_name)}.`,
                ok: true,
            });
        }
        if (officer.approval_status === "rejected" && officer.pending_request_type !== "reset") {
            return renderApproval(res, 400, {
                title: "Rejected",
                heading: "Request was rejected",
                body: "HQ already rejected this Pass Key request.",
                ok: false,
            });
        }
        if (officer.approval_token_expires_at && new Date(officer.approval_token_expires_at) < new Date()) {
            return renderApproval(res, 410, {
                title: "Link expired",
                heading: "Approval link expired",
                body: "This link is older than 7 days. Ask the officer to submit a new Pass Key request.",
                ok: false,
            });
        }

        const pass_key = await generateUniquePassKey();
        const isReset = officer.pending_request_type === "reset";
        const updated = await client.query(
            `UPDATE public.officer_pass_keys
             SET pass_key = $2,
                 approval_status = 'approved',
                 approved_at = NOW(),
                 approval_token = NULL,
                 approval_token_expires_at = NULL,
                 pending_request_type = NULL,
                 rejected_at = NULL,
                 is_active = TRUE,
                 updated_at = NOW()
             WHERE id = $1
               AND (
                 (approval_status = 'pending' AND pending_request_type = 'create')
                 OR (pending_request_type = 'reset' AND approval_token IS NOT NULL)
               )
             RETURNING *`,
            [officer.id, pass_key]
        );
        if (!updated.rows.length) {
            return renderApproval(res, 409, {
                title: "Already processed",
                heading: "Already processed",
                body: "This request was already approved or rejected.",
                ok: false,
            });
        }

        const issued = updated.rows[0];
        await sendPassKeyEmail({
            to: issued.emp_email,
            emp_name: issued.emp_name,
            pass_key: issued.pass_key,
            action: isReset ? "regenerate" : "create",
        });

        return renderApproval(res, 200, {
            title: "Approved",
            heading: isReset ? "Pass Key reset approved" : "Pass Key approved",
            body: isReset
                ? `HQ has approved the reset for <strong>${escapeHtml(issued.emp_name)}</strong>. A new 4-digit Pass Key has been generated and emailed. The previous Pass Key no longer works.`
                : `HQ has approved the request for <strong>${escapeHtml(issued.emp_name)}</strong>. The 4-digit Pass Key has been generated and emailed.`,
            ok: true,
        });
    } catch (error) {
        console.error("[OFFICER PASS KEY] approvePassKey:", error);
        return renderApproval(res, 500, {
            title: "Error",
            heading: "Could not approve",
            body: "Something went wrong while approving this request. Please try again.",
            ok: false,
        });
    }
};

// GET /api/v1/officer-pass-keys/reject/:token
exports.rejectPassKey = async (req, res) => {
    try {
        const officer = await findRequestByToken(req.params.token);
        if (!officer) {
            return renderApproval(res, 404, {
                title: "Invalid link",
                heading: "Invalid rejection link",
                body: "This Reject link is invalid or has already been used.",
                ok: false,
            });
        }
        if (officer.approval_status === "approved" && !hasPendingReset(officer)) {
            return renderApproval(res, 400, {
                title: "Already approved",
                heading: "Already approved",
                body: "This request was already approved. The Pass Key cannot be rejected from this link.",
                ok: false,
            });
        }
        if (officer.approval_status === "rejected" && officer.pending_request_type !== "reset") {
            return renderApproval(res, 200, {
                title: "Rejected",
                heading: "Already rejected",
                body: "This Pass Key request was already rejected.",
                ok: false,
            });
        }

        const isReset = officer.pending_request_type === "reset";
        if (isReset) {
            await client.query(
                `UPDATE public.officer_pass_keys
                 SET pending_request_type = NULL,
                     approval_token = NULL,
                     approval_token_expires_at = NULL,
                     approval_status = 'approved',
                     updated_at = NOW()
                 WHERE id = $1 AND pending_request_type = 'reset'`,
                [officer.id]
            );
            return renderApproval(res, 200, {
                title: "Rejected",
                heading: "Pass Key reset rejected",
                body: `The reset request for <strong>${escapeHtml(officer.emp_name)}</strong> was rejected. The existing Pass Key is unchanged and remains valid.`,
                ok: false,
            });
        }

        await client.query(
            `UPDATE public.officer_pass_keys
             SET approval_status = 'rejected',
                 rejected_at = NOW(),
                 approval_token = NULL,
                 approval_token_expires_at = NULL,
                 pending_request_type = NULL,
                 is_active = FALSE,
                 updated_at = NOW()
             WHERE id = $1 AND approval_status = 'pending'`,
            [officer.id]
        );

        return renderApproval(res, 200, {
            title: "Rejected",
            heading: "Pass Key request rejected",
            body: `The request for <strong>${escapeHtml(officer.emp_name)}</strong> has been rejected. No 4-digit Pass Key was issued.`,
            ok: false,
        });
    } catch (error) {
        console.error("[OFFICER PASS KEY] rejectPassKey:", error);
        return renderApproval(res, 500, {
            title: "Error",
            heading: "Could not reject",
            body: "Something went wrong while rejecting this request. Please try again.",
            ok: false,
        });
    }
};

// GET /api/v1/officer-pass-keys
exports.listPassKeys = async (req, res) => {
    try {
        await ensureOfficerPassKeyTable();
        const { q, is_active, limit = "50", offset = "0" } = req.query;
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
        const offsetNum = Math.max(parseInt(offset, 10) || 0, 0);

        const conditions = [];
        const params = [];
        let idx = 1;

        if (is_active === "true" || is_active === "false") {
            conditions.push(`is_active = $${idx}`);
            params.push(is_active === "true");
            idx += 1;
        }

        if (q && String(q).trim()) {
            const term = `%${String(q).trim()}%`;
            conditions.push(`(
                emp_name ILIKE $${idx}
                OR emp_designation ILIKE $${idx}
                OR emp_email ILIKE $${idx}
                OR pass_key ILIKE $${idx}
                OR CAST(emp_phone_number AS TEXT) ILIKE $${idx}
            )`);
            params.push(term);
            idx += 1;
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
        const result = await client.query(
            `SELECT COUNT(*) OVER()::int AS total, *
             FROM public.officer_pass_keys
             ${whereClause}
             ORDER BY emp_name ASC, id ASC
             LIMIT $${idx} OFFSET $${idx + 1}`,
            [...params, limitNum, offsetNum]
        );

        const total = result.rows[0]?.total ?? 0;
        const data = result.rows.map(({ total: _total, ...row }) => serializeOfficer(row));

        res.status(200).json({
            success: true,
            total,
            limit: limitNum,
            offset: offsetNum,
            data,
        });
    } catch (error) {
        console.error("[OFFICER PASS KEY] listPassKeys:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/v1/officer-pass-keys/:id
exports.getPassKey = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ success: false, message: "Invalid id" });

        const officer = await findActiveById(id);
        if (!officer) {
            return res.status(404).json({ success: false, message: "Pass Key not found" });
        }

        res.status(200).json({ success: true, officer: serializeOfficer(officer) });
    } catch (error) {
        console.error("[OFFICER PASS KEY] getPassKey:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/v1/officer-pass-keys/:id
exports.updatePassKey = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ success: false, message: "Invalid id" });

        const existing = await findActiveById(id);
        if (!existing) {
            return res.status(404).json({ success: false, message: "Pass Key not found" });
        }

        const payload = parseOfficerPayload(req.body, { partial: true });
        if (payload.error) {
            return res.status(400).json({ success: false, message: payload.error });
        }

        const next = {
            emp_name: payload.emp_name ?? existing.emp_name,
            emp_designation: payload.emp_designation ?? existing.emp_designation,
            emp_phone_number: payload.emp_phone_number ?? existing.emp_phone_number,
            emp_email: payload.emp_email !== undefined ? payload.emp_email : existing.emp_email,
            login_id: payload.login_id !== undefined ? payload.login_id : existing.login_id,
            mcorhq_type: payload.mcorhq_type !== undefined ? payload.mcorhq_type : existing.mcorhq_type,
        };

        const dup = await findDuplicateOfficer({ ...next, excludeId: id });
        if (dup) {
            return res.status(409).json({
                success: false,
                code: "PASS_KEY_EXISTS",
                message: duplicateErrorMessage(dup),
            });
        }

        const result = await client.query(
            `UPDATE public.officer_pass_keys
             SET emp_name = $2,
                 emp_designation = $3,
                 emp_phone_number = $4,
                 emp_email = $5,
                 login_id = $6,
                 mcorhq_type = $7,
                 updated_at = NOW()
             WHERE id = $1
             RETURNING *`,
            [
                id,
                next.emp_name,
                next.emp_designation,
                next.emp_phone_number,
                next.emp_email,
                next.login_id,
                next.mcorhq_type,
            ]
        );

        res.status(200).json({
            success: true,
            message: "Pass Key details updated",
            officer: serializeOfficer(result.rows[0]),
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                code: "PASS_KEY_EXISTS",
                message: "Another officer already uses this phone number or email.",
            });
        }
        console.error("[OFFICER PASS KEY] updatePassKey:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/v1/officer-pass-keys/:id
exports.deletePassKey = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ success: false, message: "Invalid id" });

        const existing = await findActiveById(id);
        if (!existing) {
            return res.status(404).json({ success: false, message: "Pass Key not found" });
        }

        const hard = String(req.query.hard || req.body?.hard || "") === "true";
        if (hard) {
            await client.query(`DELETE FROM public.officer_pass_keys WHERE id = $1`, [id]);
            return res.status(200).json({ success: true, message: "Pass Key deleted" });
        }

        if (!existing.is_active) {
            return res.status(200).json({ success: true, message: "Pass Key is already inactive" });
        }

        const result = await client.query(
            `UPDATE public.officer_pass_keys
             SET is_active = FALSE, updated_at = NOW()
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        res.status(200).json({
            success: true,
            message: "Pass Key deactivated",
            officer: serializeOfficer(result.rows[0]),
        });
    } catch (error) {
        console.error("[OFFICER PASS KEY] deletePassKey:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/v1/officer-pass-keys/:id/activate
exports.activatePassKey = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ success: false, message: "Invalid id" });

        const existing = await findActiveById(id);
        if (!existing) {
            return res.status(404).json({ success: false, message: "Pass Key not found" });
        }

        const dup = await findDuplicateOfficer({
            emp_phone_number: existing.emp_phone_number,
            emp_email: existing.emp_email,
            excludeId: id,
        });
        if (dup) {
            return res.status(409).json({
                success: false,
                code: "PASS_KEY_EXISTS",
                message: duplicateErrorMessage(dup),
            });
        }

        const clash = await findActiveByPassKey(existing.pass_key);
        const pass_key = clash && clash.id !== id ? await generateUniquePassKey() : existing.pass_key;

        const result = await client.query(
            `UPDATE public.officer_pass_keys
             SET is_active = TRUE, pass_key = $2, updated_at = NOW()
             WHERE id = $1
             RETURNING *`,
            [id, pass_key]
        );

        res.status(200).json({
            success: true,
            message: pass_key === existing.pass_key
                ? "Pass Key activated"
                : "Pass Key activated with a new code because the previous one is in use",
            pass_key,
            officer: serializeOfficer(result.rows[0]),
        });
    } catch (error) {
        console.error("[OFFICER PASS KEY] activatePassKey:", error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

// POST /api/v1/officer-pass-keys/verify
// Body: { pass_key, remark }
exports.verifyPassKey = async (req, res) => {
    try {
        const resolved = await hydrateOfficerFromPassKey(req.body);
        if (resolved.error) {
            return res.status(400).json({ success: false, message: resolved.error });
        }
        if (!resolved.hydrated) {
            return res.status(400).json({ success: false, message: "pass_key is required" });
        }

        const remark = String(req.body.remark ?? "").trim();
        if (!remark) {
            return res.status(400).json({ success: false, message: "remark is required" });
        }

        res.status(200).json({
            success: true,
            message: "Pass Key verified",
            remark,
            officer: serializeOfficer(resolved.officer),
        });
    } catch (error) {
        console.error("[OFFICER PASS KEY] verifyPassKey:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const findOfficerForRecovery = async (body) => {
    await ensureOfficerPassKeyTable();
    const emp_name = String(body.emp_name ?? body.name ?? "").trim();
    const emp_phone_number = parsePhoneNumber(
        body.emp_phone_number ?? body.phone_number ?? body.phone
    );
    const emp_email = String(body.emp_email ?? body.email ?? "").trim().toLowerCase();

    if (!emp_name) return { error: "emp_name is required" };
    if (emp_phone_number == null && !emp_email) {
        return { error: "emp_phone_number or emp_email is required" };
    }

    let result;
    if (emp_phone_number != null) {
        result = await client.query(
            `SELECT * FROM public.officer_pass_keys
             WHERE emp_phone_number = $1
               AND LOWER(TRIM(emp_name)) = LOWER($2)
               AND is_active = TRUE`,
            [emp_phone_number, emp_name]
        );
    } else {
        result = await client.query(
            `SELECT * FROM public.officer_pass_keys
             WHERE LOWER(emp_email) = $1
               AND LOWER(TRIM(emp_name)) = LOWER($2)
               AND is_active = TRUE`,
            [emp_email, emp_name]
        );
    }

    if (!result.rows.length) {
        return { error: "No Pass Key found for the given details" };
    }
    const officer = result.rows[0];
    if (officer.approval_status === "pending" && officer.pending_request_type === "create") {
        return { error: "Your Pass Key request is waiting for HQ approval" };
    }
    if (hasPendingReset(officer)) {
        return { error: "Your Pass Key reset request is waiting for HQ approval" };
    }
    if (officer.approval_status === "rejected") {
        return { error: "This Pass Key request was rejected. Please submit a new request." };
    }
    if (!officer.pass_key) {
        return { error: "Pass Key has not been issued yet" };
    }
    return { officer };
};

const findOfficerForReset = async (body) => {
    const found = await findOfficerForRecovery(body);
    if (found.error) return found;
    if (found.officer.approval_status !== "approved") {
        return { error: "Pass Key must be approved before it can be reset" };
    }
    return found;
};

const submitResetApprovalRequest = async (req, officer, remark = null) => {
    if (hasPendingReset(officer)) {
        return { error: "A Pass Key reset request is already waiting for HQ approval" };
    }
    const request_remark = remark != null ? String(remark).trim() || null : officer.request_remark;
    if (request_remark != null) {
        await client.query(
            `UPDATE public.officer_pass_keys SET request_remark = $2, updated_at = NOW() WHERE id = $1`,
            [officer.id, request_remark]
        );
        officer.request_remark = request_remark;
    }
    const { officer: updated, hqMail } = await sendHqApprovalForOfficer(req, officer, "reset");
    return { officer: updated, hqMail };
};

// POST /api/v1/officer-pass-keys/forgot
// Body: { emp_name, emp_phone_number } or { emp_name, emp_email }
exports.forgotPassKey = async (req, res) => {
    try {
        const found = await findOfficerForRecovery(req.body);
        if (found.error) {
            const status = found.error.startsWith("No Pass Key") ? 404 : 400;
            return res.status(status).json({ success: false, message: found.error });
        }

        const officer = found.officer;
        const email = await sendPassKeyEmail({
            to: officer.emp_email,
            emp_name: officer.emp_name,
            pass_key: officer.pass_key,
            action: "forgot",
        });

        res.status(200).json({
            success: true,
            message: email.sent
                ? "Pass Key recovered. It has also been sent to the registered email."
                : "Pass Key recovered",
            pass_key: officer.pass_key,
            email_sent: email.sent,
            officer: serializeOfficer(officer),
        });
    } catch (error) {
        console.error("[OFFICER PASS KEY] forgotPassKey:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// POST /api/v1/officer-pass-keys/regenerate
// Identity-based reset — requires HQ approval before a new code is issued
exports.regeneratePassKeyByIdentity = async (req, res) => {
    try {
        const found = await findOfficerForReset(req.body);
        if (found.error) {
            const status = found.error.startsWith("No Pass Key") ? 404 : 400;
            return res.status(status).json({ success: false, message: found.error });
        }

        const remark = String(req.body.remark ?? req.body.reason ?? "").trim() || null;
        const submitted = await submitResetApprovalRequest(req, found.officer, remark);
        if (submitted.error) {
            return res.status(409).json({ success: false, message: submitted.error });
        }

        res.status(200).json({
            success: true,
            status: "pending",
            message:
                "Pass Key reset request sent to HQ for approval. Your current Pass Key remains valid until HQ approves the reset.",
            hq_email_sent: submitted.hqMail.sent,
            officer: serializeOfficer(submitted.officer, { includePassKey: true }),
        });
    } catch (error) {
        console.error("[OFFICER PASS KEY] regeneratePassKeyByIdentity:", error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

// POST /api/v1/officer-pass-keys/:id/regenerate — HQ admin triggers reset approval email
exports.regeneratePassKeyById = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ success: false, message: "Invalid id" });

        const existing = await findActiveById(id);
        if (!existing || !existing.is_active) {
            return res.status(404).json({ success: false, message: "Pass Key not found" });
        }
        if (existing.approval_status !== "approved" || !existing.pass_key) {
            return res.status(400).json({
                success: false,
                message: "Pass Key must be approved before it can be reset",
            });
        }

        const submitted = await submitResetApprovalRequest(req, existing);
        if (submitted.error) {
            return res.status(409).json({ success: false, message: submitted.error });
        }

        res.status(200).json({
            success: true,
            status: "pending",
            message:
                "Pass Key reset request sent to HQ for approval. The officer's current Pass Key remains valid until approval.",
            hq_email_sent: submitted.hqMail.sent,
            officer: serializeOfficer(submitted.officer, { includePassKey: true }),
        });
    } catch (error) {
        console.error("[OFFICER PASS KEY] regeneratePassKeyById:", error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};
