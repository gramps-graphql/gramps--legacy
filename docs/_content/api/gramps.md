---
title: "@gramps/gramps"
---

The `@gramps/gramps` package exports two functions that allow [GrAMPS data sources](https://gramps.js.org/data-source/schema-stitching/) to be combined. 

Under the hood, this is done by merging all the of data sources, applying schema stitching as needed, merging context objects, and a few other checks and chores to make it easy for developers to quickly build GraphQL servers from separate data sources.

See the API docs below for the all available options, expected return values, and usage examples.

- 
{:toc}

## `gramps(options)`
{:#gramps}

The main function exported by the GrAMPS package, this generates `GraphQLOptions` as a function that’s [consumable by `apollo-server`](https://www.apollographql.com/docs/apollo-server/setup.html#options-function).

#### Parameters
{:.no_toc#gramps-parameters}

The `gramps` function accepts an `options` object which has the following properties:

-   **`options.dataSources`**
    
    _Default: `[]`_
    
    An array of [GrAMPS data sources](https://gramps.js.org/data-source/data-source-overview/) to be combined.

-   **`options.enableMockData`**
    
    _Default: `process.env.GRAMPS_MODE === 'mock'`_

    A boolean value determining whether or not mock resolvers should be added to the schema.

-   **`options.extraContext`**
    
    _Default: `req => ({})`_

    An optional function that returns additional context to be passed to the resolvers. Must return an object.

-   **`options.logger`**
    
    _Default: `console`_

    An optional logger tool. Must expose `warn` and `error` methods.

-   **`options.apollo`**
    
    _Default: `{}`_

    Under the hood, GrAMPS executes the `makeExecutableSchema` ([docs](https://www.apollographql.com/docs/graphql-tools/generate-schema.html#makeExecutableSchema)) and `addMockFunctionsToSchema` ([docs](https://www.apollographql.com/docs/graphql-tools/mocking.html#addMockFunctionsToSchema)) functions from `graphql-tools`. It also returns a configuration object for an Apollo server ([docs](https://www.apollographql.com/docs/apollo-server/setup.html#graphqlOptions)). Use this option to pass additional configuration options to these function calls.

    For example, to set `allowUndefinedInResolve` to `false` for debugging, set the option like this:

    ```js
    const GraphQLOptions = gramps({
      dataSources: [/* ... */],
      apollo: {
        makeExecutableSchema: {
          allowUndefinedInResolve: false,
        },
      },
    });
    ```

    **NOTE:** The `typeDefs` and `resolvers` arguments to `makeExecutableSchema` are set by GrAMPS, so any values set for them in the `apollo` options will be overridden.

#### Return Value
{:.no_toc#gramps-return}

A function that accepts the request and returns a `GraphQLOptions` object. See [the apollo-server docs](https://www.apollographql.com/docs/apollo-server/setup.html#options-function) for more information.

#### Example of Usage
{:#gramps-example}

A simple example:

```js
import gramps from '@gramps/gramps';
import XKCD from '@gramps/data-source-xkcd';

const GraphQLOptions = gramps({ dataSources: [XKCD] });
// => `GraphQLOptions` is valid config for any flavor of apollo-server
```

A complete example:

```js
import gramps from '@gramps/gramps';
import XKCD from '@gramps/data-source-xkcd';
import getPino from 'pino';

const pino = getPino({ prettyPrint: true });
pino.log = pino.info; // logger must expose a `log` method

const GraphQLOptions = gramps({
  dataSources: [XKCD],
  enableMockData: true,
  extraContext: req => ({
    token: req.users.token,
  }),
  logger: pino,
  apollo: {
    addMockFunctionsToSchema: {
      preserveResolvers: false,
    },
    makeExecutableSchema: {
      logger: pino,
      allowUndefinedInResolve: false,
    },
    apolloServer: {
      debug: true,
    },
  }
});
```

## `prepare(options)`
{:#prepare}

In some use cases, it’s better to get [`GraphQLOptions`](https://www.apollographql.com/docs/apollo-server/setup.html#options-function) as an object instead of a function (for example, if you’re planning to do [schema stitching](https://gramps.js.org/data-source/schema-stitching/) between your data sources).

In those use cases, you can use the `prepare` function, which is a named export from `@gramps/gramps`.

#### Parameters
{:.no_toc#prepare-parameters}

The `prepare` function accepts an `options` object that is identical to the `gramps()` function’s.

#### Return Value
{:.no_toc#prepare-return}

Returns a `GraphQLOptions` object that can be passed directly to any Apollo server.

Additionally, it exposes an `addContext` method that follows the middleware pattern of `(req, res, next) => {}` to allow execution of the `extraContext` function.

#### Example of Usage
{:#prepare-example}

```js
import Express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { mergeSchemas } from 'graphql-tools';
import { prepare } from '@gramps/gramps';
import XKCD from '@gramps/data-source-xkcd';
import Numbers from '@gramps/data-source-numbers';

const gramps = prepare({
  dataSources: [XKCD, Numbers],
  extraContext: req => ({ req }), // adds the request to the context
});

// Add a field that pulls number trivia for the given XKCD comic’s number
const linkTypeDefs = `
  extend type XKCD_Comic {
    numbers: Numbers_Trivia
  }
`;

// Add a resolver to make the above field actually work
const schema = mergeSchemas({
  schemas: [gramps.schema, linkTypeDefs], // use `gramps.schema` for merging
  resolvers: mergeInfo => ({
    XKCD_Comic: {
      numbers: {
        fragment: `fragment XKCDFragment on XKCD_Comic { num }`,
        resolve: (parent, args, context, info) => {
          return mergeInfo.delegate(
            'query',
            'trivia',
            { number: parent.num },
            context,
            info
          );
        }
      }
    }
  })
});

const app = new Express();

app.use('/graphql',
  bodyParser.json(),
  gramps.addContext,         // Add the extra context
  graphqlExpress({
    schema,                  // Use the merged schema...
    context: gramps.context, // ...and the GrAMPS context object
  }),
);

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

app.listen(8080);
```
