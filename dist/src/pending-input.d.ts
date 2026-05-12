import type { PendingInputAction, PendingInputState, PendingQuestionnaireAnswer, PendingQuestionnaireState } from "./types.js";
export declare function buildPendingUserInputActions(params: {
    method?: string;
    requestParams?: unknown;
    options?: string[];
}): PendingInputAction[];
export declare function parsePendingQuestionnaire(text: string): PendingQuestionnaireState | undefined;
export declare function formatPendingQuestionnairePrompt(questionnaire: PendingQuestionnaireState): string;
export declare function renderPendingQuestionnaireAnswer(answer: PendingQuestionnaireAnswer | null): string;
export declare function buildPendingQuestionnaireResponse(questionnaire: PendingQuestionnaireState): {
    answers: Record<string, {
        answers: string[];
    }>;
} | string;
export declare function addQuestionnaireResponseNote(response: {
    answers: Record<string, {
        answers: string[];
    }>;
} | string, note: string): {
    answers: Record<string, {
        answers: string[];
    }>;
} | string;
export declare function questionnaireIsComplete(questionnaire: PendingQuestionnaireState): boolean;
export declare function questionnaireCurrentQuestionHasAnswer(questionnaire: PendingQuestionnaireState): boolean;
/**
 * Strips common shell launcher wrappers from a command string for display.
 * For example: `/bin/zsh -lc 'git status'` → `git status`
 *
 * Matches upstream Codex Desktop behavior (strip_bash_lc_and_escape in
 * codex-rs/tui/src/exec_command.rs). The raw command is preserved for
 * approval transport; only the displayed form is simplified.
 */
export declare function stripShellLauncher(command: string): string;
/**
 * Extracts a display command from the app-server's `commandActions` array.
 *
 * The app-server protocol provides `commandActions` as "best-effort parsed
 * command actions for friendly display" (see CommandAction type in
 * codex-rs/app-server-protocol). Each action has a `.command` field that is
 * already stripped of shell launcher wrappers by the Rust-side parser
 * (extract_shell_command → strip_bash_lc_and_escape).
 *
 * When available, this is more reliable than regex-based stripping because
 * the upstream parser uses tree-sitter for proper shell parsing.
 */
export declare function extractCommandFromActions(requestParams: unknown): string | undefined;
export declare function buildPendingPromptText(params: {
    method: string;
    requestId: string;
    options: string[];
    actions: PendingInputAction[];
    expiresAt: number;
    requestParams: unknown;
}): string;
export declare function createPendingInputState(params: {
    method: string;
    requestId: string;
    requestParams: unknown;
    options: string[];
    expiresAt: number;
}): PendingInputState;
export declare function parseCodexUserInput(text: string, optionsCount: number): {
    kind: "option";
    index: number;
} | {
    kind: "text";
    text: string;
};
export declare function requestToken(requestId: string): string;
