import { type CommandName } from "./commands.js";
type CommandHelpFlag = {
    flag: string;
    description: string;
};
type CommandHelpEntry = {
    summary: string;
    usage: string;
    flags?: CommandHelpFlag[];
    examples: string[];
    notes?: string;
};
export declare const COMMAND_HELP: Record<CommandName, CommandHelpEntry>;
export declare function formatCommandUsage(commandName: CommandName): string;
export declare function renderCommandHelpText(commandName: string): string;
export {};
