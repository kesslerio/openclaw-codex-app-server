import { afterEach, describe, expect, it, vi } from "vitest";
import { buildTelegramMenuWithPluginCommands, scheduleTelegramMenuRepair } from "./telegram-menu.js";

describe("buildTelegramMenuWithPluginCommands", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("prepends CAS commands and keeps existing menu commands after them", () => {
    const menu = buildTelegramMenuWithPluginCommands(
      [
        { command: "help", description: "Show help" },
        { command: "cas_resume", description: "Old CAS entry" },
        { command: "status", description: "Show status" },
      ],
      [
        ["cas_resume", "Resume Codex"],
        ["cas_status", "Show Codex status"],
      ],
    );

    expect(menu).toEqual([
      { command: "cas_resume", description: "Resume Codex" },
      { command: "cas_status", description: "Show Codex status" },
      { command: "help", description: "Show help" },
      { command: "status", description: "Show status" },
    ]);
  });

  it("caps the repaired menu at Telegram's 100-command limit", () => {
    const existing = Array.from({ length: 120 }, (_, index) => ({
      command: `cmd_${index}`,
      description: `Command ${index}`,
    }));

    const menu = buildTelegramMenuWithPluginCommands(existing, [["cas_resume", "Resume Codex"]]);

    expect(menu).toHaveLength(100);
    expect(menu[0]).toEqual({ command: "cas_resume", description: "Resume Codex" });
    expect(menu.at(-1)?.command).toBe("cmd_98");
  });

  it("cancels scheduled Telegram menu repair before the first API call", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const handle = scheduleTelegramMenuRepair({
      commands: [["cas_resume", "Resume Codex"]],
      env: { OPENCLAW_CHANNELS_TELEGRAM_BOT_TOKEN: "token" } as NodeJS.ProcessEnv,
    });

    handle?.cancel();
    await vi.advanceTimersByTimeAsync(10_000);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not retry after a successful Telegram menu repair", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(async (url: string) => ({
      ok: true,
      json: async () =>
        url.includes("getMyCommands")
          ? { ok: true, result: [] }
          : { ok: true, result: true },
    }));
    vi.stubGlobal("fetch", fetchMock);

    scheduleTelegramMenuRepair({
      commands: [["cas_resume", "Resume Codex"]],
      env: { OPENCLAW_CHANNELS_TELEGRAM_BOT_TOKEN: "token" } as NodeJS.ProcessEnv,
    });

    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(60_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
