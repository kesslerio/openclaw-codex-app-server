import type { ThreadSummary } from "./types.js";
export type ParsedThreadSelectionArgs = {
    includeAll: boolean;
    listProjects: boolean;
    startNew: boolean;
    syncTopic: boolean;
    cwd?: string;
    requestedModel?: string;
    requestedFast?: boolean;
    requestedYolo?: boolean;
    error?: string;
    query: string;
};
export type ThreadSelectionResult = {
    kind: "none";
} | {
    kind: "unique";
    thread: ThreadSummary;
} | {
    kind: "ambiguous";
    threads: ThreadSummary[];
};
export declare function parseThreadSelectionArgs(args: string): ParsedThreadSelectionArgs;
export declare function expandHomeDir(value: string): string;
export declare function selectThreadFromMatches(threads: ThreadSummary[], query: string): ThreadSelectionResult;
