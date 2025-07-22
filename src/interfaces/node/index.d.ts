import Util from 'node:util';
import Url from 'node:url';
import Timers from 'node:timers';
import Stream from 'node:stream';
import Process from 'node:process';
import perfHooks from 'node:perf_hooks';
import Os from 'node:os';
import Net from 'node:net';
import Fs from 'node:fs';
import Events from 'node:events';
import Crypto from 'node:crypto';
import Console from 'node:console';
import Childprocess from 'node:child_process';
import Cluster from 'node:cluster';
import Buffer from 'node:buffer';
import Path from 'node:path';
import Http from 'node:http';

declare global {
  interface NodeApi {
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
  }
}

export {};
