interface DomainErrorOptions {
  code?: number;
  cause?: Error['cause'];
  details?: any;
}

class DomainError extends Error {
  #message;
  code = 400;
  details = null;
  time = new Date().toISOString();
  constructor(
    message: string,
    { code = 400, cause, details = null }: DomainErrorOptions = {},
  ) {
    super(message, { cause });
    this.name = DomainError.name;
    this.#message = message;
    this.message = code ? `[${code}]: ${message}` : message;
    this.code = code ?? this.code;
    this.details = details;
  }

  toJSON() {
    const { code, cause, details, time } = this;
    const message = this.#message;
    return { code, message, cause, details, time };
  }

  toString() {
    return this.message;
  }
}

export default DomainError;
