import os from "node:os";
import path from "node:path";
import { formatCommandUsage } from "./help.js";
import { getThreadNormalizedTitle } from "./thread-display.js";
function normalizeOptionDashes(text) {
    return text
        .replace(/(^|\s)[\u2010-\u2015\u2212](?=\S)/g, "$1--")
        .replace(/[\u2010-\u2015\u2212]/g, "-");
}
export function parseThreadSelectionArgs(args) {
    const tokens = normalizeOptionDashes(args)
        .split(/\s+/)
        .map((token) => token.trim())
        .filter(Boolean);
    let includeAll = false;
    let listProjects = false;
    let startNew = false;
    let syncTopic = false;
    let cwd;
    let requestedModel;
    let requestedFast;
    let requestedYolo;
    let error;
    const queryTokens = [];
    for (let index = 0; index < tokens.length; index += 1) {
        const token = tokens[index];
        if (token === "--all" || token === "-a") {
            includeAll = true;
            continue;
        }
        if (token === "--projects" || token === "--project" || token === "-p") {
            listProjects = true;
            continue;
        }
        if (token === "--new") {
            startNew = true;
            continue;
        }
        if (token === "--sync") {
            syncTopic = true;
            continue;
        }
        if (token === "--fast") {
            requestedFast = true;
            continue;
        }
        if (token === "--no-fast") {
            requestedFast = false;
            continue;
        }
        if (token === "--yolo") {
            requestedYolo = true;
            continue;
        }
        if (token === "--no-yolo") {
            requestedYolo = false;
            continue;
        }
        if (token === "--model") {
            const next = tokens[index + 1]?.trim();
            if (next) {
                requestedModel = next;
                index += 1;
                continue;
            }
            error = formatCommandUsage("cas_resume");
            break;
        }
        if (token === "--cwd") {
            const next = tokens[index + 1]?.trim();
            if (next) {
                cwd = expandHomeDir(next);
                index += 1;
                continue;
            }
            error = formatCommandUsage("cas_resume");
            break;
        }
        queryTokens.push(token);
    }
    return {
        includeAll,
        listProjects,
        startNew,
        syncTopic,
        cwd,
        requestedModel,
        requestedFast,
        requestedYolo,
        error,
        query: queryTokens.join(" ").trim(),
    };
}
export function expandHomeDir(value) {
    if (value === "~") {
        return os.homedir();
    }
    if (value.startsWith("~/")) {
        return path.join(os.homedir(), value.slice(2));
    }
    return value;
}
export function selectThreadFromMatches(threads, query) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
        return { kind: "none" };
    }
    if (threads.length === 0) {
        return { kind: "none" };
    }
    const loweredQuery = trimmedQuery.toLowerCase();
    const exactMatch = threads.find((thread) => thread.threadId === trimmedQuery) ??
        threads.find((thread) => getThreadNormalizedTitle(thread).toLowerCase() === loweredQuery);
    if (exactMatch) {
        return { kind: "unique", thread: exactMatch };
    }
    if (threads.length === 1) {
        return { kind: "unique", thread: threads[0] };
    }
    return { kind: "ambiguous", threads };
}
//# sourceMappingURL=thread-selection.js.map