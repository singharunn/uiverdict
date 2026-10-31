import { readFile } from "node:fs/promises";
import { z } from "zod";
import { ConfigError } from "./errors.js";

const weightsSchema = z
  .object({
    behavior: z.number().finite().min(0),
    a11y: z.number().finite().min(0),
    typecheck: z.number().finite().min(0),
    lint: z.number().finite().min(0),
    size: z.number().finite().min(0),
  })
  .strict()
  .superRefine((weights, context) => {
    const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    if (Math.abs(total - 1) > 1e-9) {
      context.addIssue({
        code: "custom",
        message: `Scoring weights must sum to 1 (received ${total}).`,
        path: [],
      });
    }
  });

const scoringConfigSchema = z
  .object({
    weights: weightsSchema,
    caps: z
      .object({
        behavior: z.number().finite().positive(),
        a11y: z.number().finite().positive(),
        typecheck: z.number().finite().positive(),
        lint: z.number().finite().positive(),
        size: z.number().finite().positive(),
      })
      .strict(),
    impactWeights: z
      .object({
        critical: z.number().finite().positive(),
        high: z.number().finite().positive(),
        medium: z.number().finite().positive(),
        low: z.number().finite().positive(),
      })
      .strict(),
    bootstrapSeed: z.number().int().nonnegative(),
  })
  .strict();

export type ScoringConfig = z.infer<typeof scoringConfigSchema>;

export function parseConfig(input: unknown): ScoringConfig {
  const result = scoringConfigSchema.safeParse(input);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "config"}: ${issue.message}`)
      .join("; ");
    throw new ConfigError(`Invalid scoring config: ${details}`);
  }
  return result.data;
}

export async function loadConfig(path: string): Promise<ScoringConfig> {
  let contents: string;
  try {
    contents = await readFile(path, "utf8");
  } catch (error) {
    const details = error instanceof Error ? `: ${error.message}` : "";
    throw new ConfigError(`Unable to read config "${path}"${details}`);
  }

  let input: unknown;
  try {
    input = JSON.parse(contents);
  } catch (error) {
    const details = error instanceof Error ? `: ${error.message}` : "";
    throw new ConfigError(`Invalid JSON in config "${path}"${details}`);
  }

  return parseConfig(input);
}