import { introspectSchema, makeRemoteExecutableSchema } from 'graphql-tools';
import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import fetch from 'node-fetch';

export default async remoteSchemaURLs => {
  const remoteSchemas = await Promise.all(
    remoteSchemaURLs.map(async remoteSchemaURL => {
      const http = new HttpLink({
        uri: remoteSchemaURL,
        fetch,
      });
      const link = setContext((request, previousContext) => {
        if (
          previousContext.graphqlContext &&
          previousContext.graphqlContext.req
        ) {
          return {
            headers: {
              Authorization: `Bearer ${
                previousContext.graphqlContext.req.user.iam_token
              }`,
            },
          };
        }
      }).concat(http);

      const schema = await introspectSchema(link);

      const executableSchema = makeRemoteExecutableSchema({
        schema,
        link,
      });
      return executableSchema;
    }),
  );

  return remoteSchemas;
};
