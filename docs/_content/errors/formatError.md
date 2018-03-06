---
title: Format GraphQL Errors With Helpful Data
---

Figuring out where errors are coming from — and what to do about them — can be tricky in GraphQL. It’s especially tricky when something goes wrong on the client side to figure out exactly where it went wrong on the server.

To improve the error handling process, GrAMPS offers a `formatError` function that can be passed in the [`GraphQLOptions` object](https://www.apollographql.com/docs/apollo-server/setup.html#graphqlOptions) for an Apollo server.

## Installation and Setup

To install:

```sh
yarn add @gramps/errors
```

To use with your Apollo server:

```js
import { formatError } from '@gramps/errors';

// If no logger is supplied, `console` will be used.
import logger from './custom-logger';

const GraphQLOptions = {
  schema: /* your GraphQL schema */,
  formatError: formatError(logger),
};

// Assumes an Express server
app.use('/graphql', graphqlExpress(GraphQLOptions));
```

## Example Production Client-Side Output

This is an example of server side errors taken from the [xkcd data source](https://github.com/gramps-graphql/data-source-xkcd):

```

```

**NOTE:** In development, the `targetEndpoint` and `docsLink` properties are passed to the client.

## Example Server-Side Output

This is an example of server side errors taken from the [xkcd data source](https://github.com/gramps-graphql/data-source-xkcd):

```
Error: Could not load the given xkcd comic (178460c1-c8d7-42c2-ba0e-f617afb5d3fd)
Description: Could not load the given xkcd comic
Error Code: XKCDModel_Error
GraphQL Model: XKCDModel
Target Endpoint: https://xkcd.com/2000/info.0.json
Documentation: https://xkcd.com/json.html
Data: {
    "id": "2000"
}
```
