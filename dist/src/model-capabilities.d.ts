import type { ModelSummary } from "./types.js";
export type ReasoningEffortValue = "low" | "medium" | "high" | "xhigh";
export declare const REASONING_EFFORT_OPTIONS: Array<{
    value: ReasoningEffortValue;
    label: string;
}>;
export declare function modelSupportsFast(model?: string): boolean;
export declare function modelSupportsReasoning(model?: string): boolean;
export declare function normalizeReasoningEffort(value?: string | null): ReasoningEffortValue | undefined;
export declare function formatReasoningEffortLabel(value?: string | null): string;
export declare function getSupportedReasoningEfforts(model?: string): ReasoningEffortValue[];
export declare function formatModelCapabilitySuffix(model: Pick<ModelSummary, "supportsFast" | "supportsReasoning">): string;
