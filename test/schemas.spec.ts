import { describe, expect, it } from "vitest";
import { ArgsError } from "../src/errors.js";
import { parseArgs } from "../src/io/schemas.js";

describe("parseArgs", () => {
  it("rejects an unsupported provider", () => {
    expect(() => parseArgs("run", { provider: "other", samples: "1", tasks: "all" })).toThrow(
      ArgsError,
    );
  });

  it("rejects samples below one", () => {
    expect(() => parseArgs("run", { provider: "fixture", samples: "0", tasks: "all" })).toThrow(
      ArgsError,
    );
  });

  it("rejects malformed task ids", () => {
    expect(() =>
      parseArgs("run", { provider: "fixture", samples: "1", tasks: "bad task" }),
    ).toThrow(/kebab-case ids/);
  });

  it("parses valid options", () => {
    expect(parseArgs("run", { provider: "fixture", samples: "2", tasks: "nav-menu,form" })).toEqual({
      provider: "fixture",
      samples: 2,
      tasks: ["nav-menu", "form"],
    });
  });
});