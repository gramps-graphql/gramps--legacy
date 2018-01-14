import { GraphQLSchema } from 'graphql';
import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
  mergeSchemas,
} from 'graphql-tools';
import {
  loadDevDataSources,
  overrideLocalSources,
} from './lib/externalDataSources';
import mapResolvers from './lib/mapResolvers';

import rootSource from './rootSource';
import combineStitchingResolvers from './lib/combineStitchingResolvers';

/**
 * Adds supplied options to the Apollo options object.
 * @param  {Object} options  Apollo options for the methods used in GrAMPS
 * @return {Object}          Default options, extended with supplied options
 */
const getDefaultApolloOptions = options => ({
  makeExecutableSchema: {},
  addMockFunctionsToSchema: {},
  apolloServer: { ...options.graphqlExpress },
  ...options,
});

const checkTypeDefs = ({ schema, typeDefs, namespace }) => {
  if (typeof schema === 'string') {
    console.warn(
      namespace,
      'Type definitions must be exported as "typeDefs".',
      'Use of "schema" has been deprecated and will be removed in a future release',
    );
  }
  return typeDefs || schema;
};

/**
 * Maps data sources and returns array of executable schema
 * @param  {Array}   sources     data sources to combine
 * @param  {Boolean} shouldMock  whether or not to mock resolvers
 * @param  {Object}  options     additional apollo options
 * @return {Array}               list of executable schemas
 */
const mapSourcesToExecutableSchemas = (sources, shouldMock, options) =>
  sources
    .map(({ schema, typeDefs, resolvers, mocks, namespace }) => {
      const sourceTypeDefs = checkTypeDefs({ schema, typeDefs, namespace });

      if (!sourceTypeDefs) {
        return null;
      }

      const executableSchema = makeExecutableSchema({
        ...options.makeExecutableSchema,
        typeDefs: sourceTypeDefs,
        resolvers: mapResolvers(namespace, resolvers),
      });

      if (shouldMock) {
        addMockFunctionsToSchema({
          ...options.addMockFunctionsToSchema,
          schema: executableSchema,
          mocks,
        });
      }

      return executableSchema;
    })
    .filter(schema => schema instanceof GraphQLSchema);

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
 * @return {Function}                         req => options for `graphqlExpress()`
 */
export function prepare({
  dataSources = [],
  enableMockData = process.env.GRAMPS_MODE === 'mock',
  extraContext = req => ({}), // eslint-disable-line no-unused-vars
  logger = console,
  apollo = {},
} = {}) {
  // Make sure all Apollo options are set properly to avoid undefined errors.
  const apolloOptions = getDefaultApolloOptions(apollo);

  const devSources = loadDevDataSources({ logger });
  const sources = overrideLocalSources({
    sources: dataSources,
    devSources,
    logger,
  });

  const allSources = [rootSource, ...sources];
  const schemas = mapSourcesToExecutableSchemas(
    allSources,
    enableMockData,
    apolloOptions,
  );

  const sourcesWithStitching = sources.filter(source => source.stitching);
  const linkTypeDefs = sourcesWithStitching.map(
    source => source.stitching.linkTypeDefs,
  );
  const resolvers = combineStitchingResolvers(sourcesWithStitching);

  const schema = mergeSchemas({
    schemas: [...schemas, ...linkTypeDefs],
    resolvers,
  });

  const getContext = req => {
    const extra = extraContext(req);
    return sources.reduce((allContext, source) => {
      const sourceContext =
        typeof source.context === 'function'
          ? source.context(req)
          : source.context;

      return {
        ...allContext,
        [source.namespace]: { ...extra, ...sourceContext },
      };
    }, extra);
  };

  return {
    schema,
    context: getContext,
    addContext: (req, res, next) => {
      req.gramps = getContext(req);
      next();
    },
    // formatError: formatError(logger),
    ...apolloOptions.apolloServer,
  };
}

export default function gramps(...args) {
  const options = prepare(...args);
  return req => ({
    ...options,
    context: options.context(req),
  });
}
