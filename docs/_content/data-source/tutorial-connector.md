---
title: "Tutorial: Connector"
weight: 20
---

Now that we’ve [set up the data source]({{ site.github.url }}/data-source/tutorial-setup), we can start building the data source itself. In this section, we’ll tell the data source where data should come from.

> **NOTE:** This example accesses data from a REST API, but the data could also
> come from a database or, really, anywhere that can give a response we can 
> convert to JSON.

## Table of Contents
{:.no_toc}

-   [Initial Data Source Setup]({{ site.github.url }}/data-source/tutorial-setup)
-   **> [Create a Connector]({{ site.github.url }}/data-source/tutorial-connector)**
-   [Create a Model]({{ site.github.url }}/data-source/tutorial-model)
-   [Write a GraphQL Schema]({{ site.github.url }}/data-source/tutorial-schema)
-   [Write Resolvers]({{ site.github.url }}/data-source/tutorial-resolvers)
-   [Use Development Modes]({{ site.github.url }}/data-source/tutorial-dev)

## In This Section
{:.no_toc}

- 
{:toc}

## Create Your Connector

The first code change we need to make is to update the Connector to point to the API we want to use. This class sets up the requests themselves, plus helpers to enable caching.

In `src/connector.js`, make the following change:

```diff
  import { GraphQLConnector } from '@gramps/gramps-express';

- // TODO: change `YourDataSourceConnector` to a descriptive name
- export default class YourDataSourceConnector extends GraphQLConnector {
+ export default class IMDBAPIConnector extends GraphQLConnector {
    /**
-    * TODO: describe this API endpoint
+    * API for looking up movie info
     * @member {string}
     */
-   apiBaseUri = `https://example.org/v2`;
+   apiBaseUri = `https://www.theimdbapi.org/api`;
  }
```

> **NOTE:** The `GraphQLConnector` class sets up a lot of core functionality in
> the background, including methods for sending queries and mutations, plus 
> helpers for caching data. For more information on what’s happening behind the 
> scenes, see [the source code](https://git.io/vdQzQ).

## Write Tests for the Connector

Next, update the tests for the connector by making the changes below in `test/connector.test.js`:

```diff
  import { GraphQLConnector } from '@gramps/gramps-express';
  import Connector from '../src/connector';
  
- // TODO: Update the data source name.
- const DATA_SOURCE_NAME = 'YourDataSource';
+ const DATA_SOURCE_NAME = 'IMDBAPI';
  const connector = new Connector();
  
  describe(`${DATA_SOURCE_NAME}Connector`, () => {
    it('inherits the GraphQLConnector class', () => {
      expect(connector).toBeInstanceOf(GraphQLConnector);
    });
  
    it('uses the appropriate URL', () => {
-     // TODO: Update the data source API endpoint.
-     expect(connector.apiBaseUri).toBe(`https://example.org/v2`);
+     expect(connector.apiBaseUri).toBe(`https://www.theimdbapi.org/api`);
    });
  });
```

Verify that this works by running `yarn test`. Everything should pass:

```
@jlengstorf: ~/dev/gramps-graphql/data-source-imdbapi  (master)
$ yarn test
yarn run v1.2.1
$ npm run lint --silent && npm run test:unit --silent
 PASS  test/resolvers.test.js
 PASS  test/connector.test.js
 PASS  test/model.test.js
 PASS  test/index.test.js

Test Suites: 4 passed, 4 total
Tests:       16 passed, 16 total
Snapshots:   0 total
Time:        1.839s
Ran all test suites.
--------------|----------|----------|----------|----------|----------------|
File          |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
--------------|----------|----------|----------|----------|----------------|
All files     |      100 |      100 |      100 |      100 |                |
 connector.js |      100 |      100 |      100 |      100 |                |
 index.js     |      100 |      100 |      100 |      100 |                |
 model.js     |      100 |      100 |      100 |      100 |                |
 resolvers.js |      100 |      100 |      100 |      100 |                |
--------------|----------|----------|----------|----------|----------------|
✨  Done in 4.83s.
```

## Next Up: Create a Model
{:.no_toc}

Hey! That wasn’t bad, right? In the next section, we’ll show our data source how to access data by defining data access methods in the model.

{% include button.html
    href="/data-source/tutorial-model" 
    text="Create a GrAMPS Data Source Model &rarr;"
%}
