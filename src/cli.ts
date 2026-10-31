import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { Command, CommanderError } from "commander";
import { NotImplementedError, UiverdictError } from "./errors.js";
import { parseArgs, type CliCommand } from "./io/schemas.js";

const commandDefinitions = [
  { name: "run", options: ["--provider <provider>", "--samples <samples>", "--tasks <tasks>"] },
  { name: "score", options: ["--tasks <tasks>"] },
  { name: "aggregate", options: ["--input <path>"] },
  { name: "report", options: ["--input <path>"] },
  { name: "verify-readme", options: [] },
] as const satisfies readonly { name: CliCommand; options: readonly string[] }[];

function createProgram(): Command {
  const program = new Command().name("uiverdict").exitOverride();

  for (const definition of commandDefinitions) {
    const command = program.command(definition.name);
    for (const option of definition.options) command.requiredOption(option);
    command.action((options: Record<string, unknown>) => {
      parseArgs(definition.name, options);
      throw new NotImplementedError(definition.name);
    });
  }

  return program;
}

export async function run(argv: string[]): Promise<number> {
  try {
    await createProgram().parseAsync(argv, { from: "user" });
    return 0;
  } catch (error) {
    if (error instanceof CommanderError) return error.exitCode;
    if (error instanceof UiverdictError || error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(String(error));
    }
    return 1;
  }
}

const entrypoint = process.argv[1];
if (entrypoint && import.meta.url === pathToFileURL(resolve(entrypoint)).href) {
  void run(process.argv.slice(2)).then((exitCode) => {
    process.exitCode = exitCode;
  });
}