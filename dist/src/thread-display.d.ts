import type { ThreadSummary } from "./types.js";
export declare function getThreadNormalizedTitle(thread: Pick<ThreadSummary, "threadId" | "title" | "summary">): string;
export declare function getThreadDisplayTitle(thread: Pick<ThreadSummary, "threadId" | "title" | "summary">, maxLength?: number): string;
