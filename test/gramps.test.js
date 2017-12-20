import { GraphQLSchema } from 'graphql';
import * as GraphQLTools from 'graphql-tools';
import gramps from '../src';

describe('GrAMPS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('gramps()', () => {
    it('creates a valid schema and empty context with no arguments', () => {
      const getGrampsContext = gramps();

      expect(getGrampsContext()).toEqual(
        expect.objectContaining({
          schema: expect.any(GraphQLSchema),
          context: {},
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

      const grampsConfig = gramps({ dataSources, enableMockData: false })();

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
        dataSources: [{ namespace: 'FOO', context: { source: 'context' } }],
        extraContext: () => ({ extra: 'context' }),
      })();

      expect(grampsConfig.context).toEqual({
        FOO: { extra: 'context', source: 'context' },
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
      })();

      // The first call is the GrAMPS root data source, which has no mocks.
      expect(spy.mock.calls[1][0].mocks).toEqual({
        Test: expect.any(Function),
      });
    });
  });
});
