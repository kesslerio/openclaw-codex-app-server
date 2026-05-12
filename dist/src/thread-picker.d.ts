import type { ThreadSummary } from "./types.js";
export declare const THREAD_PICKER_PAGE_SIZE = 8;
export type ProjectSummary = {
    name: string;
    threadCount: number;
    latestUpdatedAt?: number;
};
export declare function getProjectName(projectKey?: string): string | undefined;
export declare function filterThreadsByProjectName(threads: ThreadSummary[], projectName?: string): ThreadSummary[];
export declare function listProjects(threads: ThreadSummary[], query?: string): ProjectSummary[];
export declare function paginateItems<T>(items: T[], page: number, pageSize?: number): {
    items: T[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    startIndex: number;
    endIndex: number;
};
