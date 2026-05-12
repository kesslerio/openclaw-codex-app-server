import type { AccountSummary, ContextUsageSnapshot, ExperimentalFeatureSummary, McpServerSummary, ModelSummary, RateLimitSummary, ReviewResult, SkillSummary, StoredBinding, ThreadReplay, ThreadState, ThreadSummary, TurnResult } from "./types.js";
export declare function formatBinding(binding: StoredBinding | null): string;
export declare function formatThreadPicker(threads: ThreadSummary[]): string;
export declare function formatThreadButtonLabel(params: {
    thread: ThreadSummary;
    includeProjectSuffix: boolean;
    isWorktree?: boolean;
    hasChanges?: boolean;
    maxLength?: number;
}): string;
export declare function formatThreadPickerIntro(params: {
    page: number;
    totalPages: number;
    totalItems: number;
    includeAll: boolean;
    syncTopic?: boolean;
    projectName?: string;
    workspaceDir?: string;
    fallbackToGlobal?: boolean;
}): string;
export declare function formatProjectPickerIntro(params: {
    page: number;
    totalPages: number;
    totalItems: number;
    workspaceDir?: string;
    action?: "resume-thread" | "start-new-thread";
}): string;
export declare function formatThreadState(state: ThreadState, binding: StoredBinding | null): string;
export declare function formatCodexPermissions(params: {
    approvalPolicy?: string;
    sandbox?: string;
}): string | undefined;
export declare function formatCodexAccountText(account: AccountSummary | null | undefined): string;
export declare function formatCodexModelText(threadState: ThreadState | undefined): string;
export declare function getCodexStatusTimeZoneLabel(): string | undefined;
export declare function formatCodexRateLimitLine(limit: RateLimitSummary, nowMs?: number): string;
export declare function selectVisibleCodexRateLimits(params: {
    rateLimits: RateLimitSummary[];
    currentModel?: string;
}): RateLimitSummary[];
export declare function formatCodexContextUsageSnapshot(usage?: ContextUsageSnapshot): string | undefined;
export declare function formatCodexStatusText(params: {
    pluginVersion?: string;
    threadState?: ThreadState;
    bindingThreadTitle?: string;
    account?: AccountSummary | null;
    rateLimits: RateLimitSummary[];
    projectFolder?: string;
    worktreeFolder?: string;
    bindingActive?: boolean;
    contextUsage?: ContextUsageSnapshot;
    planMode?: boolean;
    permissionNote?: string;
    threadNote?: string;
}): string;
export declare function formatBoundThreadSummary(params: {
    binding: StoredBinding;
    state?: ThreadState;
}): string;
export declare function formatAccountSummary(account: AccountSummary, limits: RateLimitSummary[]): string;
export declare function formatModels(models: ModelSummary[], state?: ThreadState): string;
export declare function formatSkills(params: {
    workspaceDir: string;
    skills: SkillSummary[];
    filter?: string;
}): string;
export declare function filterSkillsByQuery(skills: SkillSummary[], filter?: string): SkillSummary[];
export declare function formatSkillsPickerText(params: {
    workspaceDir: string;
    skills: SkillSummary[];
    page: number;
    totalPages: number;
    mode: "run" | "help";
    filter?: string;
}): string;
export declare function formatSkillHelpText(skill: SkillSummary): string;
export declare function formatExperimentalFeatures(features: ExperimentalFeatureSummary[]): string;
export declare function formatMcpServers(params: {
    servers: McpServerSummary[];
    filter?: string;
}): string;
export declare function formatThreadReplay(replay: ThreadReplay): string;
export declare function formatTurnCompletion(result: TurnResult): string;
export declare function formatReviewCompletion(result: ReviewResult): string;
export type ParsedReviewFinding = {
    priorityLabel?: string;
    title: string;
    location?: string;
    body?: string;
};
export declare function parseCodexReviewOutput(text: string): {
    summary?: string;
    findings: ParsedReviewFinding[];
};
export declare function formatCodexReviewFindingMessage(params: {
    finding: ParsedReviewFinding;
    index: number;
}): string;
export declare function formatCodexPlanSteps(steps: TurnResult["planArtifact"] extends infer T ? (T extends {
    steps: infer S;
} ? S : never) : never): string | undefined;
export declare function formatCodexPlanInlineText(plan: NonNullable<TurnResult["planArtifact"]>): string;
export declare function buildCodexPlanMarkdownPreview(markdown: string, maxChars?: number): string | undefined;
export declare function formatCodexPlanAttachmentSummary(plan: NonNullable<TurnResult["planArtifact"]>): string;
export declare function formatCodexPlanAttachmentFallback(plan: NonNullable<TurnResult["planArtifact"]>): string;
