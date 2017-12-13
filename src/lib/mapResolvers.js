import merge from 'lodash.merge';

export default (namespace, resolvers) => {
  if (resolvers instanceof Object) {
    return Object.keys(resolvers).reduce((newResolvers, type) => {
      const fieldResolvers = Object.keys(resolvers[type]).map(field => {
        const fn = resolvers[type][field];

        if (typeof fn !== 'function') {
          throw new Error(
            `Expected Function for ${type}.${field} resolver but received ${typeof fn}`,
          );
        }

        const resolver = (root, args, context, info) =>
          fn(root, args, context[namespace], info);

        return {
          [type]: {
            [field]: resolver,
          },
        };
      });

      return merge(newResolvers, ...fieldResolvers);
    }, {});
  }
};
