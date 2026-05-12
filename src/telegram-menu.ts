import type { CommandName } from "./commands.js";

const TELEGRAM_COMMAND_LIMIT = 100;
const TELEGRAM_DESCRIPTION_LIMIT = 256;
const TELEGRAM_MENU_REPAIR_DELAY_MS = 10_000;

type Logger = {
  debug?: (message: string) => void;
  warn?: (message: string) => void;
};

type CommandEntry = {
  command: string;
  description: string;
};

type CommandTuple = readonly [CommandName, string];

type TelegramApiResponse<T> =
  | {
      ok: true;
      result: T;
    }
  | {
      ok: false;
      description?: string;
    };

function normalizeTelegramCommandName(command: string): string {
  return command.trim().replace(/-/g, "_").toLowerCase();
}

function normalizeTelegramDescription(description: string): string {
  const trimmed = description.trim();
  if (trimmed.length <= TELEGRAM_DESCRIPTION_LIMIT) {
    return trimmed;
  }
  return trimmed.slice(0, TELEGRAM_DESCRIPTION_LIMIT - 1).trimEnd() + ".";
}

function buildCommandEntries(commands: readonly CommandTuple[]): CommandEntry[] {
  return commands.map(([command, description]) => ({
    command: normalizeTelegramCommandName(command),
    description: normalizeTelegramDescription(description),
  }));
}

export function buildTelegramMenuWithPluginCommands(
  existingCommands: readonly CommandEntry[],
  pluginCommands: readonly CommandTuple[],
): CommandEntry[] {
  const pluginMenuCommands = buildCommandEntries(pluginCommands);
  const pluginCommandNames = new Set(pluginMenuCommands.map((entry) => entry.command));
  const remainingCommands = existingCommands.filter(
    (entry) => !pluginCommandNames.has(normalizeTelegramCommandName(entry.command)),
  );
  return [...pluginMenuCommands, ...remainingCommands].slice(0, TELEGRAM_COMMAND_LIMIT);
}

function resolveTelegramBotToken(env: NodeJS.ProcessEnv): string | undefined {
  return (
    env.OPENCLAW_CHANNELS_TELEGRAM_BOT_TOKEN?.trim() ||
    env.TELEGRAM_BOT_TOKEN?.trim() ||
    undefined
  );
}

async function readTelegramCommands(token: string): Promise<CommandEntry[]> {
  const response = await fetch(`https://api.telegram.org/bot${token}/getMyCommands`);
  const body = (await response.json()) as TelegramApiResponse<CommandEntry[]>;
  if (!response.ok || !body.ok) {
    throw new Error(body.ok === false ? body.description : response.statusText);
  }
  return body.result;
}

async function writeTelegramCommands(token: string, commands: readonly CommandEntry[]): Promise<void> {
  const response = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ commands }),
  });
  const body = (await response.json()) as TelegramApiResponse<true>;
  if (!response.ok || !body.ok) {
    throw new Error(body.ok === false ? body.description : response.statusText);
  }
}

export async function repairTelegramMenuCommands(params: {
  commands: readonly CommandTuple[];
  env?: NodeJS.ProcessEnv;
  logger?: Logger;
}): Promise<void> {
  const token = resolveTelegramBotToken(params.env ?? process.env);
  if (!token) {
    return;
  }

  const currentCommands = await readTelegramCommands(token);
  const nextCommands = buildTelegramMenuWithPluginCommands(currentCommands, params.commands);
  const currentSerialized = JSON.stringify(currentCommands);
  const nextSerialized = JSON.stringify(nextCommands);
  if (currentSerialized === nextSerialized) {
    params.logger?.debug?.("codex telegram menu already contains CAS commands");
    return;
  }

  await writeTelegramCommands(token, nextCommands);
  params.logger?.debug?.(`codex telegram menu repaired with ${params.commands.length} CAS commands`);
}

export function scheduleTelegramMenuRepair(params: {
  commands: readonly CommandTuple[];
  env?: NodeJS.ProcessEnv;
  logger?: Logger;
}): NodeJS.Timeout | undefined {
  if (!resolveTelegramBotToken(params.env ?? process.env)) {
    return undefined;
  }
  const timer = setTimeout(() => {
    repairTelegramMenuCommands(params).catch((error) => {
      params.logger?.warn?.(`codex telegram menu repair failed: ${String(error)}`);
    });
  }, TELEGRAM_MENU_REPAIR_DELAY_MS);
  timer.unref?.();
  return timer;
}
