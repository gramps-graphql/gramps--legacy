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
  ...options,
});

/**
* Maps data sources and returns array of executable schema
* @param  {Array}   sources  data sources to combine
* @param  {Boolean} mock     whether or not to mock resolvers
* @param  {Object}  options  additional apollo options
* @return {Array}            list of executable schemas
*/
const mapSourcesToExecutableSchemas = (sources, mock, options) =>
  sources
    .map(({ schema: typeDefs, resolvers, mocks, namespace }) => {
      if (!typeDefs) {
        return null;
      }
      const schema = makeExecutableSchema({
        typeDefs,
        resolvers: mapResolvers(namespace, resolvers),
        ...options.makeExecutableSchema,
      });
      if (mock) {
        addMockFunctionsToSchema({
          schema,
          mocks,
          ...options.addMockFunctionsToSchema,
        });
      }
      return schema;
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
export default function gramps(
  {
    dataSources = [],
    enableMockData = process.env.GRAMPS_MODE !== 'live',
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

  const getContext = req =>
    sources.reduce((models, source) => {
      const model =
        typeof source.model === 'function' ? source.model(req) : source.model;
      return {
        ...models,
        [source.namespace]: model,
      };
    }, extraContext(req));

  return req => ({
    schema,
    context: getContext(req),
    // formatError: formatError(logger),
    ...apolloOptions.graphqlExpress,
  });
}
