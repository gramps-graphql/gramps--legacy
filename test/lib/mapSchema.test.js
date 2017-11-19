import mapSchema from '../../src/lib/mapSchema';

describe('lib/mapSchema', () => {
  it('namespaces context for resolvers', () => {
    const namespace = 'TEST_NAMESPACE';
    const mapped = mapSchema({
      namespace,
      typeDefs: 'Query { hello: Float }',
      resolvers: {
        Query: {
          hello: (root, args, model) => model,
        },
      },
    });
    const rand = Math.random();
    const result = mapped.resolvers.Query.hello('', '', { [namespace]: rand });
    expect(result).toEqual(rand);
  });

  it('throws error for non-function resolvers', () => {
    expect(() => {
      mapSchema({
        namespace: 'namespace',
        typeDefs: '',
        resolvers: {
          Query: {
            hello: 'non-function resolver',
          },
        },
      });
    }).toThrow();
  });
});
