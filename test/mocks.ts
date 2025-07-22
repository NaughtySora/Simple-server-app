import loader from "../loader";
import * as jsonschema from "json-schema";
import * as http from "../src/utils/http";
import DomainError from '../src/utils/DomainError';
import { data_access_load } from "../bootstrap/application";

export const config = {
  session: {
    secret: {
      refresh: 'asnkmaskljkl12jkl12kjl12kl3j2l1k3jk1l23',
      access: 'asdasdasdasdijjkl12kl321jkl3',
    },
    duration: {
      refresh: '7d',
      access: '3d',
    },
  },
};

export const utils = { DomainError, http };
export const npm = { jsonschema };

export const storage = () => data_access_load(
  { storage: 'test' },
  { app: { logger: console } },
) as StorageApi;

export const node = loader.node.bind(null, [
  "util",
  "url",
  "timers",
  "stream",
  "process",
  "perf_hooks",
  "os",
  "net",
  "fs",
  "events",
  "crypto",
  "console",
  "child_process",
  "cluster",
  "buffer",
  "path",
  "http"
]) as any;
