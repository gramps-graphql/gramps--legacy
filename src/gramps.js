import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
  mergeSchemas,
} from 'graphql-tools';
import {
  loadDevDataSources,
  overrideLocalSources,
} from './lib/externalDataSources';

import rootSource from './rootSource';

/**
 * Adds supplied options to the Apollo options object.
 * @param  {Object} options  Apollo options for the methods used in GrAMPS
 * @return {Object}          Default options, extended with supplied options
 */
const getDefaultApolloOptions = options => ({
  makeExecutableSchema: {},
  addMockFunctionsToSchema: {},
  ...options,
});

/**
 * Combine schemas, optionally add mocks, and configure `apollo-server-express`.
 *
 * This is the core of GrAMPS, and does a lot. It accepts an array of data
 * sources and combines them into a single schema, resolver set, and context
 * using `graphql-tools` `makeExecutableSchema`. If the `enableMockData` flag is
 * set, mock resolvers are added to the schemausing `graphql-tools`
 * `addMockFunctionsToSchema()`. Finally, `apollo-server-express`
 * `graphqlExpress()` is called.
 *
 * Additional options for any of the Apollo functions can be passed in the
 * `apollo` argument using the function’s name as the key:
 *
 *     {
 *       apollo: {
 *         addMockFunctionsToSchema: {
 *           preserveResolvers: true,
 *         },
 *       },
 *     }
 *
 * @see http://dev.apollodata.com/tools/graphql-tools/mocking.html#addMockFunctionsToSchema
 * @see http://dev.apollodata.com/tools/graphql-tools/generate-schema.html#makeExecutableSchema
 *
 * @param  {Array?}    config.dataSources     data sources to combine
 * @param  {boolean?}  config.enableMockData  whether to add mock resolvers
 * @param  {Function?} config.extraContext    function to add additional context
 * @param  {Object?}   config.logger          requires `info` & `error` methods
 * @param  {Object?}   config.apollo          options for Apollo functions
 * @return {Object}                           result of `graphqlExpress()`
 */
export default function gramps(
  {
    dataSources = [],
    enableMockData = process.env.GRAMPS_MODE !== 'live',
    req = {},
    extraContext = req => ({}), // eslint-disable-line no-unused-vars
    logger = console,
    apollo = {},
  } = {},
) {
  // Make sure all Apollo options are set properly to avoid undefined errors.
  const apolloOptions = getDefaultApolloOptions(apollo);

  const devSources = loadDevDataSources({ logger });
  const sources = overrideLocalSources({
    sources: dataSources,
    devSources,
    logger,
  });

  const allSources = [rootSource, ...sources];
  const schemas = allSources.map(({ schema: typeDefs, resolvers, mocks }) => {
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
      ...apolloOptions.makeExecutableSchema,
    });
    if (enableMockData) {
      addMockFunctionsToSchema({
        schema,
        mocks,
        ...apolloOptions.addMockFunctionsToSchema,
      });
    }
    return schema;
  });

  const schema = mergeSchemas({ schemas });

  const context = sources.reduce(
    (models, source) => ({
      ...models,
      [source.namespace]: source.model,
    }),
    extraContext(req),
  );

  return {
    schema,
    context,
    // formatError: formatError(logger),
    ...apolloOptions.graphqlExpress,
  };
}
