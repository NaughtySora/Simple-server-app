import { Request, Response } from "express";

export default ({ npm, config, app }: any) => (routes: any) => {
  const express = npm.express;
  const PORT = config.server.http.port;
  const listen = app.logger.log.bind(null, `http server started on port ${PORT}`);
  const methods = ["get", "post", "put", "patch", "delete"];
  const compose = npm['naughty-util'].async.compose;
  return {
    async start() {
      const server = express();
      server.listen(PORT, listen);
      server.on("error", (error: Error) => {
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
            if (format === "json") {
              const data = await callback(req, res);
              res.writeHead(code ?? 200, {
                "Content-Type": "application/json",
                ...headers,
              });
              res.end(JSON.stringify(data));
            } else {
              throw new Error("wrong response format"); // change later
            }
          } catch (e: any) {
            const code = e?.code;
            app.logger.error(e);
            if (code) {
              res.writeHead(code);
              res.end(JSON.stringify({ error: e?.message ?? "Bad Request", }));
            } else {
              res.writeHead(400);
              res.end(JSON.stringify({ error: "Bad Request", }));
            }
          }
        }
        server[method].call(server, path, listener);
      }
    },
    async stop() { },
  }
};