import { z } from "zod";
import { ArgsError } from "../errors.js";

const taskSelectorSchema = z
  .string()
  .trim()
  .superRefine((value, context) => {
    if (value === "all") return;

    for (const [index, taskId] of value.split(",").entries()) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(taskId.trim()) || taskId.trim() === "all") {
        context.addIssue({
          code: "custom",
          message: "Tasks must be 'all' or comma-separated kebab-case ids.",
          path: [index],
        });
      }
    }
  })
  .transform((value) => (value === "all" ? "all" : value.split(",").map((id) => id.trim())));

const argumentSchemas = {
  run: z
    .object({
      provider: z.enum(["fixture", "anthropic", "openai_compatible"]),
      samples: z.coerce.number().int().min(1),
      tasks: taskSelectorSchema,
    })
    .strict(),
  score: z.object({ tasks: taskSelectorSchema }).strict(),
  aggregate: z.object({ input: z.string().min(1) }).strict(),
  report: z.object({ input: z.string().min(1) }).strict(),
  "verify-readme": z.object({}).strict(),
};

export type CliCommand = keyof typeof argumentSchemas;

export function parseArgs<T extends CliCommand>(
  command: T,
  input: unknown,
): z.infer<(typeof argumentSchemas)[T]> {
  const result = argumentSchemas[command].safeParse(input);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "arguments"}: ${issue.message}`)
      .join("; ");
    throw new ArgsError(`Invalid arguments for ${command}: ${details}`);
  }
  return result.data as z.infer<(typeof argumentSchemas)[T]>;
}