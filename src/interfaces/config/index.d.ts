import server from '../../config/server';
import storage from '../../config/storage';
import session from '../../config/session';

declare global {
  interface Config {
    storage: typeof storage;
    server: typeof server;
    node: string[];
    session: typeof session;
  }
}

export {};
