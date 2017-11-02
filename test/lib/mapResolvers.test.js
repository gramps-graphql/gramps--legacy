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
});
