export default (modules: HTTPModules) => {
  return [
    {
      path: '/user/register',
      method: 'post',
      modules: modules.user.register,
    },
    {
      path: '/user/get',
      method: 'get',
      modules: modules.user.get,
    },
    {
      path: '/user/login',
      method: 'get',
      modules: modules.user.login,
    },
  ].sort((a: { path: string }, b: { path: string }) => {
    const aPath = a.path.includes(':');
    const bPath = b.path.includes(':');
    if (aPath === bPath) return 0;
    if (!aPath) return -1;
    return 1;
  });
};
