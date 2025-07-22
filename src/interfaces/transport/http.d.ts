import { IncomingMessage, ServerResponse } from 'node:http';

interface HTTPResponseMeta {
  code?: number;
  headers?: Record<string, string>;
  serialize?: 'json';
}

type HTTPRouteMethods = 'get' | 'post' | 'put' | 'patch' | 'delete';

declare global {
  interface HTTPRoute {
    path: string;
    method: HTTPRouteMethods | Capitalize<HTTPRouteMethods>;
    modules: DomainModule;
  }

  type RouteController = <
    R extends IncomingMessage,
    RS extends ServerResponse,
  >({
    req: R,
    res: RS,
    data: any,
  }) => Promise<any>;

  type AsyncCallback = (
    ...args: any[]
  ) => Promise<{ response: any; meta?: HTTPResponseMeta }>;

  interface ControllerParameters<T> {
    headers: Readonly<Record<string, string>>;
    body: Readonly<T>;
    params:  Readonly<URLSearchParams>;
  };

  type HTTPModules = Record<string, Record<string, DomainModule>>;
}

export {};
