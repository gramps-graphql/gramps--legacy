import { introspectSchema, makeRemoteExecutableSchema } from 'graphql-tools';
import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import 'isomorphic-fetch';

export default async remoteSchemas => {
  const schemas = await Promise.all(
    remoteSchemas.map(async ({ url, setContextCallback = null }) => {
      const http = new HttpLink({
        uri: url,
        fetch,
      });

      let link = http;

      // If a setContextCallback is provided attach it to the link
      if (setContextCallback) {
        link = setContext(setContextCallback).concat(http);
      }

      try {
        // Get the remote schema
        const schema = await introspectSchema(link);

        const executableSchema = makeRemoteExecutableSchema({
          schema,
          link,
        });

        return executableSchema;
      } catch (error) {
        // If something goes wrong when getting the remote schema return the error and ignore this namespace
        console.error(
          `Error retrieving remote schema at: ${url}. Ignoring remote schema. Error: ${error}`,
        );

        return null;
      }
    }),
  );

  // Filter out failed remoteSchemas
  return schemas.filter(schema => schema);
};
