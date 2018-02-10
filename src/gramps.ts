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

import { Request, Response, NextFunction } from 'express';
import IDataSource from './lib/IDataSource';
import ILogger from './lib/ILogger';

/**
 * Adds supplied options to the Apollo options object.
 * @param  {Object} options  Apollo options for the methods used in GrAMPS
 * @return {Options}          Default options, extended with supplied options
 */
const getDefaultApolloOptions = (options: any) => ({
  makeExecutableSchema: {},
  addMockFunctionsToSchema: {},
  apolloServer: { ...options.graphqlExpress },
  ...options,
});

interface ICheckTypyDefsOptions {
  schema?: string;
  typeDefs: any;
  namespace: string;
}

const checkTypeDefs = ({
  schema,
  typeDefs,
  namespace,
}: ICheckTypyDefsOptions) => {
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
 * @param sources     data sources to combine
 * @param shouldMock  whether or not to mock resolvers
 * @param options     additional apollo options
 * @return {Array}               list of executable schemas
 */
const mapSourcesToExecutableSchemas = (
  sources: IDataSource[],
  shouldMock: boolean,
  options: any,
) =>
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

export interface IGrampsInputOptions {
  dataSources?: IDataSource[];
  enableMockData?: boolean;
  extraContext?: (req: Request) => any;
  logger?: ILogger;
  apollo?: any;
}

export interface IGrampsRequest extends Request {
  gramps: {
    getContext: (req: Request) => any;
  };
}

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
 * @param  config.dataSources     data sources to combine
 * @param  config.enableMockData  whether to add mock resolvers
 * @param  config.extraContext    function to add additional context
 * @param  config.logger          requires `info` & `error` methods
 * @param  config.apollo          options for Apollo functions
 */
export function prepare({
  dataSources = [],
  enableMockData = process.env.GRAMPS_MODE === 'mock',
  extraContext = (req: Request) => ({}), // eslint-disable-line no-unused-vars
  logger = console,
  apollo = {},
}: IGrampsInputOptions = {}) {
  // Make sure all Apollo options are set properly to avoid undefined errors.
  const apolloOptions = getDefaultApolloOptions(apollo);

  const devSources = loadDevDataSources({ logger });
  const sources = overrideLocalSources({
    sources: dataSources,
    devSources,
    logger,
  });

  const allSources: IDataSource[] = [rootSource, ...sources];
  const schemas = mapSourcesToExecutableSchemas(
    allSources,
    enableMockData,
    apolloOptions,
  );

  const sourcesWithStitching = sources.filter(source => source.stitching);
  const linkTypeDefs = sourcesWithStitching.map(
    source => source.stitching && source.stitching.linkTypeDefs,
  );
  const resolvers = combineStitchingResolvers(sourcesWithStitching);

  const schema = mergeSchemas({
    schemas: [...schemas, ...linkTypeDefs],
    resolvers,
  });

  const getContext = (req: Request) => {
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
    addContext: (req: IGrampsRequest, res: Response, next: NextFunction) => {
      req.gramps = getContext(req);
      next();
    },
    // formatError: formatError(logger),
    ...apolloOptions.apolloServer,
  };
}

export default function gramps(...args: any[]) {
  const options = prepare(...args);
  return (req?: IGrampsRequest) => ({
    ...options,
    context: options.context(req),
  });
}
