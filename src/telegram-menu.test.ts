import { describe, expect, it } from "vitest";
import { buildTelegramMenuWithPluginCommands } from "./telegram-menu.js";

describe("buildTelegramMenuWithPluginCommands", () => {
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
});
