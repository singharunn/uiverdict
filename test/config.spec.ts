import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ConfigError } from "../src/errors.js";
import { loadConfig, parseConfig } from "../src/config.js";

const validConfig = {
  weights: { behavior: 0.5, a11y: 0.2, typecheck: 0.15, lint: 0.1, size: 0.05 },
  caps: { behavior: 1, a11y: 1, typecheck: 1, lint: 1, size: 1 },
  impactWeights: { critical: 4, high: 3, medium: 2, low: 1 },
  bootstrapSeed: 2026,
};

describe("config", () => {
  it("loads and validates the scoring config", async () => {
    await expect(loadConfig("config/scoring.json")).resolves.toEqual(validConfig);
  });

  it("rejects weights that do not sum to one", () => {
    const config = {
      ...validConfig,
      weights: { ...validConfig.weights, size: 0.1 },
    };
    expect(() => parseConfig(config)).toThrow(/weights must sum to 1/i);
  });

  it("reports a missing config file clearly", async () => {
    const missingPath = join(tmpdir(), `uiverdict-missing-${process.pid}.json`);
    await expect(loadConfig(missingPath)).rejects.toThrow(ConfigError);
    await expect(loadConfig(missingPath)).rejects.toThrow(/Unable to read config/);
  });
});