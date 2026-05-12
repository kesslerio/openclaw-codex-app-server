import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { CALLBACK_TTL_MS, CALLBACK_TOKEN_BYTES, PLUGIN_ID, STORE_VERSION } from "./types.js";
function toConversationKey(target) {
    const channel = target.channel.trim().toLowerCase();
    return [
        channel,
        target.accountId.trim(),
        target.conversationId.trim(),
        channel === "telegram" ? (target.parentConversationId?.trim() ?? "") : "",
    ].join("::");
}
function cloneSnapshot(value) {
    return {
        version: STORE_VERSION,
        bindings: value?.bindings ?? [],
        pendingBinds: value?.pendingBinds ?? [],
        pendingRequests: value?.pendingRequests ?? [],
        callbacks: value?.callbacks ?? [],
    };
}
function normalizePermissionsMode(value) {
    return value === "full-access" ? "full-access" : value === "default" ? "default" : undefined;
}
function inferPermissionsModeFromLegacyFields(params) {
    const explicit = normalizePermissionsMode(params.permissionsMode) ??
        normalizePermissionsMode(params.appServerProfile);
    if (explicit) {
        return explicit;
    }
    const approval = params.preferredApprovalPolicy?.trim();
    const sandbox = params.preferredSandbox?.trim();
    if (approval === "never" && sandbox === "danger-full-access") {
        return "full-access";
    }
    return "default";
}
function normalizeConversationPreferences(value) {
    if (!value) {
        return undefined;
    }
    return {
        preferredModel: value.preferredModel,
        preferredReasoningEffort: value.preferredReasoningEffort,
        preferredServiceTier: value.preferredServiceTier,
        updatedAt: value.updatedAt,
    };
}
function normalizeSnapshot(value) {
    const snapshot = cloneSnapshot(value);
    snapshot.version = STORE_VERSION;
    snapshot.bindings = snapshot.bindings.map((binding) => {
        const legacyPreferences = binding.preferences;
        return {
            ...binding,
            permissionsMode: inferPermissionsModeFromLegacyFields({
                permissionsMode: binding.permissionsMode,
                appServerProfile: binding.appServerProfile,
                preferredApprovalPolicy: legacyPreferences?.preferredApprovalPolicy,
                preferredSandbox: legacyPreferences?.preferredSandbox,
            }),
            pendingPermissionsMode: normalizePermissionsMode(binding.pendingPermissionsMode) ??
                normalizePermissionsMode(binding.pendingAppServerProfile),
            preferences: normalizeConversationPreferences(legacyPreferences),
        };
    });
    snapshot.pendingBinds = snapshot.pendingBinds.map((entry) => {
        const legacyPreferences = entry.preferences;
        return {
            ...entry,
            permissionsMode: inferPermissionsModeFromLegacyFields({
                permissionsMode: entry.permissionsMode,
                appServerProfile: entry.appServerProfile,
                preferredApprovalPolicy: legacyPreferences?.preferredApprovalPolicy,
                preferredSandbox: legacyPreferences?.preferredSandbox,
            }),
            preferences: normalizeConversationPreferences(legacyPreferences),
        };
    });
    return snapshot;
}
export class PluginStateStore {
    rootDir;
    snapshot = cloneSnapshot();
    constructor(rootDir) {
        this.rootDir = rootDir;
    }
    get dir() {
        return path.join(this.rootDir, PLUGIN_ID);
    }
    get filePath() {
        return path.join(this.dir, "state.json");
    }
    async load() {
        await fs.mkdir(this.dir, { recursive: true });
        try {
            const raw = await fs.readFile(this.filePath, "utf8");
            const parsed = JSON.parse(raw);
            this.snapshot = normalizeSnapshot(parsed);
            this.pruneExpired();
            await this.save();
        }
        catch (error) {
            if (error.code !== "ENOENT") {
                throw error;
            }
            this.snapshot = cloneSnapshot();
            await this.save();
        }
    }
    async save() {
        await fs.mkdir(this.dir, { recursive: true });
        await fs.writeFile(this.filePath, `${JSON.stringify(this.snapshot, null, 2)}\n`, "utf8");
    }
    pruneExpired(now = Date.now()) {
        this.snapshot.pendingBinds = this.snapshot.pendingBinds.filter((entry) => now - entry.updatedAt < CALLBACK_TTL_MS);
        this.snapshot.pendingRequests = this.snapshot.pendingRequests.filter((entry) => entry.state.expiresAt > now);
        this.snapshot.callbacks = this.snapshot.callbacks.filter((entry) => entry.expiresAt > now);
    }
    listBindings() {
        return [...this.snapshot.bindings];
    }
    getBinding(target) {
        const key = toConversationKey(target);
        return this.snapshot.bindings.find((entry) => toConversationKey(entry.conversation) === key) ?? null;
    }
    async upsertBinding(binding) {
        const key = toConversationKey(binding.conversation);
        this.snapshot.bindings = this.snapshot.bindings.filter((entry) => toConversationKey(entry.conversation) !== key);
        this.snapshot.pendingBinds = this.snapshot.pendingBinds.filter((entry) => toConversationKey(entry.conversation) !== key);
        this.snapshot.bindings.push(binding);
        await this.save();
    }
    async removeBinding(target) {
        const key = toConversationKey(target);
        this.snapshot.bindings = this.snapshot.bindings.filter((entry) => toConversationKey(entry.conversation) !== key);
        this.snapshot.pendingBinds = this.snapshot.pendingBinds.filter((entry) => toConversationKey(entry.conversation) !== key);
        this.snapshot.pendingRequests = this.snapshot.pendingRequests.filter((entry) => toConversationKey(entry.conversation) !== key);
        this.snapshot.callbacks = this.snapshot.callbacks.filter((entry) => toConversationKey(entry.conversation) !== key);
        await this.save();
    }
    getPendingRequestByConversation(target) {
        const key = toConversationKey(target);
        return (this.snapshot.pendingRequests.find((entry) => toConversationKey(entry.conversation) === key) ??
            null);
    }
    getPendingBind(target) {
        const key = toConversationKey(target);
        return (this.snapshot.pendingBinds.find((entry) => toConversationKey(entry.conversation) === key) ??
            null);
    }
    async upsertPendingBind(entry) {
        const key = toConversationKey(entry.conversation);
        this.snapshot.pendingBinds = this.snapshot.pendingBinds.filter((current) => toConversationKey(current.conversation) !== key);
        this.snapshot.pendingBinds.push(entry);
        await this.save();
    }
    async removePendingBind(target) {
        const key = toConversationKey(target);
        this.snapshot.pendingBinds = this.snapshot.pendingBinds.filter((entry) => toConversationKey(entry.conversation) !== key);
        await this.save();
    }
    getPendingRequestById(requestId) {
        return this.snapshot.pendingRequests.find((entry) => entry.requestId === requestId) ?? null;
    }
    async upsertPendingRequest(entry) {
        this.snapshot.pendingRequests = this.snapshot.pendingRequests.filter((current) => current.requestId !== entry.requestId);
        this.snapshot.pendingRequests.push(entry);
        await this.save();
    }
    async removePendingRequest(requestId) {
        this.snapshot.pendingRequests = this.snapshot.pendingRequests.filter((entry) => entry.requestId !== requestId);
        this.snapshot.callbacks = this.snapshot.callbacks.filter((entry) => {
            if (entry.kind !== "pending-input" && entry.kind !== "pending-questionnaire") {
                return true;
            }
            return entry.requestId !== requestId;
        });
        await this.save();
    }
    createCallbackToken() {
        return crypto.randomBytes(CALLBACK_TOKEN_BYTES).toString("base64url");
    }
    async putCallback(callback) {
        const now = Date.now();
        const entry = callback.kind === "start-new-thread"
            ? {
                kind: "start-new-thread",
                conversation: callback.conversation,
                workspaceDir: callback.workspaceDir,
                syncTopic: callback.syncTopic,
                requestedModel: callback.requestedModel,
                requestedFast: callback.requestedFast,
                requestedYolo: callback.requestedYolo,
                token: callback.token ?? this.createCallbackToken(),
                createdAt: now,
                expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
            }
            : callback.kind === "resume-thread"
                ? {
                    kind: "resume-thread",
                    conversation: callback.conversation,
                    threadId: callback.threadId,
                    threadTitle: callback.threadTitle,
                    workspaceDir: callback.workspaceDir,
                    syncTopic: callback.syncTopic,
                    requestedModel: callback.requestedModel,
                    requestedFast: callback.requestedFast,
                    requestedYolo: callback.requestedYolo,
                    token: callback.token ?? this.createCallbackToken(),
                    createdAt: now,
                    expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
                }
                : callback.kind === "pending-input"
                    ? {
                        kind: "pending-input",
                        conversation: callback.conversation,
                        requestId: callback.requestId,
                        actionIndex: callback.actionIndex,
                        token: callback.token ?? this.createCallbackToken(),
                        createdAt: now,
                        expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
                    }
                    : callback.kind === "pending-questionnaire"
                        ? {
                            kind: "pending-questionnaire",
                            conversation: callback.conversation,
                            requestId: callback.requestId,
                            questionIndex: callback.questionIndex,
                            action: callback.action,
                            optionIndex: callback.optionIndex,
                            token: callback.token ?? this.createCallbackToken(),
                            createdAt: now,
                            expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
                        }
                        : callback.kind === "picker-view"
                            ? {
                                kind: "picker-view",
                                conversation: callback.conversation,
                                view: callback.view,
                                token: callback.token ?? this.createCallbackToken(),
                                createdAt: now,
                                expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
                            }
                            : callback.kind === "run-prompt"
                                ? {
                                    kind: "run-prompt",
                                    conversation: callback.conversation,
                                    prompt: callback.prompt,
                                    workspaceDir: callback.workspaceDir,
                                    collaborationMode: callback.collaborationMode,
                                    token: callback.token ?? this.createCallbackToken(),
                                    createdAt: now,
                                    expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
                                }
                                : callback.kind === "rename-thread"
                                    ? {
                                        kind: "rename-thread",
                                        conversation: callback.conversation,
                                        style: callback.style,
                                        syncTopic: callback.syncTopic,
                                        token: callback.token ?? this.createCallbackToken(),
                                        createdAt: now,
                                        expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
                                    }
                                    : callback.kind === "set-model"
                                        ? {
                                            kind: "set-model",
                                            conversation: callback.conversation,
                                            model: callback.model,
                                            returnToStatus: callback.returnToStatus,
                                            statusMessage: callback.statusMessage,
                                            token: callback.token ?? this.createCallbackToken(),
                                            createdAt: now,
                                            expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
                                        }
                                        : callback.kind === "toggle-fast"
                                            ? {
                                                kind: "toggle-fast",
                                                conversation: callback.conversation,
                                                token: callback.token ?? this.createCallbackToken(),
                                                createdAt: now,
                                                expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
                                            }
                                            : callback.kind === "show-reasoning-picker"
                                                ? {
                                                    kind: "show-reasoning-picker",
                                                    conversation: callback.conversation,
                                                    token: callback.token ?? this.createCallbackToken(),
                                                    createdAt: now,
                                                    expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
                                                }
                                                : callback.kind === "set-reasoning"
                                                    ? {
                                                        kind: "set-reasoning",
                                                        conversation: callback.conversation,
                                                        reasoningEffort: callback.reasoningEffort,
                                                        returnToStatus: callback.returnToStatus,
                                                        token: callback.token ?? this.createCallbackToken(),
                                                        createdAt: now,
                                                        expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
                                                    }
                                                    : callback.kind === "toggle-permissions"
                                                        ? {
                                                            kind: "toggle-permissions",
                                                            conversation: callback.conversation,
                                                            token: callback.token ?? this.createCallbackToken(),
                                                            createdAt: now,
                                                            expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
                                                        }
                                                        : callback.kind === "compact-thread"
                                                            ? {
                                                                kind: "compact-thread",
                                                                conversation: callback.conversation,
                                                                token: callback.token ?? this.createCallbackToken(),
                                                                createdAt: now,
                                                                expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
                                                            }
                                                            : callback.kind === "stop-run"
                                                                ? {
                                                                    kind: "stop-run",
                                                                    conversation: callback.conversation,
                                                                    token: callback.token ?? this.createCallbackToken(),
                                                                    createdAt: now,
                                                                    expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
                                                                }
                                                                : callback.kind === "refresh-status"
                                                                    ? {
                                                                        kind: "refresh-status",
                                                                        conversation: callback.conversation,
                                                                        token: callback.token ?? this.createCallbackToken(),
                                                                        createdAt: now,
                                                                        expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
                                                                    }
                                                                    : callback.kind === "detach-thread"
                                                                        ? {
                                                                            kind: "detach-thread",
                                                                            conversation: callback.conversation,
                                                                            token: callback.token ?? this.createCallbackToken(),
                                                                            createdAt: now,
                                                                            expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
                                                                        }
                                                                        : callback.kind === "show-skills"
                                                                            ? {
                                                                                kind: "show-skills",
                                                                                conversation: callback.conversation,
                                                                                token: callback.token ?? this.createCallbackToken(),
                                                                                createdAt: now,
                                                                                expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
                                                                            }
                                                                            : callback.kind === "show-mcp"
                                                                                ? {
                                                                                    kind: "show-mcp",
                                                                                    conversation: callback.conversation,
                                                                                    token: callback.token ?? this.createCallbackToken(),
                                                                                    createdAt: now,
                                                                                    expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
                                                                                }
                                                                                : callback.kind === "run-skill"
                                                                                    ? {
                                                                                        kind: "run-skill",
                                                                                        conversation: callback.conversation,
                                                                                        skillName: callback.skillName,
                                                                                        workspaceDir: callback.workspaceDir,
                                                                                        token: callback.token ?? this.createCallbackToken(),
                                                                                        createdAt: now,
                                                                                        expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
                                                                                    }
                                                                                    : callback.kind === "show-skill-help"
                                                                                        ? {
                                                                                            kind: "show-skill-help",
                                                                                            conversation: callback.conversation,
                                                                                            skillName: callback.skillName,
                                                                                            description: callback.description,
                                                                                            cwd: callback.cwd,
                                                                                            enabled: callback.enabled,
                                                                                            token: callback.token ?? this.createCallbackToken(),
                                                                                            createdAt: now,
                                                                                            expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
                                                                                        }
                                                                                        : callback.kind === "show-model-picker"
                                                                                            ? {
                                                                                                kind: "show-model-picker",
                                                                                                conversation: callback.conversation,
                                                                                                token: callback.token ?? this.createCallbackToken(),
                                                                                                createdAt: now,
                                                                                                expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
                                                                                            }
                                                                                            : callback.kind === "reply-text"
                                                                                                ? {
                                                                                                    kind: "reply-text",
                                                                                                    conversation: callback.conversation,
                                                                                                    text: callback.text,
                                                                                                    token: callback.token ?? this.createCallbackToken(),
                                                                                                    createdAt: now,
                                                                                                    expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
                                                                                                }
                                                                                                : {
                                                                                                    kind: "cancel-picker",
                                                                                                    conversation: callback.conversation,
                                                                                                    token: callback.token ?? this.createCallbackToken(),
                                                                                                    createdAt: now,
                                                                                                    expiresAt: now + (callback.ttlMs ?? CALLBACK_TTL_MS),
                                                                                                };
        this.snapshot.callbacks = this.snapshot.callbacks.filter((current) => current.token !== entry.token);
        this.snapshot.callbacks.push(entry);
        await this.save();
        return entry;
    }
    getCallback(token) {
        return this.snapshot.callbacks.find((entry) => entry.token === token) ?? null;
    }
    async removeCallback(token) {
        this.snapshot.callbacks = this.snapshot.callbacks.filter((entry) => entry.token !== token);
        await this.save();
    }
}
export function buildPluginSessionKey(threadId) {
    return `${PLUGIN_ID}:thread:${threadId.trim()}`;
}
export function buildConversationKey(target) {
    return toConversationKey(target);
}
//# sourceMappingURL=state.js.map