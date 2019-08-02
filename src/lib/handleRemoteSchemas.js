import {
  introspectSchema,
  makeRemoteExecutableSchema,
  RenameTypes,
  RenameRootFields,
  transformSchema,
} from 'graphql-tools';
import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import 'isomorphic-fetch';

export default async remoteSchemas => {
  const schemas = await Promise.all(
    remoteSchemas.map(async ({ namespace, remoteSchema }) => {
      const { url, setContextCallback = null, prefix } = remoteSchema;

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

        // If a prefix was provided rename the schema to include it
        if (prefix) {
          // Transforms the first letter of a string to uppercase, used in RenameRootFields
          const capitalizeFirstLetter = string => {
            const characters = string.split('');
            characters[0] = characters[0].toUpperCase();
            return characters.join('');
          };

          const renamedSchema = transformSchema(executableSchema, [
            new RenameTypes(type => `${prefix}_${type}`),
            new RenameRootFields(
              (operation, name) => `${namespace}${capitalizeFirstLetter(name)}`,
            ),
          ]);

          return renamedSchema;
        }

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
