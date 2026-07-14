const { Server } = require("socket.io");

const PAGE_ROOM_PREFIX = "admin:page:";
const PRESENCE_STALE_MS = 90_000;
const PRESENCE_PRUNE_INTERVAL_MS = 30_000;

/** @type {import("socket.io").Server | null} */
let io = null;

/** socket.id -> { route_path, user, joined_at, last_seen_at } */
const presenceBySocket = new Map();

const pageRoom = (routePath) => `${PAGE_ROOM_PREFIX}${routePath}`;

const normalizeUser = (user = {}) => ({
    login_id: user.login_id ?? null,
    emp_name: user.emp_name ?? user.name ?? "Unknown",
    emp_designation: user.emp_designation ?? user.designation ?? null,
    emp_phone_number: user.emp_phone_number ?? user.phone_number ?? user.phone ?? null,
    emp_email: user.emp_email ?? user.email ?? null,
});

const presenceKey = (user) => {
    if (user.login_id != null) return `login:${user.login_id}`;
    if (user.emp_phone_number != null) return `phone:${user.emp_phone_number}`;
    if (user.emp_email) return `email:${user.emp_email}`;
    return `name:${user.emp_name}`;
};

const isPresenceFresh = (entry, now = Date.now()) =>
    now - entry.last_seen_at <= PRESENCE_STALE_MS;

const getPresenceList = (routePath) => {
    if (!io) return [];

    const now = Date.now();
    const byUser = new Map();

    for (const entry of presenceBySocket.values()) {
        if (entry.route_path !== routePath || !isPresenceFresh(entry, now)) continue;
        const user = entry.user;
        const key = presenceKey(user);
        const existing = byUser.get(key);
        if (!existing || entry.joined_at > existing.joined_at) {
            byUser.set(key, {
                ...user,
                joined_at: entry.joined_at,
                last_seen_at: entry.last_seen_at,
            });
        }
    }

    return Array.from(byUser.values()).sort((a, b) => a.joined_at - b.joined_at);
};

const broadcastPresence = (routePath, presence = null) => {
    if (!io) return;
    io.to(pageRoom(routePath)).emit("presence_update", {
        route_path: routePath,
        presence: presence ?? getPresenceList(routePath),
    });
};

const leaveCurrentPage = (socket) => {
    const entry = presenceBySocket.get(socket.id);
    if (!entry) return;

    const { route_path } = entry;
    presenceBySocket.delete(socket.id);
    socket.leave(pageRoom(route_path));
    broadcastPresence(route_path);
};

const validateJoinPayload = (payload) => {
    const route_path = payload?.route_path?.trim();
    if (!route_path) return { error: "route_path is required" };

    const user = normalizeUser(payload.user);
    if (!user.emp_name || user.emp_name === "Unknown") {
        return { error: "user.emp_name is required" };
    }

    return { route_path, user };
};

const pruneStalePresence = () => {
    if (!io) return;

    const now = Date.now();
    const staleRoutes = new Set();

    for (const [socketId, entry] of presenceBySocket.entries()) {
        if (isPresenceFresh(entry, now)) continue;
        presenceBySocket.delete(socketId);
        staleRoutes.add(entry.route_path);
        const socket = io.sockets.sockets.get(socketId);
        if (socket) socket.leave(pageRoom(entry.route_path));
    }

    for (const route_path of staleRoutes) {
        broadcastPresence(route_path);
    }
};

const initAdminRealtime = (server) => {
    io = new Server(server, {
        cors: { origin: "*", methods: ["GET", "POST"] },
        path: "/socket.io",
    });

    io.on("connection", (socket) => {
        socket.on("join_page", (payload, ack) => {
            const parsed = validateJoinPayload(payload);
            if (parsed.error) {
                if (typeof ack === "function") ack({ ok: false, message: parsed.error });
                return;
            }

            leaveCurrentPage(socket);

            const now = Date.now();
            const { route_path, user } = parsed;
            socket.join(pageRoom(route_path));
            presenceBySocket.set(socket.id, {
                route_path,
                user,
                joined_at: now,
                last_seen_at: now,
            });

            const presence = getPresenceList(route_path);
            broadcastPresence(route_path, presence);

            if (typeof ack === "function") {
                ack({ ok: true, route_path, presence });
            }
        });

        socket.on("leave_page", () => {
            leaveCurrentPage(socket);
        });

        socket.on("heartbeat", () => {
            const entry = presenceBySocket.get(socket.id);
            if (!entry) return;
            entry.last_seen_at = Date.now();
        });

        socket.on("disconnect", () => {
            leaveCurrentPage(socket);
        });
    });

    setInterval(pruneStalePresence, PRESENCE_PRUNE_INTERVAL_MS);

    return io;
};

const emitToPage = (routePath, event, payload) => {
    if (!io) return;
    io.to(pageRoom(routePath)).emit(event, payload);
};

const broadcastPageStateChanged = (routePath, stateType, data) => {
    emitToPage(routePath, "page_state_changed", {
        route_path: routePath,
        state_type: stateType,
        data,
    });
};

const broadcastActivityLogged = (routePath, activity) => {
    emitToPage(routePath, "activity_logged", { route_path: routePath, activity });
};

module.exports = {
    PAGE_ROOM_PREFIX,
    initAdminRealtime,
    broadcastPageStateChanged,
    broadcastActivityLogged,
    getPresenceList,
};
