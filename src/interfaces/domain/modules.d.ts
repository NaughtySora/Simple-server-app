import userCreate from "../../domain/modules/user/create";
import userGet from "../../domain/modules/user/get";

declare global {
  type DomainModule = [RouteController, ...AsyncCallback];

  interface DomainServicesModules {
    user: {
      create: ReturnType<typeof userCreate>;
      get: ReturnType<typeof userGet>;
    };
  }
}

export { };
