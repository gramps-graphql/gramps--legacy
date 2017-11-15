export default (namespace, resolvers) => {
  if (resolvers instanceof Object) {
    Object.keys(resolvers).forEach(type => {
      Object.keys(resolvers[type]).forEach(field => {
        const fn = resolvers[type][field];
        if (typeof fn !== 'function') {
          throw new Error(
            `Expected Function for ${type}.${field} resolver but received ${typeof fn}`,
          );
        }
        resolvers[type][field] = (root, args, context, info) =>
          fn(root, args, context[namespace], info);
      });
    });
    return resolvers;
  }
};
