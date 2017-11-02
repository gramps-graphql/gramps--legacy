export default (namespace, resolvers) => {
  if (resolvers instanceof Object) {
    for (const type of Object.keys(resolvers)) {
      for (const field of Object.keys(resolvers[type])) {
        const fn = resolvers[type][field];
        resolvers[type][field] = (root, args, context, info) =>
          fn(root, args, context[namespace], info);
      }
    }
    return resolvers;
  }
};
