export default (modules: Record<string, Modules>) => {
  return [
    {
      path: "/project:id",
      method: "get",
      modules: modules.user.get
    },
    {
      path: "/user/:id/test",
      method: "get",
      modules: modules.user.get
    },
    {
      path: "/user/create",
      method: "get",
      modules: modules.user.create
    },
    {
      path: "/",
      method: "get",
      modules: modules.user.get
    },
  ].sort((a: { path: string }, b: { path: string }) => {
    const aPath = a.path.includes(":");
    const bPath = b.path.includes(":");
    if (aPath === bPath) return 0;
    if (!aPath) return -1;
    return 1;
  });
}