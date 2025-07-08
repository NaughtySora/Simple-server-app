export default {
  http: {
    port: parseInt(process.env.HTTP_PORT as string),
    debug: process.env.HTTP_DEBUG === "true",
  },
};
