import combineStitchingResolvers from '../../src/lib/combineStitchingResolvers';

describe('lib/combineStitchingResolvers', () => {
  it('properly combines resolvers', () => {
    const input = [
      mergeInfo => ({
        User: {
          name: mergeInfo,
        },
      }),
      mergeInfo => ({
        User: {
          age: mergeInfo,
        },
      }),
    ].map(resolvers => ({ stitching: { resolvers } }));
    const output = {
      User: {
        name: 'TEST',
        age: 'TEST',
      },
    };
    expect(combineStitchingResolvers(input)('TEST')).toEqual(output);
  });
});
