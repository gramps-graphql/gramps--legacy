import pkg from '../package.json';

const typeDefs = `
  type Query {
    # Returns the current version of GrAMPS.
    grampsVersion: String!
  }

  type Mutation {
    # Returns a charming message from GrAMPS.
    grampsPing: String!
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;

const resolvers = {
  Query: {
    grampsVersion: /* istanbul ignore next */ () => pkg.version,
  },
  Mutation: {
    grampsPing: /* istanbul ignore next */ () => 'GET OFF MY LAWN',
  },
};

export default { typeDefs, resolvers };
