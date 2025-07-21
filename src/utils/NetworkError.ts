interface NetworkErrorOptions {
  code?: number;
  cause?: Error['cause'];
  details?: any;
}

class NetworkError extends Error {
  code = 400;
  details = null;
  time = new Date().toISOString();
  constructor(
    message: string,
    { code = 400, cause, details = null }: NetworkErrorOptions = {},
  ) {
    super(message, { cause });
    this.code = code;
    this.details = details;
    this.name = NetworkError.name;
    this.time = new Date().toISOString();
  }

  toJSON() {
    const { cause, name, message, code } = this;
    const stack = this.stack?.split('\n').map((line) => line.trim());
    return { cause, name, message, code, stack };
  }

  toString() {
    const { name, code, message } = this;
    const identity = `${name}: ${code ? `[${code}]` : ''}`;
    return `${identity} ${message}`;
  }
}

export default NetworkError;
