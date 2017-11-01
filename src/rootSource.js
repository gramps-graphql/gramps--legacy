import pkg from '../package.json';

import schema from './rootSchema.graphql';

const resolvers = {
  Query: {
    grampsVersion: /* istanbul ignore next */ () => pkg.version,
  },
  Mutation: {
    grampsPing: /* istanbul ignore next */ () => 'GET OFF MY LAWN',
  },
};

export default { schema, resolvers };
