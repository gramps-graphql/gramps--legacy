const fs = require('fs');
const path = require('path');
const resolvers = require('./resolvers');
const mocks = require('./mocks');
const Connector = require('./connector');
const Model = require('./model');

const schema = fs
  .readFileSync(path.resolve(__dirname, './schema.graphql'))
  .toString();

module.exports = {
  namespace: 'ExternalOne',
  schema,
  resolvers,
  mocks,
  model: new Model({ connector: new Connector() }),
};
