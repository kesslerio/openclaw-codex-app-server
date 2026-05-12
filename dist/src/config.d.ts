import type { PluginSettings } from "./types.js";
export declare function resolvePluginSettings(rawConfig: unknown): PluginSettings;
export declare function resolveWorkspaceDir(params: {
    requested?: string;
    bindingWorkspaceDir?: string;
    configuredWorkspaceDir?: string;
    serviceWorkspaceDir?: string;
}): string;
