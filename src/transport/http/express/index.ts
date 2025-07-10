import { Request, Response } from "express";
import NetworkError from "./NetworkError/index";

export default ({ npm, config, app, node }: LayerContext) => (routes: PathFinder["http"]) => {
  const express = npm.express;
  const PORT = config.server.http.port;
  const read = npm["naughty-util"].stream.read;
  const http = node.http.STATUS_CODES;
  const listen = app.logger.log.bind(null, `http server started on port ${PORT}`);
  const methods = ["get", "post", "put", "patch", "delete"];
  const compose = npm['naughty-util'].async.compose;
  const jsonParser = async (req: Request) => {
    const type = req.headers["content-type"];
    if (type !== "application/json") {
      const code = 415;
      const message = http[code] as string;
      throw new NetworkError(message, { code, details: { type } });
    }
    const buffer = await read(req);
    return JSON.parse(buffer.toString());
  };
  return {
    async start() {
      const server = express();
      server.listen(PORT, listen);
      server.on("error", (error) => {
        app.logger.error("Express server error", error);
      });
      for (const route of routes) {
        const method = route.method.toLowerCase();
        if (!methods.includes(method)) continue;
        const callback = compose(...route.modules);
        const path = route.path;
        const { format = "json", headers = {}, code = 200 } = route.meta ?? {};
        const listener = async (req: Request, res: Response) => {
          try {
            const data = await jsonParser(req);
            if (format === "json") {
              const processed = await callback({ req, res, data });
              res.writeHead(code ?? 200, {
                "Content-Type": "application/json",
                ...headers,
              });
              res.end(JSON.stringify(processed));
            } else {
              throw new Error("wrong response format"); // change later
            }
          } catch (e: any) {
            const code = e?.code;
            app.logger.error(e);
            if (code) {
              res.writeHead(code, { "content-type": "application/json" });
              res.end(JSON.stringify({ error: e?.message ?? "Bad Request", }));
            } else {
              res.writeHead(400, { "content-type": "application/json" });
              res.end(JSON.stringify({ error: "Bad Request", }));
            }
          }
        }
        server[method as keyof typeof server].call(server, path, listener);
      }
    },
    async stop() { },
  }
};