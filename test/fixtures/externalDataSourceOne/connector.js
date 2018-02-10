class GraphQLConnector {}

module.exports = class ExternalOneConnector extends GraphQLConnector {
  get apiBaseUri() {
    return 'https://api.example.com';
  }
};
