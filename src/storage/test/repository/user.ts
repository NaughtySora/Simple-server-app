export default (context: Storage) => ({
  create(data: any) {
    return {
      tokens: data.tokens,
      id: data.id,
    };
  },
});
