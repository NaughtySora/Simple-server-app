export default (modules: HTTPModules) => {
  return [
    {
      path: '/user/create',
      method: 'post',
      modules: modules.user.create,
    },
    {
      path: '/user/get',
      method: 'get',
      modules: modules.user.get,
    },
  ].sort((a: { path: string }, b: { path: string }) => {
    const aPath = a.path.includes(':');
    const bPath = b.path.includes(':');
    if (aPath === bPath) return 0;
    if (!aPath) return -1;
    return 1;
  });
};
