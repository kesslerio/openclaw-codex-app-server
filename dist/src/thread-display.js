const DISPLAY_THREAD_TITLE_MAX_LENGTH = 80;
function normalizeThreadText(value) {
    if (typeof value !== "string") {
        return undefined;
    }
    const firstLine = value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .find(Boolean);
    if (!firstLine) {
        return undefined;
    }
    const normalized = firstLine.replace(/\s+/g, " ").trim();
    return normalized || undefined;
}
function truncateThreadText(value, maxLength) {
    if (value.length <= maxLength) {
        return value;
    }
    if (maxLength <= 3) {
        return value.slice(0, maxLength);
    }
    return `${value.slice(0, maxLength - 3)}...`;
}
export function getThreadNormalizedTitle(thread) {
    return normalizeThreadText(thread.title) || normalizeThreadText(thread.summary) || thread.threadId;
}
export function getThreadDisplayTitle(thread, maxLength = DISPLAY_THREAD_TITLE_MAX_LENGTH) {
    return truncateThreadText(getThreadNormalizedTitle(thread), maxLength);
}
//# sourceMappingURL=thread-display.js.map