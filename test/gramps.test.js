import { GraphQLSchema } from 'graphql';
import * as GraphQLTools from 'graphql-tools';
import gramps, { prepare } from '../src';

describe('GrAMPS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('prepare()', () => {
    it('addContext() adds gramps property to request object', () => {
      const { addContext } = prepare();
      const next = jest.genMockFn();
      const req = {};
      addContext(req, {}, next);
      expect(req).toEqual({ gramps: {} });
      expect(next).toBeCalled();
    });

    test('passes through apolloServer options', () => {
      const gramps = prepare({
        apollo: {
          apolloServer: {
            debug: true,
          },
        },
      });

      expect(gramps.debug).toBe(true);
    });

    test('passes through apolloServer options when passed in old graphqlExpress arg', () => {
      const gramps = prepare({
        apollo: {
          graphqlExpress: {
            debug: true,
          },
        },
      });

      expect(gramps.debug).toBe(true);
    });

    test('overrides `typeDefs` and `resolvers` in Apollo options', () => {
      const spy = jest.spyOn(GraphQLTools, 'makeExecutableSchema');
      const gramps = prepare({
        apollo: {
          typeDefs: `type Query { nope: String }`,
          resolvers: { nope: () => 'nope' },
        },
      });

      expect(spy).not.toBeCalledWith(
        expect.objectContaining({
          typeDefs: `type Query { nope: String }`,
          resolvers: { nope: () => 'nope' },
        }),
      );
    });
  });

  describe('gramps()', () => {
    it('creates a valid schema and context with no arguments', () => {
      const GraphQLOptions = gramps();

      expect(GraphQLOptions).toEqual(
        expect.objectContaining({
          schema: expect.any(GraphQLSchema),
          context: expect.any(Function),
        }),
      );
    });

    it('warns for use of schema', () => {
      console.warn = jest.genMockFn();
      const dataSources = [
        {
          namespace: 'Baz',
          schema: 'type User { name: String } type Query { me: User }',
          context: req => ({ getUser: () => ({ name: 'Test user' }) }),
          resolvers: { Query: { me: (_, __, context) => context.getUser() } },
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

      gramps({ dataSources });

      return expect(console.warn).toBeCalled();
    });

    it('properly combines contexts', () => {
      const dataSources = [
        { namespace: 'Foo', context: { foo: 'test' } },
        { namespace: 'Bar', context: { bar: 'test' } },
        {
          namespace: 'Baz',
          typeDefs: 'type User { name: String } type Query { me: User }',
          context: req => ({ baz: 'test' }),
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

      const grampsConfig = gramps({ dataSources, enableMockData: false });

      expect(grampsConfig.context()).toEqual({
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
        dataSources: [{ namespace: 'FOO', context: { source: 'context' } }],
        extraContext: () => ({ extra: 'context' }),
      });

      expect(grampsConfig.context()).toEqual({
        FOO: { extra: 'context', source: 'context' },
        extra: 'context',
      });
    });

    it('adds mock resolvers when the flag is set', () => {
      jest.clearAllMocks();
      const spy = jest.spyOn(GraphQLTools, 'addMockFunctionsToSchema');

      gramps({
        dataSources: [
          {
            namespace: 'Foo',
            typeDefs: 'type Query { test: Test } type Test { foo: String }',
            context: { foo: 'test' },
            mocks: { Test: () => ({ foo: 'bar' }) },
          },
        ],
        enableMockData: true,
      });

      // The first call is the GrAMPS root data source, which has no mocks.
      expect(spy.mock.calls[1][0].mocks).toEqual({
        Test: expect.any(Function),
      });
    });
  });
});
