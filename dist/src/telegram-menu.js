const TELEGRAM_COMMAND_LIMIT = 100;
const TELEGRAM_DESCRIPTION_LIMIT = 256;
const TELEGRAM_MENU_REPAIR_DELAY_MS = 10_000;
function normalizeTelegramCommandName(command) {
    return command.trim().replace(/-/g, "_").toLowerCase();
}
function normalizeTelegramDescription(description) {
    const trimmed = description.trim();
    if (trimmed.length <= TELEGRAM_DESCRIPTION_LIMIT) {
        return trimmed;
    }
    return trimmed.slice(0, TELEGRAM_DESCRIPTION_LIMIT - 1).trimEnd() + ".";
}
function buildCommandEntries(commands) {
    return commands.map(([command, description]) => ({
        command: normalizeTelegramCommandName(command),
        description: normalizeTelegramDescription(description),
    }));
}
export function buildTelegramMenuWithPluginCommands(existingCommands, pluginCommands) {
    const pluginMenuCommands = buildCommandEntries(pluginCommands);
    const pluginCommandNames = new Set(pluginMenuCommands.map((entry) => entry.command));
    const remainingCommands = existingCommands.filter((entry) => !pluginCommandNames.has(normalizeTelegramCommandName(entry.command)));
    return [...pluginMenuCommands, ...remainingCommands].slice(0, TELEGRAM_COMMAND_LIMIT);
}
function resolveTelegramBotToken(env) {
    return (env.OPENCLAW_CHANNELS_TELEGRAM_BOT_TOKEN?.trim() ||
        env.TELEGRAM_BOT_TOKEN?.trim() ||
        undefined);
}
async function readTelegramCommands(token) {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMyCommands`);
    const body = (await response.json());
    if (!response.ok || !body.ok) {
        throw new Error(body.ok === false ? body.description : response.statusText);
    }
    return body.result;
}
async function writeTelegramCommands(token, commands) {
    const response = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ commands }),
    });
    const body = (await response.json());
    if (!response.ok || !body.ok) {
        throw new Error(body.ok === false ? body.description : response.statusText);
    }
}
export async function repairTelegramMenuCommands(params) {
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
export function scheduleTelegramMenuRepair(params) {
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
//# sourceMappingURL=telegram-menu.js.map