import type { PluginLogger } from "openclaw/plugin-sdk";
import { type AccountSummary, type CollaborationMode, type CompactProgress, type CompactResult, type ContextUsageSnapshot, type CodexTurnInputItem, type ExperimentalFeatureSummary, type McpServerSummary, type ModelSummary, type PendingInputAction, type PendingInputState, type PluginSettings, type PermissionsMode, type RateLimitSummary, type ReviewResult, type ReviewTarget, type SkillSummary, type ThreadReplay, type ThreadState, type ThreadSummary, type TurnTerminalError, type TurnResult } from "./types.js";
export type ActiveCodexRun = {
    result: Promise<TurnResult | ReviewResult>;
    queueMessage: (text: string) => Promise<boolean>;
    submitPendingInput: (actionIndex: number) => Promise<boolean>;
    submitPendingInputPayload: (payload: unknown) => Promise<boolean>;
    interrupt: () => Promise<void>;
    isAwaitingInput: () => boolean;
    getThreadId: () => string | undefined;
};
type StartupProbeInfo = {
    transport: PluginSettings["transport"];
    command?: string;
    args?: string[];
    resolvedCommandPath?: string;
    cliVersion?: string;
    serverName?: string;
    serverVersion?: string;
};
type FileEditSummary = {
    path: string;
    verb: "Added" | "Deleted" | "Edited";
    added: number;
    removed: number;
};
declare function extractStartupProbeInfo(initializeResult: unknown, base: StartupProbeInfo): StartupProbeInfo;
declare function formatStdioProcessLog(event: "spawned" | "exited", params: {
    pid?: number;
    command?: string;
    args?: string[];
    code?: number | null;
    signal?: NodeJS.Signals | null;
}): string;
declare function buildThreadResumePayloads(params: {
    threadId: string;
    model?: string;
    reasoningEffort?: string;
    cwd?: string;
    serviceTier?: string | null;
    approvalPolicy?: string;
    sandbox?: string;
}): Array<Record<string, unknown>>;
declare function buildTurnStartPayloads(params: {
    threadId: string;
    prompt: string;
    input?: readonly CodexTurnInputItem[];
    model?: string;
    serviceTier?: string;
    collaborationMode?: CollaborationMode;
    collaborationFallbackModel?: string;
}): unknown[];
declare function buildTurnSteerPayloads(params: {
    threadId: string;
    turnId: string;
    text: string;
}): Array<Record<string, unknown>>;
declare function extractFileEditSummariesFromNotification(value: unknown, workspaceDir?: string): FileEditSummary[];
declare function formatFileEditNotice(summaries: FileEditSummary[]): string;
declare function createFileEditNoticeBatcher(params: {
    onFlush?: (text: string) => Promise<void> | void;
}): {
    add(entries: FileEditSummary[]): void;
    hasPending(): boolean;
    flush(): Promise<void>;
};
declare function extractFileChangePathsFromReadResult(value: unknown, itemId: string, workspaceDir?: string): string[];
declare function extractRateLimitSummaries(value: unknown): RateLimitSummary[];
declare function extractThreadTokenUsageSnapshot(value: unknown): ContextUsageSnapshot | undefined;
declare function extractTurnTerminalState(method: string, params: unknown): {
    status?: TurnResult["terminalStatus"];
    error?: TurnTerminalError;
} | undefined;
declare function isFullAccessApprovalBypass(params: {
    methodLower: string;
    approvalPolicy?: string;
    sandbox?: string;
}): boolean;
declare function buildAutoApprovedPendingInputResponse(params: {
    method: string;
    methodLower: string;
    requestParams: unknown;
    options: string[];
    approvalPolicy?: string;
    sandbox?: string;
}): unknown | undefined;
declare function extractApprovalDecision(value: unknown): string | undefined;
declare function resolveTurnStoppedReason(params: {
    interrupted: boolean;
    terminalStatus?: TurnResult["terminalStatus"];
    approvalCancelled: boolean;
    assistantText: string;
    hasPlanArtifact: boolean;
}): TurnResult["stoppedReason"] | undefined;
type PendingInputQueueEntry = {
    state: PendingInputState;
    options: string[];
    actions: PendingInputAction[];
    methodLower: string;
    response: Promise<unknown>;
    resolveResponse: (value: unknown) => void;
};
declare function createPendingInputCoordinator(params: {
    onPendingInput?: (state: PendingInputState | null) => Promise<void> | void;
    onActivated?: () => void;
    onCleared?: () => void;
}): {
    enqueue(entry: Omit<PendingInputQueueEntry, "response" | "resolveResponse">): PendingInputQueueEntry;
    current(): PendingInputQueueEntry | null;
    settleCurrent(value: unknown): Promise<boolean>;
    clearCurrent(): Promise<void>;
};
export declare function isMissingThreadError(error: unknown): boolean;
export declare class CodexAppServerClient {
    private readonly settings;
    private readonly logger;
    private connectionPromise;
    private startupProbePromise;
    private readonly notificationListeners;
    private readonly requestListeners;
    constructor(settings: PluginSettings, logger: PluginLogger);
    private clearConnectionState;
    private dispatchNotification;
    private dispatchRequest;
    private addNotificationListener;
    private addRequestListener;
    private getConnection;
    private ensureConnected;
    private withClient;
    logStartupProbe(params?: {
        sessionKey?: string;
    }): Promise<void>;
    close(): Promise<void>;
    listThreads(params: {
        sessionKey?: string;
        workspaceDir?: string;
        filter?: string;
    }): Promise<ThreadSummary[]>;
    startThread(params: {
        sessionKey?: string;
        workspaceDir: string;
        model?: string;
    }): Promise<ThreadState>;
    listModels(params: {
        sessionKey?: string;
    }): Promise<ModelSummary[]>;
    listSkills(params: {
        sessionKey?: string;
        workspaceDir?: string;
    }): Promise<SkillSummary[]>;
    listExperimentalFeatures(params: {
        sessionKey?: string;
    }): Promise<ExperimentalFeatureSummary[]>;
    listMcpServers(params: {
        sessionKey?: string;
    }): Promise<McpServerSummary[]>;
    readRateLimits(params: {
        sessionKey?: string;
    }): Promise<RateLimitSummary[]>;
    readAccount(params: {
        sessionKey?: string;
        refreshToken?: boolean;
    }): Promise<AccountSummary>;
    readThreadState(params: {
        sessionKey?: string;
        threadId: string;
    }): Promise<ThreadState>;
    setThreadName(params: {
        sessionKey?: string;
        threadId: string;
        name: string;
    }): Promise<void>;
    setThreadModel(params: {
        sessionKey?: string;
        threadId: string;
        model: string;
    }): Promise<ThreadState>;
    setThreadServiceTier(params: {
        sessionKey?: string;
        threadId: string;
        serviceTier: string | null;
    }): Promise<ThreadState>;
    setThreadPermissions(params: {
        sessionKey?: string;
        threadId: string;
        approvalPolicy: string;
        sandbox: string;
    }): Promise<ThreadState>;
    compactThread(params: {
        sessionKey?: string;
        threadId: string;
        onProgress?: (progress: CompactProgress) => Promise<void> | void;
    }): Promise<CompactResult>;
    readThreadContext(params: {
        sessionKey?: string;
        threadId: string;
    }): Promise<ThreadReplay>;
    startReview(params: {
        sessionKey?: string;
        workspaceDir: string;
        threadId: string;
        runId: string;
        model?: string;
        reasoningEffort?: string;
        serviceTier?: string | null;
        approvalPolicy?: string;
        sandbox?: string;
        target: ReviewTarget;
        onPendingInput?: (state: PendingInputState | null) => Promise<void> | void;
        onInterrupted?: () => Promise<void> | void;
    }): ActiveCodexRun;
    startTurn(params: {
        sessionKey?: string;
        prompt: string;
        input?: readonly CodexTurnInputItem[];
        workspaceDir: string;
        runId: string;
        existingThreadId?: string;
        model?: string;
        reasoningEffort?: string;
        serviceTier?: string;
        approvalPolicy?: string;
        sandbox?: string;
        collaborationMode?: CollaborationMode;
        onPendingInput?: (state: PendingInputState | null) => Promise<void> | void;
        onFileEdits?: (text: string) => Promise<void> | void;
        onInterrupted?: () => Promise<void> | void;
    }): ActiveCodexRun;
}
type ProfiledParams<T> = T & {
    profile?: PermissionsMode;
};
export declare class CodexAppServerModeClient {
    private readonly clients;
    constructor(settings: PluginSettings, logger: PluginLogger);
    hasProfile(profile: PermissionsMode): boolean;
    private getClient;
    logStartupProbe(): Promise<void>;
    close(): Promise<void>;
    listThreads(params: ProfiledParams<Parameters<CodexAppServerClient["listThreads"]>[0]>): Promise<ThreadSummary[]>;
    startThread(params: ProfiledParams<Parameters<CodexAppServerClient["startThread"]>[0]>): Promise<ThreadState>;
    listModels(params: ProfiledParams<Parameters<CodexAppServerClient["listModels"]>[0]>): Promise<ModelSummary[]>;
    listSkills(params: ProfiledParams<Parameters<CodexAppServerClient["listSkills"]>[0]>): Promise<SkillSummary[]>;
    listExperimentalFeatures(params: ProfiledParams<Parameters<CodexAppServerClient["listExperimentalFeatures"]>[0]>): Promise<ExperimentalFeatureSummary[]>;
    listMcpServers(params: ProfiledParams<Parameters<CodexAppServerClient["listMcpServers"]>[0]>): Promise<McpServerSummary[]>;
    readRateLimits(params: ProfiledParams<Parameters<CodexAppServerClient["readRateLimits"]>[0]>): Promise<RateLimitSummary[]>;
    readAccount(params: ProfiledParams<Parameters<CodexAppServerClient["readAccount"]>[0]>): Promise<AccountSummary>;
    readThreadState(params: ProfiledParams<Parameters<CodexAppServerClient["readThreadState"]>[0]>): Promise<ThreadState>;
    setThreadName(params: ProfiledParams<Parameters<CodexAppServerClient["setThreadName"]>[0]>): Promise<void>;
    setThreadModel(params: ProfiledParams<Parameters<CodexAppServerClient["setThreadModel"]>[0]>): Promise<ThreadState>;
    setThreadServiceTier(params: ProfiledParams<Parameters<CodexAppServerClient["setThreadServiceTier"]>[0]>): Promise<ThreadState>;
    setThreadPermissions(params: ProfiledParams<Parameters<CodexAppServerClient["setThreadPermissions"]>[0]>): Promise<ThreadState>;
    compactThread(params: ProfiledParams<Parameters<CodexAppServerClient["compactThread"]>[0]>): Promise<CompactResult>;
    readThreadContext(params: ProfiledParams<Parameters<CodexAppServerClient["readThreadContext"]>[0]>): Promise<ThreadReplay>;
    startReview(params: ProfiledParams<Parameters<CodexAppServerClient["startReview"]>[0]>): ActiveCodexRun;
    startTurn(params: ProfiledParams<Parameters<CodexAppServerClient["startTurn"]>[0]>): ActiveCodexRun;
}
export declare const __testing: {
    buildAutoApprovedPendingInputResponse: typeof buildAutoApprovedPendingInputResponse;
    buildThreadResumePayloads: typeof buildThreadResumePayloads;
    buildTurnStartPayloads: typeof buildTurnStartPayloads;
    buildTurnSteerPayloads: typeof buildTurnSteerPayloads;
    createFileEditNoticeBatcher: typeof createFileEditNoticeBatcher;
    createPendingInputCoordinator: typeof createPendingInputCoordinator;
    extractApprovalDecision: typeof extractApprovalDecision;
    extractTurnTerminalState: typeof extractTurnTerminalState;
    extractFileEditSummariesFromNotification: typeof extractFileEditSummariesFromNotification;
    extractFileChangePathsFromReadResult: typeof extractFileChangePathsFromReadResult;
    extractStartupProbeInfo: typeof extractStartupProbeInfo;
    formatFileEditNotice: typeof formatFileEditNotice;
    extractThreadTokenUsageSnapshot: typeof extractThreadTokenUsageSnapshot;
    extractRateLimitSummaries: typeof extractRateLimitSummaries;
    formatStdioProcessLog: typeof formatStdioProcessLog;
    isFullAccessApprovalBypass: typeof isFullAccessApprovalBypass;
    resolveTurnStoppedReason: typeof resolveTurnStoppedReason;
};
export {};
