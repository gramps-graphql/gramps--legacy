class GraphQLConnector {}

module.exports = class ExternalTwoConnector extends GraphQLConnector {
  get apiBaseUri() {
    return 'https://api.example.com';
  }
};
