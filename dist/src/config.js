import { DEFAULT_REQUEST_TIMEOUT_MS, } from "./types.js";
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value)
        ? value
        : {};
}
function readString(record, key) {
    const value = record[key];
    if (typeof value !== "string") {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed || undefined;
}
function readStringArray(record, key) {
    const value = record[key];
    if (!Array.isArray(value)) {
        return [];
    }
    return value
        .filter((entry) => typeof entry === "string")
        .map((entry) => entry.trim())
        .filter(Boolean);
}
function readHeaders(record) {
    const value = record.headers;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return undefined;
    }
    const headers = Object.fromEntries(Object.entries(value)
        .filter((entry) => typeof entry[1] === "string")
        .map(([key, entryValue]) => [key, entryValue.trim()])
        .filter((entry) => entry[0].trim() && entry[1]));
    return Object.keys(headers).length > 0 ? headers : undefined;
}
function readNumber(record, key, fallback, minimum) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
        return Math.max(minimum, Math.round(value));
    }
    return fallback;
}
export function resolvePluginSettings(rawConfig) {
    const record = asRecord(rawConfig);
    const transport = record.transport === "websocket" ? "websocket" : "stdio";
    const authToken = readString(record, "authToken");
    const configuredHeaders = readHeaders(record);
    const headers = {
        ...(configuredHeaders ?? {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    };
    return {
        enabled: record.enabled !== false,
        transport,
        command: readString(record, "command") ?? "codex",
        args: readStringArray(record, "args"),
        url: readString(record, "url"),
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        requestTimeoutMs: readNumber(record, "requestTimeoutMs", DEFAULT_REQUEST_TIMEOUT_MS, 100),
        defaultWorkspaceDir: readString(record, "defaultWorkspaceDir"),
        defaultModel: readString(record, "defaultModel"),
        defaultServiceTier: readString(record, "defaultServiceTier"),
    };
}
export function resolveWorkspaceDir(params) {
    return (params.requested?.trim() ||
        params.bindingWorkspaceDir?.trim() ||
        params.configuredWorkspaceDir?.trim() ||
        params.serviceWorkspaceDir?.trim() ||
        process.cwd());
}
//# sourceMappingURL=config.js.map