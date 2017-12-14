export default (namespace, resolvers) => {
  if (resolvers instanceof Object) {
    const mappedResolvers = {};
    Object.keys(resolvers).forEach(type => {
      mappedResolvers[type] = {};
      Object.keys(resolvers[type]).forEach(field => {
        const fn = resolvers[type][field];
        if (typeof fn !== 'function') {
          throw new Error(
            `Expected Function for ${type}.${field} resolver but received ${typeof fn}`,
          );
        }
        mappedResolvers[type][field] = (root, args, context, info) =>
          fn(root, args, context[namespace], info);
      });
    });
    return mappedResolvers;
  }
};
