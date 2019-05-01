import { GraphQLSchema } from 'graphql';
import * as GraphQLTools from 'graphql-tools';
import gql from 'graphql-tag';
import fetchMock from 'fetch-mock';
import gramps, { prepare } from '../src';

import remoteIntrospectionSchema from './fixtures/remoteIntrospectionSchema';

describe('GrAMPS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('prepare()', () => {
    it('addContext() adds gramps property to request object', async () => {
      const { addContext } = await prepare();
      const next = jest.genMockFn();
      const req = {};
      addContext(req, {}, next);
      expect(req).toEqual({ gramps: {} });
      expect(next).toBeCalled();
    });

    test('passes through apolloServer options', async () => {
      const gramps = await prepare({
        apollo: {
          apolloServer: {
            debug: true,
          },
        },
      });

      expect(gramps.debug).toBe(true);
    });

    test('passes through apolloServer options when passed in old graphqlExpress arg', async () => {
      const gramps = await prepare({
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
    it('creates a valid schema and context with no arguments', async () => {
      const GraphQLOptions = await gramps();

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

    it('properly combines contexts', async () => {
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

      const grampsConfig = await gramps({ dataSources, enableMockData: false });

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

    it('properly adds extra context', async () => {
      const grampsConfig = await gramps({
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

    it('properly fetches remoteSchemas', async () => {
      fetchMock.mock(
        'http://coolremotegraphqlserver.com/graphql',
        remoteIntrospectionSchema,
      );

      const grampsConfig = await gramps({
        dataSources: [
          {
            namespace: 'REMOTE_FOO',
            remoteSchema: { url: 'http://coolremotegraphqlserver.com/graphql' },
          },
        ],
      });

      fetchMock.restore();

      expect(grampsConfig).toEqual(
        expect.objectContaining({
          schema: expect.any(GraphQLSchema),
        }),
      );
    });
  });
});
