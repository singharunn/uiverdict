import { afterEach, describe, expect, it, vi } from "vitest";
import { run } from "../src/cli.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CLI", () => {
  it("returns 1 with a clear error for an invalid provider", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await expect(
      run(["run", "--provider", "other", "--samples", "1", "--tasks", "all"]),
    ).resolves.toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining("Invalid arguments for run"));
  });

  it.each([
    ["samples below one", "--samples", "0", "samples"],
    ["malformed task ids", "--tasks", "bad task", "kebab-case ids"],
  ])("returns 1 with a clear error for %s", async (_case, option, value, message) => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await expect(
      run(["run", "--provider", "fixture", "--samples", "1", "--tasks", "all", option, value]),
    ).resolves.toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining(message));
  });

  it("returns 1 when a required option is missing", async () => {
    await expect(run(["run"])).resolves.toBe(1);
  });

  it("returns 1 for an unknown command", async () => {
    await expect(run(["unknown-command"])).resolves.toBe(1);
  });

  it("returns 0 for help", async () => {
    await expect(run(["--help"])).resolves.toBe(0);
  });

  it("reports valid commands as not implemented", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await expect(
      run(["run", "--provider", "fixture", "--samples", "1", "--tasks", "all"]),
    ).resolves.toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining("not implemented"));
  });
});