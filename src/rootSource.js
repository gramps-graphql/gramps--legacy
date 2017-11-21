import pkg from '../package.json';

const typeDefs = `
  type Query {
    # Returns the current version of GrAMPS.
    grampsVersion: String!
  }

  schema {
    query: Query
  }
`;

const resolvers = {
  Query: {
    grampsVersion: /* istanbul ignore next */ () => pkg.version,
  },
};

export default { typeDefs, resolvers };
