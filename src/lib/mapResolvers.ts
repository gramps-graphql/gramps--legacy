interface IResolver {
  (root: any, args: any, context: any, info?: any): any;
}

interface IMapObjectFn {
  (obj: any): any;
}

const omit = (key: string) => ["Subscription"].includes(key);

const maybeMap = (key: string, fn: IResolver, obj: any) =>
  omit(key) ? obj[key] : fn(obj[key], key, obj);

const mapObj = (fn: IResolver | IMapObjectFn): IMapObjectFn => (obj: any) => {
  if (obj.constructor.name === "Object") {
    return Object.keys(obj).reduce(
      (acc, key) => ({
        ...acc,
        [key]: maybeMap(key, fn, obj)
      }),
      {}
    );
  } else {
    return obj;
  }
};

const checkFn = (fn: IResolver, fieldName: string) => {
  if (typeof fn !== "function") {
    throw new Error(
      `Expected Function for ${fieldName} resolver but received ${typeof fn}`
    );
  }
};

const wrapFn = (namespace: string) => (
  fn: IResolver,
  fieldName: string
): IResolver => {
  checkFn(fn, fieldName);
  return (root: any, args: any, context: any, info: any) =>
    fn(root, args, context[namespace], info);
};

export default (namespace: string, resolvers: any) => {
  if (resolvers instanceof Object) {
    return mapObj(mapObj(wrapFn(namespace)))(resolvers);
  }
};
