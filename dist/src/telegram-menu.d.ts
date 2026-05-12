import type { CommandName } from "./commands.js";
type Logger = {
    debug?: (message: string) => void;
    warn?: (message: string) => void;
};
type CommandEntry = {
    command: string;
    description: string;
};
type CommandTuple = readonly [CommandName, string];
export declare function buildTelegramMenuWithPluginCommands(existingCommands: readonly CommandEntry[], pluginCommands: readonly CommandTuple[]): CommandEntry[];
export declare function repairTelegramMenuCommands(params: {
    commands: readonly CommandTuple[];
    env?: NodeJS.ProcessEnv;
    logger?: Logger;
}): Promise<void>;
export declare function scheduleTelegramMenuRepair(params: {
    commands: readonly CommandTuple[];
    env?: NodeJS.ProcessEnv;
    logger?: Logger;
}): NodeJS.Timeout | undefined;
export {};
