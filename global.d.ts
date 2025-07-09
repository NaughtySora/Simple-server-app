import pg, { Pool, Query } from "@types/pg";
import jwt from "@types/jsonwebtoken";
import utils from "naughty-util";
import express from "express";
import dotenv from "dotenv";
import jsonwebtoken from "jsonwebtoken";
import Util from "node:util";
import Url from "node:url";
import Timers from "node:timers";
import Stream from "node:stream";
import Process from "node:process";
import perfHooks from "node:perf_hooks";
import Os from "node:os";
import Net from "node:net";
import Fs from "node:fs";
import Events from "node:events";
import Crypto from "node:crypto";
import Console from "node:console";
import Childprocess from "node:child_process"
import Cluster from "node:cluster";
import Buffer from "node:buffer";
import Path from "node:path";
import Http, { IncomingMessage, ServerResponse } from "node:http";

type pool = Pool;
type Query = Pool["query"];

interface Config {
  storage: {
    pg: {
      host: string;
      port: number;
      database: string;
      user: string;
      password: string;
      max: number;
      idleTimeoutMillis: number;
      connectionTimeoutMillis: number;
      maxUses: number;
    },
    use: string;
  },
  server: {
    http: {
      port: number;
      debug: boolean;
    }
  },
  node: [
    'util', 'url', 'timers', 'stream', 'process',
    'perf_hooks', 'os', 'net', 'fs', 'events',
    'crypto', 'console', 'child_process', 'cluster',
    'buffer', 'path', "http",
  ];
  session: {
    secret: {
      refresh: string;
      access: string;
    },
    duration: {
      refresh: string;
      access: string;
    },
  }
}

interface SessionData {
  data: {
    [k: string]: any;
    _type: string;
  };
  iat: 1752058036;
  exp: 1752317236;
}

interface NPM {
  dotenv: typeof dotenv;
  express: typeof express;
  'naughty-util': typeof utils;
  pg: typeof pg;
  jwt: typeof jwt;
}

type StorageApi = Record<string, any>; // Types

type HTTPMethods = "get" | "post" | "put" | "patch" | "delete";
type AsyncCallback = (...args: any[]) => Promise<any>;
type RouteController = <R extends IncomingMessage, RS extends ServerResponse>(req: R, res: RS) => Promise<any>;
type HTTPModules = Record<string, [RouteController, ...AsyncCallback]>;
type Restartable = { start(): Promise<void>, stop(): Promise<void> };

interface HTTPRoute {
  path: string;
  method: HTTPMethods | Capitalize<HTTPMethods>;
  modules: HTTPModules[string];
  meta?: {
    code?: number;
    headers?: Record<string, string>;
    format?: "json"; // add more later
  };
}

declare global {
  interface Essentials {
    config: Config;
    npm: NPM;
    utils: {
      test: {};
    };
    node: {
      util: typeof Util;
      url: typeof Url;
      timers: typeof Timers;
      stream: typeof Stream;
      process: typeof Process;
      perf_hooks: typeof perfHooks;
      os: typeof Os;
      net: typeof Net;
      fs: typeof Fs;
      events: typeof Events;
      crypto: typeof Crypto;
      console: typeof Console;
      child_process: typeof Childprocess;
      cluster: typeof Cluster;
      buffer: typeof Buffer;
      path: typeof Path;
      http: typeof Http;
    };
  }

  interface Application {
    logger: Console;
    security: {
      hash(password: string): Promise<string>;
      compare(password: string, hashed: string): Promise<boolean>;
    };
    session: {
      access(data: Payload): Promise<string>;
      refresh(data: Payload): Promise<string>;
      verify(token: string): Promise<boolean>;
      decode(token: string): Promise<SessionData>;
    };
  }

  interface Layers {
    storage: Restartable & {
      api: StorageApi;
      query: Query;
    };
    app: Application;
    transport: {
      http(routing: PathFinder["http"]): Restartable;
    };
  }

  type Modules = HTTPModules;
  interface PathFinder {
    http: HTTPRoute[];
  }

  type ServicesContext = Essentials & {
    app: Application;
    storage: StorageApi;
  };

  type LayerContext = Essentials & { app: Application };

  type DomainServices = Record<string, any>;
  type DomainContext = Exclude<LayerContext, "config"> & { services: DomainServices };
  type Pool = Pool;
  type QueryParameters = Parameters<Query>;
  type RepositoryContext = { context: LayerContext } & Layers["storage"];
}

export { }
