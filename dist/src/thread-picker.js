import path from "node:path";
export const THREAD_PICKER_PAGE_SIZE = 8;
export function getProjectName(projectKey) {
    const trimmed = projectKey?.trim();
    if (!trimmed) {
        return undefined;
    }
    const normalized = trimmed.replace(/[\\/]+$/, "");
    const base = path.basename(normalized);
    return base || undefined;
}
export function filterThreadsByProjectName(threads, projectName) {
    const normalized = projectName?.trim().toLowerCase();
    if (!normalized) {
        return [...threads];
    }
    return threads.filter((thread) => getProjectName(thread.projectKey)?.toLowerCase() === normalized);
}
export function listProjects(threads, query = "") {
    const filteredQuery = query.trim().toLowerCase();
    const grouped = new Map();
    for (const thread of threads) {
        const projectName = getProjectName(thread.projectKey);
        if (!projectName) {
            continue;
        }
        if (filteredQuery && !projectName.toLowerCase().includes(filteredQuery)) {
            continue;
        }
        const existing = grouped.get(projectName);
        const updatedAt = thread.updatedAt ?? thread.createdAt;
        if (!existing) {
            grouped.set(projectName, {
                name: projectName,
                threadCount: 1,
                latestUpdatedAt: updatedAt,
            });
            continue;
        }
        existing.threadCount += 1;
        existing.latestUpdatedAt = Math.max(existing.latestUpdatedAt ?? 0, updatedAt ?? 0) || undefined;
    }
    return [...grouped.values()].sort((left, right) => {
        const updatedDelta = (right.latestUpdatedAt ?? 0) - (left.latestUpdatedAt ?? 0);
        if (updatedDelta !== 0) {
            return updatedDelta;
        }
        return left.name.localeCompare(right.name);
    });
}
export function paginateItems(items, page, pageSize = THREAD_PICKER_PAGE_SIZE) {
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(Math.max(0, page), totalPages - 1);
    const startIndex = safePage * pageSize;
    const pageItems = items.slice(startIndex, startIndex + pageSize);
    return {
        items: pageItems,
        page: safePage,
        pageSize,
        totalItems,
        totalPages,
        startIndex,
        endIndex: startIndex + pageItems.length,
    };
}
//# sourceMappingURL=thread-picker.js.map