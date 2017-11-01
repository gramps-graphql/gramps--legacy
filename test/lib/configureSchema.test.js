import * as graphqlTools from 'graphql-tools';

import {
  combineResolvers,
  getSchema,
  addMockFunctions,
} from '../../src/lib/configureSchema';

import ExternalOne from '../fixtures/externalDataSourceOne';
import ExternalTwo from '../fixtures/externalDataSourceTwo';

describe('lib/configureSchema', () => {
  describe('combineResolvers()', () => {
    it('properly combines resolvers', () => {
      const resolvers = combineResolvers([ExternalOne, ExternalTwo]);

      expect(resolvers).toEqual({
        Query: {
          ...ExternalOne.resolvers.Query,
          ...ExternalTwo.resolvers.Query,
        },
        Mutation: {},
      });
    });

    it('properly combines resolvers with an initial value', () => {
      const initialValue = { test: () => {} };
      const resolvers = combineResolvers(
        [ExternalOne, ExternalTwo],
        initialValue,
      );

      expect(resolvers).toEqual({
        Query: {
          ...ExternalOne.resolvers.Query,
          ...ExternalTwo.resolvers.Query,
        },
        Mutation: {},
        ...initialValue,
      });
    });
  });

  describe('getSchema()', () => {
    it('correctly configures makeExecutableSchema', () => {
      const spy = jest.spyOn(graphqlTools, 'makeExecutableSchema');

      getSchema({ sources: [ExternalOne, ExternalTwo] });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          typeDefs: expect.any(Array),
          resolvers: expect.objectContaining({
            Query: expect.any(Object),
            Mutation: expect.any(Object),
          }),
        }),
      );
    });

    it('includes additional config options', () => {
      const spy = jest.spyOn(graphqlTools, 'makeExecutableSchema');

      getSchema({
        sources: [ExternalOne, ExternalTwo],
        options: { allowUndefinedInResolve: true },
      });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          typeDefs: expect.any(Array),
          resolvers: expect.objectContaining({
            Query: expect.any(Object),
            Mutation: expect.any(Object),
          }),
          allowUndefinedInResolve: true,
        }),
      );
    });
  });

  describe('addMockFunctions()', () => {
    it('correctly adds mock functions to the schema', () => {
      const spy = jest.spyOn(graphqlTools, 'addMockFunctionsToSchema');

      addMockFunctions({
        sources: [ExternalOne],
        schema: getSchema({ sources: [ExternalOne] }),
      });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          mocks: expect.any(Object),
          schema: expect.any(Object),
        }),
      );
    });

    it('includes custom config', () => {
      const spy = jest.spyOn(graphqlTools, 'addMockFunctionsToSchema');

      addMockFunctions({
        sources: [ExternalOne],
        schema: getSchema({ sources: [ExternalOne] }),
        options: { preserveResolvers: true },
      });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          mocks: expect.any(Object),
          schema: expect.any(Object),
          preserveResolvers: true,
        }),
      );
    });
  });
});
