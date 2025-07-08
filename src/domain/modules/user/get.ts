export default ({ app, }: any) => [
  async () => {
    app.logger.log("controller");
  },
  async () => {
    app.logger.log("handler");
    return "test"
  },
];