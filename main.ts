import * as dotenv from 'dotenv';
dotenv.config();
import bootstrap from "./bootstrap.json";
import { application } from "./application";

const main = async () => {
  const { transport, routing, storage, app} = await application(bootstrap);
  await storage.start();
  const http = transport.http(routing.http);
  await http.start();

  const stop = async (code = 0, message?: Error) => {
    await storage.stop();
    await http.stop();
    const alert = code > 0 ? "error" : "log";
    app.logger[alert]("Application stopped", { code, message });
    process.exit(code);
  };

  const error = stop.bind(null, 1);
  const exit = stop.bind(null, 0);
  process.on("uncaughtException", error);
  process.on("SIGINT", exit);
};

main();