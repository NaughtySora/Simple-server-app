const storage = new Map();

export default {
  async create({ id, tokens }: TokensCreation) {
    const date = new Date().toISOString();
    const key = `${tokens.access}|${tokens.refresh}`;
    const session = {
      user_id: id,
      access: tokens.access,
      refresh: tokens.refresh,
      created_at: date,
      updated_at: date,
    };
    storage.set(key, session);
  },
};
