/**
 * @typedef {String | String[] | function():String | String[]} TypeDefs
 */

/**
 * Takes type definitions in any acceptable form and outputs an array of strings or
 * a single string.
 * @param {TypeDefs} originalTypeDefs
 * The type definitions that could be passed to graphql-tools makeExecutableSchema
 * @returns {String | String[]}
 * The string or string array of type definitions
 */
function getTypeDefs(originalTypeDefs) {
  if (typeof originalTypeDefs === 'function') {
    return getTypeDefs(originalTypeDefs());
  } else if (Array.isArray(originalTypeDefs)) {
    return originalTypeDefs.map(getTypeDefs);
  } else if (typeof originalTypeDefs === 'string') {
    return originalTypeDefs;
  }
  throw new Error(`Unexpected type in typeDefs: ${typeof originalTypeDefs}`);
}

/**
 * Takes type definitions in any acceptable form and outputs an array of strings
 * @param {TypeDefs} originalTypeDefs
 * The type definitions that could be passed to graphql-tools makeExecutableSchema
 * @returns {String[]}
 * The string array of type definitions
 */
function getTypeDefsArray(originalTypeDefs) {
  const typeDefs = getTypeDefs(originalTypeDefs);
  return typeof typeDefs === 'string' ? [typeDefs] : typeDefs;
}

const BASE_TYPES = ['Query', 'Mutation', 'String', 'Int', 'Float', 'Boolean'];

function mapTypeDefs({
  namespace,
  typeDefs,
  prefixTypesWithNamespace = false,
  namespaceQuery = false,
}) {
  const typeDefsArray = getTypeDefsArray(typeDefs);
  const resultTypeDefs = typeDefsArray.map(typeDef =>
    typeDef
      // replace definitions
      .replace(
        /(type|interface|enum|union|implements|input) (\w+)/g,
        (match, keyword, type) =>
          (!BASE_TYPES.includes(type) && prefixTypesWithNamespace) ||
          (type === 'Query' && namespaceQuery)
            ? `${keyword} ${namespace}_${type}`
            : match,
      )
      // replace return types
      .replace(
        /(\w+\s*:\s*\[?)(\w+)(\!?\]?)/g,
        (match, prefix, type, suffix) =>
          !BASE_TYPES.includes(type) && prefixTypesWithNamespace
            ? `${prefix}${namespace}_${type}${suffix}`
            : match,
      ),
  );
  if (namespaceQuery) {
    resultTypeDefs.push(`type Query { ${namespace}: ${namespace}_Query }`);
  }
  return resultTypeDefs;
}

function mapResolvers({
  namespace,
  resolvers,
  prefixTypesWithNamespace = false,
  namespaceQuery = false,
}) {
  const resultResolvers = Object.keys(resolvers).reduce(
    (typeResolvers, type) => ({
      ...typeResolvers,
      [(!BASE_TYPES.includes(type) && prefixTypesWithNamespace) ||
      (type === 'Query' && namespaceQuery)
        ? `${namespace}_${type}`
        : type]: Object.keys(
        resolvers[type],
      ).reduce((fieldResolvers, field) => {
        const resolver = resolvers[type][field];
        if (typeof resolver !== 'function') {
          throw new Error(
            `Expected Function for ${type}.${field} resolver but received ${typeof fn}`,
          );
        }
        return {
          ...fieldResolvers,
          [field]: (parent, args, context, info) =>
            resolver(parent, args, context[namespace], info),
        };
      }, {}),
    }),
    {},
  );
  if (namespaceQuery) {
    resultResolvers.Query = {
      [namespace]: root => root || {},
    };
  }
  return resultResolvers;
}

/**
 * Produces the type definitions and resolvers for the data source to be consumed by gramps.
 * @param   {Object}    options
 * @param   {String}    options.namespace
 * The namespace of the data source
 * @param   {TypeDefs}  options.typeDefs
 * The type definitions as they would be passed to graphqlTools.makeExecutableSchema
 * @param   {Object}    options.resolvers
 * The resolvers as they would be passed to graphqlTools.makeExecutableSchema
 * @param   {Boolean}   options.prefixTypesWithNamespace
 * If true, rename all types in the data source to be prefixed with the namespace
 * @param   {Boolean}   options.namespaceQuery
 * If true, rename Query to {namespace}_Query
 */
export default function mapSchema(options) {
  return {
    typeDefs: mapTypeDefs(options),
    resolvers: mapResolvers(options),
  };
}
