import type { CallbackAction, CollaborationMode, ConversationTarget, StoredBinding, StoredPendingBind, StoredPendingRequest } from "./types.js";
type PutCallbackInput = {
    kind: "start-new-thread";
    conversation: ConversationTarget;
    workspaceDir: string;
    syncTopic?: boolean;
    requestedModel?: string;
    requestedFast?: boolean;
    requestedYolo?: boolean;
    token?: string;
    ttlMs?: number;
} | {
    kind: "resume-thread";
    conversation: ConversationTarget;
    threadId: string;
    threadTitle?: string;
    workspaceDir: string;
    syncTopic?: boolean;
    requestedModel?: string;
    requestedFast?: boolean;
    requestedYolo?: boolean;
    token?: string;
    ttlMs?: number;
} | {
    kind: "pending-input";
    conversation: ConversationTarget;
    requestId: string;
    actionIndex: number;
    token?: string;
    ttlMs?: number;
} | {
    kind: "pending-questionnaire";
    conversation: ConversationTarget;
    requestId: string;
    questionIndex: number;
    action: "select" | "prev" | "next" | "freeform";
    optionIndex?: number;
    token?: string;
    ttlMs?: number;
} | {
    kind: "picker-view";
    conversation: ConversationTarget;
    view: Extract<CallbackAction, {
        kind: "picker-view";
    }>["view"];
    token?: string;
    ttlMs?: number;
} | {
    kind: "run-prompt";
    conversation: ConversationTarget;
    prompt: string;
    workspaceDir?: string;
    collaborationMode?: CollaborationMode;
    token?: string;
    ttlMs?: number;
} | {
    kind: "rename-thread";
    conversation: ConversationTarget;
    style: "thread-project" | "thread";
    syncTopic: boolean;
    token?: string;
    ttlMs?: number;
} | {
    kind: "toggle-fast";
    conversation: ConversationTarget;
    token?: string;
    ttlMs?: number;
} | {
    kind: "show-reasoning-picker";
    conversation: ConversationTarget;
    token?: string;
    ttlMs?: number;
} | {
    kind: "set-reasoning";
    conversation: ConversationTarget;
    reasoningEffort: string;
    returnToStatus?: boolean;
    token?: string;
    ttlMs?: number;
} | {
    kind: "toggle-permissions";
    conversation: ConversationTarget;
    token?: string;
    ttlMs?: number;
} | {
    kind: "compact-thread";
    conversation: ConversationTarget;
    token?: string;
    ttlMs?: number;
} | {
    kind: "stop-run";
    conversation: ConversationTarget;
    token?: string;
    ttlMs?: number;
} | {
    kind: "refresh-status";
    conversation: ConversationTarget;
    token?: string;
    ttlMs?: number;
} | {
    kind: "detach-thread";
    conversation: ConversationTarget;
    token?: string;
    ttlMs?: number;
} | {
    kind: "show-skills";
    conversation: ConversationTarget;
    token?: string;
    ttlMs?: number;
} | {
    kind: "show-mcp";
    conversation: ConversationTarget;
    token?: string;
    ttlMs?: number;
} | {
    kind: "run-skill";
    conversation: ConversationTarget;
    skillName: string;
    workspaceDir?: string;
    token?: string;
    ttlMs?: number;
} | {
    kind: "show-skill-help";
    conversation: ConversationTarget;
    skillName: string;
    description?: string;
    cwd?: string;
    enabled?: boolean;
    token?: string;
    ttlMs?: number;
} | {
    kind: "show-model-picker";
    conversation: ConversationTarget;
    token?: string;
    ttlMs?: number;
} | {
    kind: "set-model";
    conversation: ConversationTarget;
    model: string;
    returnToStatus?: boolean;
    statusMessage?: Extract<CallbackAction, {
        kind: "set-model";
    }>["statusMessage"];
    token?: string;
    ttlMs?: number;
} | {
    kind: "reply-text";
    conversation: ConversationTarget;
    text: string;
    token?: string;
    ttlMs?: number;
} | {
    kind: "cancel-picker";
    conversation: ConversationTarget;
    token?: string;
    ttlMs?: number;
};
export declare class PluginStateStore {
    private readonly rootDir;
    private snapshot;
    constructor(rootDir: string);
    get dir(): string;
    get filePath(): string;
    load(): Promise<void>;
    save(): Promise<void>;
    pruneExpired(now?: number): void;
    listBindings(): StoredBinding[];
    getBinding(target: ConversationTarget): StoredBinding | null;
    upsertBinding(binding: StoredBinding): Promise<void>;
    removeBinding(target: ConversationTarget): Promise<void>;
    getPendingRequestByConversation(target: ConversationTarget): StoredPendingRequest | null;
    getPendingBind(target: ConversationTarget): StoredPendingBind | null;
    upsertPendingBind(entry: StoredPendingBind): Promise<void>;
    removePendingBind(target: ConversationTarget): Promise<void>;
    getPendingRequestById(requestId: string): StoredPendingRequest | null;
    upsertPendingRequest(entry: StoredPendingRequest): Promise<void>;
    removePendingRequest(requestId: string): Promise<void>;
    createCallbackToken(): string;
    putCallback(callback: PutCallbackInput): Promise<CallbackAction>;
    getCallback(token: string): CallbackAction | null;
    removeCallback(token: string): Promise<void>;
}
export declare function buildPluginSessionKey(threadId: string): string;
export declare function buildConversationKey(target: ConversationTarget): string;
export {};
