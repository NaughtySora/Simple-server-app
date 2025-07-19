
import userSchema from "./user.json";

export default ({ npm, utils }: ApplicationDependencies) => {
  const jsonschema = npm.jsonschema;
  const DomainError = utils.DomainError;

  const throwAble = (schema: any, data: any) => {
    const { errors, valid } = jsonschema.validate(data, schema as any);
    if (valid) return;
    const field = errors[0].property;
    const issue = schema.properties[field];
    throw new DomainError(issue.description as string);
  };
  return {
    user: {
      credentials: (credentials: Credentials) =>
        throwAble(userSchema.credentials, credentials),
    }
  };
};