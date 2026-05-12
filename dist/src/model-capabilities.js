export const REASONING_EFFORT_OPTIONS = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "xhigh", label: "Extra High" },
];
function canonicalModelId(value) {
    const trimmed = value?.trim().toLowerCase() ?? "";
    if (!trimmed) {
        return "";
    }
    return trimmed.includes("/") ? (trimmed.split("/").at(-1) ?? trimmed) : trimmed;
}
function parseModelVersion(value) {
    const canonical = canonicalModelId(value);
    const match = canonical.match(/^gpt-(\d+)(?:\.(\d+))?/);
    if (!match) {
        return null;
    }
    return {
        major: Number(match[1] ?? 0),
        minor: Number(match[2] ?? 0),
    };
}
export function modelSupportsFast(model) {
    const version = parseModelVersion(model);
    if (!version) {
        return false;
    }
    return version.major > 5 || (version.major === 5 && version.minor >= 4);
}
export function modelSupportsReasoning(model) {
    return Boolean(canonicalModelId(model));
}
export function normalizeReasoningEffort(value) {
    const normalized = value?.trim().toLowerCase();
    if (!normalized) {
        return undefined;
    }
    if (normalized === "low" || normalized === "medium" || normalized === "high") {
        return normalized;
    }
    if (normalized === "xhigh" ||
        normalized === "extra-high" ||
        normalized === "extra high" ||
        normalized === "extrahigh") {
        return "xhigh";
    }
    return undefined;
}
export function formatReasoningEffortLabel(value) {
    const normalized = normalizeReasoningEffort(value);
    if (!normalized) {
        return "Default";
    }
    return REASONING_EFFORT_OPTIONS.find((option) => option.value === normalized)?.label ?? normalized;
}
export function getSupportedReasoningEfforts(model) {
    return modelSupportsReasoning(model) ? REASONING_EFFORT_OPTIONS.map((option) => option.value) : [];
}
export function formatModelCapabilitySuffix(model) {
    const capabilities = [
        model.supportsReasoning ? "reasoning" : "",
        model.supportsFast ? "fast" : "",
    ].filter(Boolean);
    return capabilities.length > 0 ? ` [${capabilities.join(", ")}]` : "";
}
//# sourceMappingURL=model-capabilities.js.map