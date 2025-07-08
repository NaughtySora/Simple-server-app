export default (context: any) => ({
  test() {
    return context.storage.query("select now()");
  },
  context,
});