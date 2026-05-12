export type PluginSdkCompatLogger = {
    debug?: (message: string) => void;
};
type CompatImporter = (specifier: string) => Promise<unknown>;
type CompatResolver = (specifier: string) => string;
type CompatPathExists = (targetPath: string) => boolean;
type CompatReadFile = (targetPath: string) => string;
export declare function isMissingPluginSdkSubpathError(error: unknown, specifier: string): boolean;
export declare function resolveCompatFallbackPath(openClawEntrypointPath: string, fallbackRelativePath: string): string;
export declare function resolveOpenClawEntrypointPath(params?: {
    resolver?: CompatResolver;
    pathExists?: CompatPathExists;
    readFile?: CompatReadFile;
    argv1?: string;
    cwd?: string;
}): string;
export declare function loadOpenClawCompatModule<T>(params: {
    specifier: string;
    fallbackRelativePath: string;
    label: string;
    logger?: PluginSdkCompatLogger;
    importer?: CompatImporter;
    resolver?: CompatResolver;
    pathExists?: CompatPathExists;
    cache?: Map<string, Promise<unknown>>;
}): Promise<T>;
export {};
