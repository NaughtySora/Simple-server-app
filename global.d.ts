import pg from "pg";
import utils from "naughty-util";
import express from "express";
import dotenv from "dotenv";

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
    }
  },
  server: {
    http: {
      port: number;
      debug: boolean;
    }
  },
  node: string[];
}

interface NPM {
  dotenv: typeof dotenv;
  express: typeof express;
  'naughty-util': typeof utils;
  pg: typeof pg;
}

declare global {
  interface Essentials {
    config: Config;
    npm: NPM;
    utils: any;
    node: Record<string, any>;
  }

  type Pool = pg.Pool
}

export { }
