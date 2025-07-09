export default ({ app, }: DomainContext) => [
  async () => {
    app.logger.log("controller");
  },
  async () => {
    app.logger.log("handler");
    return "test"
  },
];