---
title: Schema Stitching in GrAMPS
---

One of the most powerful ways to use GraphQL is to combine two distinct GraphQL schemas, allowing us to create aggregate queries that can load data from multiple back-ends. This is called [schema stitching](https://www.apollographql.com/docs/graphql-tools/schema-stitching.html).

In this tutorial, we'll learn how easy it is to stitch together two GrAMPS data sources.

## Part 1: Create a Data Source

To get started, let's create our first data source using the GraphQL CLI

```bash
# Use npx to run the command without having to install anything globally
npx graphql-cli create -b gramps-graphql/data-source-base data-source-stitchingtest

# Move into the folder that was just created
cd $_
```

In `src/index.js`, we can declare the entire data source for the sake of simplicity:

```js
const getContext = (_, __, ctx) => Object.keys(ctx);

export default {
  namespace: 'StitchingTest',
  typeDefs: `
    type Query {
      getContext: [String]
      getById(id: ID!): STX_Test
    }
    type STX_Test {
      id: ID
      value: String
    }
  `,
  context: {
    getValue: id => ({
      id,
      value: `from StitchingTest with ID “${id}”`,
    }),
  },
  resolvers: {
    Query: {
      getContext,
      getById: (_, { id }, ctx) => ctx.getValue(id),
    },
  },
};
```

This data source exposes two queries:

- `getContext` — returns an array of object keys that are present in the data source’s `context` object
- `getById` — exposes `id` and `value` fields

Let's test this out by running the data source:

```bash
yarn dev
```

At <http://localhost:8080/playground>, run the following query:

```gql
{
  getContext
  getById(id: 3) {
    value
  }
}
```

We should see the following return value:

```json
{
  "data": {
    "getContext": [
      "getValue"
    ],
    "getById": {
      "value": "from StitchingTest with ID “3”"
    }
  }
}
```

So far so good.

## Add Local Schema Stitching

Next, let's add some schema stitching to the existing data source, just to make sure it's working the way we expected.

In `src/index.js`, add a `stitching` property with the following definitions:

```js
export default {
  namespace: 'StitchingTest',
  typeDefs: `...`,
  context: { /* ... */ },
  resolvers: { /* ... */ },
  stitching: {
    linkTypeDefs: `
      extend type Query {
        getStitchingContext: [String]
      }
    `,
    resolvers: () => ({
      Query: {
        getStitchingContext: getContext,
      },
    }),
  },
};
```

Restart the data source in your terminal (`ctrl` + `C` to stop, `yarn dev` to start), head to <http://localhost:8080/playground>, and run the following query:

```diff
  {
    getContext
+   getStitchingContext
    getById(id: 3) {
      value
    }
  }
```

We should see the following return value:

```json
{
  "data": {
    "getContext": [
      "getValue"
    ],
    "getStitchingContext": [
      "StitchingTest"
    ],
    "getById": {
      "value": "from StitchingTest with ID “3”"
    }
  }
}
```

> **NOTE:** Notice that the contexts are different in `getStitchingContext`. This happens because each data source scopes its context to its own namespace to prevent accidentally relying on another data source's context. However, schema stitching _does_ rely on multiple data source's contexts, so we include _all_ of the data sources' contexts.

## Add a Second Data Source

Next, let's create a second data source so we can set up more realistic schema stitching.

In your terminal, move into the same directory where your first data source was created, then run the following to create a second data source:

```bash
# Use npx to run the command without having to install anything globally
npx graphql-cli create -b gramps-graphql/data-source-base data-source-stitchingtwo

# Move into the folder that was just created
cd $_
```

In `src/index.js`, create the second data source all in one place:

```js
export default {
  namespace: 'StitchingTwo',
  typeDefs: `
    type Query {
      getSomeValues(val: ID): ST2_Values
    }
    type ST2_Values {
      foo: String
      bar: String
      bat: String
    }
  `,
  context: {
    getSomeValues: val => ({
      foo: `Schema (val: ${val})`,
      bar: `Stitching (val: ${val})`,
      bat: `Rules (val: ${val})`,
    }),
  },
  resolvers: {
    Query: {
      getSomeValues: (_, { val }, ctx) => ctx.getSomeValues(val),
    },
  },
};
```

This data source is pretty bare bones: it has a single query — `getSomeValues` — that exposes three fields that have text and echo the `val` the query was called with.

To test it, let's fire up the new data source along with the original data source:

```bash
yarn dev --data-source ../data-source-stitchingtest
```

> **NOTE:** `yarn dev` is shorthand for `gramps dev --data-source .`, so what we're doing here is effectively running `gramps dev --data-source . --data-source ../data-source-stitchingtest`

Open <http://localhost:8080/playground> and update the query to call `getSomeValues`:

```diff
  {
    getContext
    getStitchingContext
    getById(id: 3) {
      value
    }
+   getSomeValues(val: 2) {
+     foo
+     bar
+     bat
+   }
  }
```

The output should be:

```json
{
  "data": {
    "getContext": [
      "getValue"
    ],
    "getStitchingContext": [
      "StitchingTwo",
      "StitchingTest"
    ],
    "getById": {
      "value": "from StitchingTest with ID “3”"
    },
    "getSomeValues": {
      "foo": "Schema (val: 2)",
      "bar": "Stitching (val: 2)",
      "bat": "Rules (val: 2)"
    }
  }
}
```

## Use Schema Stitching to Combine the Two Data Sources

Finally, let's add `stitching` config to tie the two data source together. In the second data source, add the following:

```js
export default {
  namespace: 'StitchingTwo',
  typeDefs: `...`,
  context: { /* ... */ },
  resolvers: { /* ... */ },
  stitching: {
    linkTypeDefs: `
      extend type STX_Test {
        stitched: ST2_Values
      }
    `,
    resolvers: mergeInfo => ({
      STX_Test: {
        stitched: {
          fragment: 'fragment StitchingTestField on STX_Test { id }',
          resolve: ({ id }, args, context, info) =>
            mergeInfo.delegate(
              'query',
              'getSomeValues',
              { val: id },
              context,
              info,
            ),
        },
      },
    }),
  },
};
```

First, we use `linkTypeDefs` to extend the `STX_Test` type by adding a new field called `stitched`.

Then, in `resolvers`, we set up `stitched` — which is a field on our first data source, remember — to get its value from the `getSomeValues` query, which is in the second data source.

Under the hood, this is done using [`mergeSchemas`](https://www.apollographql.com/docs/graphql-tools/schema-stitching.html#mergeSchemas). Be sure to check that out for additional information about how schema stitching happens, and some of the different ways you can work with it.

With the stitching config in place, let's fire it up and test it.

Run the following command to start a gateway with both data sources:

```bash
yarn dev --data-source ../data-source-stitchingtest
```

Then, open <http://localhost:8080/playground> and add the `stitching` field to the query:

```diff
  {
    getContext
    getStitchingContext
    getById(id: 3) {
      value
+     stitched {
+       foo
+       bar
+       bat
+     }
    }
    getSomeValues(val: 2) {
      foo
      bar
      bat
    }
  }
```

Once executed, we'll see the following:

```json
{
  "data": {
    "getContext": [
      "getValue"
    ],
    "getStitchingContext": [
      "StitchingTwo",
      "StitchingTest"
    ],
    "getById": {
      "value": "from StitchingTest with ID “3”",
      "stitched": {
        "foo": "Schema (val: 3)",
        "bar": "Stitching (val: 3)",
        "bat": "Rules (val: 3)"
      }
    },
    "getSomeValues": {
      "foo": "Schema (val: 2)",
      "bar": "Stitching (val: 2)",
      "bat": "Rules (val: 2)"
    }
  }
}
```

And that's it! We now have one data source including data from a second data source as part of its own queries.
