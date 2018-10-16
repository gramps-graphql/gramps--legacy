import { GraphQLUpload } from 'graphql-upload/lib/GraphQLUpload';
import pkg from '../package.json';

const typeDefs = `
  scalar Upload

  type Query {
    # Returns the current version of GrAMPS.
    grampsVersion: String!
  }

  schema {
    query: Query
  }
`;

const resolvers = {
  Upload: GraphQLUpload,

  Query: {
    grampsVersion: /* istanbul ignore next */ () => pkg.version,
  },
};

export default { typeDefs, resolvers };
