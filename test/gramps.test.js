import gramps from '../src/gramps';

describe('GrAMPS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('gramps()', () => {
    it('properly combines contexts', () => {
      const dataSources = [
        { namespace: 'Foo', model: { foo: 'test' } },
        { namespace: 'Bar', model: { bar: 'test' } },
        {
          namespace: 'Baz',
          schema: 'type User { name: String } type Query { me: User }',
          model: req => ({ baz: 'test' }),
          stitching: {
            linkTypeDefs: 'extend type User { age: Int }',
            resolvers: mergeInfo => ({
              User: {
                age: () => 40,
              },
            }),
          },
        },
      ];

      const grampsConfig = gramps({ dataSources })();

      expect(grampsConfig.context).toEqual({
        Foo: {
          foo: 'test',
        },
        Bar: {
          bar: 'test',
        },
        Baz: {
          baz: 'test',
        },
      });
    });

    it('properly adds extra context', () => {
      const grampsConfig = gramps({
        extraContext: () => ({ extra: 'test' }),
      })();

      expect(grampsConfig.context).toEqual({
        extra: 'test',
      });
    });
  });
});
