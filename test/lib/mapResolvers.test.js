import { GraphQLScalarType } from 'graphql';
import mapResolvers from '../../src/lib/mapResolvers';

describe('lib/mapResolvers', () => {
  it('namespaces context for resolvers', () => {
    const NAMESPACE = 'TEST_NAMESPACE';
    const mapped = mapResolvers(NAMESPACE, {
      Query: {
        hello: (root, args, model) => model,
      },
    });
    const rand = Math.random();
    const result = mapped.Query.hello('', '', { [NAMESPACE]: rand });
    expect(result).toEqual(rand);
  });

  it('return undefined if given non-object', () => {
    expect(mapResolvers('namespace', undefined)).toEqual(undefined);
  });

  it('throws error for non-function resolvers', () => {
    expect(() => {
      mapResolvers('namespace', {
        Query: {
          hello: 'non-function resolver',
        },
      });
    }).toThrow();
  });

  it('passes scalar types through untouched', () => {
    const resolvers = {
      json: new GraphQLScalarType({
        name: 'json',
        serialize: () => 'this is fake json',
      }),
    };
    expect(mapResolvers('namespace', resolvers).json).toEqual(resolvers.json);
  });
});
