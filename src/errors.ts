export class UiverdictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ConfigError extends UiverdictError {}

export class ArgsError extends UiverdictError {}

export class NotImplementedError extends UiverdictError {
  constructor(command: string) {
    super(`The ${command} command is not implemented yet.`);
  }
}