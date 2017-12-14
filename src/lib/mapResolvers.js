const mapObj = fn => obj =>
  Object.keys(obj).reduce(
    (acc, key) => ({ ...acc, [key]: fn(obj[key], key, obj) }),
    {},
  );

const checkFn = (fn, fieldName) => {
  if (typeof fn !== 'function') {
    throw new Error(
      `Expected Function for ${fieldName} resolver but received ${typeof fn}`,
    );
  }
};

const wrapFn = namespace => (fn, fieldName) => {
  checkFn(fn, fieldName);
  return (root, args, context, info) =>
    fn(root, args, context[namespace], info);
};

export default (namespace, resolvers) => {
  if (resolvers instanceof Object) {
    return mapObj(mapObj(wrapFn(namespace)))(resolvers);
  }
};
