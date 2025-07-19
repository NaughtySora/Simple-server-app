import { Request, Response, Express } from "express";

export default ({ npm, config, app, node, utils }: any) => (routes: PathFinder["http"]) => {
  let server: any = null;
  let stopping = false;
  const express = npm.express;
  const PORT = config.server.http.port;
  const read = npm["naughty-util"].stream.read;
  const compose = npm["naughty-util"].async.compose;
  const codes = node.http.STATUS_CODES;
  const listen = app.logger.log.bind(null, `http server started on port ${PORT}`);
  const methods = ["get", "post", "put", "patch", "delete"];
  const no_body_methods = ["trace", "get", "options",]
  const NetworkError = utils.NetworkError;
  const HEADERS = {
    json: { "Content-Type": "application/json" },
  };
  const CODES = {
    badRequest: 400,
    success: 200,
    unsupportedMediaType: 415,
  };
  const typeError = (type?: string) => {
    const message = codes[CODES.unsupportedMediaType] as string;
    throw new NetworkError(message, {
      code: CODES.unsupportedMediaType,
      details: { type },
    });
  };
  const parseRequest = async (req: Request) => {
    const method = req.method.toLowerCase();
    const params = new URLSearchParams(req.query as Record<string, any>);
    const headers = Object.freeze(req.headers);
    if (no_body_methods.includes(method)) return { headers, body: {}, params };
    const type = headers["content-type"];
    if (!type || type.length === 0) return void typeError();
    if (type.startsWith("application/json")) {
      const buffer = await read(req);
      return { headers, body: JSON.parse(buffer.toString()), params };
    }
    return void typeError();
  };
  const serializers = npm["naughty-util"].abstract.factorify({
    json: async (data: any) => JSON.stringify(data),
  }, null);
  return {
    async start() {
      const http = express() as Express;
      server = http.listen(PORT, listen);
      server.on("error", (error: any) => {
        app.logger.error("Express server error", error);
      });
      for (const route of routes) {
        const method = route.method.toLowerCase();
        if (!methods.includes(method)) continue;
        const callback = compose(...route.modules);
        const path = route.path;
        const listener = async (req: Request, res: Response) => {
          try {
            const input = await parseRequest(req);
            const output = await callback(input);
            // possibly add cookie to meta later according to README.md example
            const { serialize = "json", } = output?.meta ?? {};
            const headers = Object.assign({}, HEADERS.json, output?.meta?.headers);
            const serializer = serializers(serialize);
            if (!serializer) {
              throw NetworkError(
                "Can't process response",
                { code: CODES.badRequest, details: { serialize } }
              );
            }
            res.writeHead(output?.meta?.code ?? CODES.success, headers);
            res.end(await serializer(output.response));
          } catch (e: any) {
            const code = e?.code;
            app.logger.error(e);
            if (code) {
              res.writeHead(code, HEADERS.json);
              const error = e?.message ?? codes[code] ?? codes[CODES.badRequest];
              res.end(JSON.stringify({ error }));
            } else {
              res.writeHead(CODES.badRequest, HEADERS.json);
              res.end(JSON.stringify({ error: codes[CODES.badRequest], }));
            }
          }
        };
        http[method as keyof typeof http].call(http, path, listener);
      }
    },
    async stop(ms = 10000) {
      if (stopping) return;
      if (!server) throw new Error("Serve is not running");
      stopping = true;
      server.closeIdleConnections();
      await Promise.race([
        new Promise((resolve, reject) => {
          server.close((error: any) => {
            if (error) return void reject(error);
            app.logger.log(`Server on ${PORT} has stopped`);
            stopping = false;
            server = null;
            resolve(undefined);
          });
        }),
        new Promise((resolve) => {
          setTimeout(() => {
            server.closeAllConnections();
            app.logger.log(`Server on ${PORT} has stopped within ${ms} seconds`);
            resolve(undefined);
          }, ms);
        })
      ]);
    },
  }
};