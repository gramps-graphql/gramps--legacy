import schema from './schema.graphql';
import resolvers from './resolvers';
import mocks from './mocks';
import Connector from './connector';
import Model from './model';

export default {
  namespace: 'ExternalTwo',
  schema,
  resolvers,
  mocks,
  model: new Model({ connector: new Connector() }),
};
