---
title: "Quickstart: 5 Minutes to Glory"
weight: 1
---

GrAMPS is an easy way to set up a GraphQL gateway (server) using community-provided data sources. In the next 5 minutes, let's set up a working GraphQL gateway, then pull in live data using a GrAMPS data source.

## Table of Contents
{:.no_toc}

- 
{:toc}

## Step 1. Create a new project

**NOTE:** This example uses [`yarn`](https://yarnpkg.com/). `npm` alternatives are shown in comments.

```bash
# Make a directory and move into it.
mkdir my-gateway && cd $_

# Initialize a package.json
yarn init -y
# npm init -y
```

## Step 2. Set up the build process

Because we want to use the modern features of Node, let's create a minimal Babel configuration and add a build script.

### Install dependencies
{:.no_toc}

```bash
yarn add --dev babel-cli babel-preset-env
# npm install --save-dev babel-cli babel-preset-env
```

### Create a `.babelrc`
{:.no_toc}

In the project root, add a new file called `.babelrc` with the following configuration:

```json
{
  "presets": [["env", { "targets": { "node": "current" } }]],
  "ignore": ["node_modules/**"]
}
```

Thanks to the smarts under the hood of `babel-preset-env`, we don’t have to do much.

### Add build and dev scripts
{:.no_toc}

Once we have a server, we'll need to run our code through Babel to avoid any compatibility issues. To do that, let's add a build script to our `package.json`:

```diff
  {
    "name": "my-gateway",
    "version": "1.0.0",
-   "main": "index.js",
+   "main": "dist/index.js",
    "license": "MIT",
+   "scripts": {
+     "build": "babel index.js -d dist"
+   },
    "devDependencies": {
      "babel-cli": "^6.26.0",
      "babel-preset-env": "^1.6.1"
    }
  }
```

> **NOTE:** We also changed the `main` entry so that the default start functionality from Node will point to the built server.

## Step 3. Set up a server

Now that we’ve got a project to work in, let’s set up a simple Express server.

### Add dependencies
{:.no_toc}

```bash
# Install server dependencies.
yarn add express get-port
# npm install --save express get-port
```

### Create the server
{:.no_toc}

Create a new file called `index.js` in the project root, then add the following:

```js
import Express from 'express';
import getPort from 'get-port';

async function startServer(app) {
  const PORT = await getPort(8080);
  app.listen(PORT, () => {
    console.log(`=> server running at http://localhost:${PORT}/`);
  });
}

const app = Express();

app.get('/', (_, res) => res.send('Hello world!'));

startServer(app);
```

This file creates an Express app, sets up a "Hello world!" endpoint, and starts the app listening on port 8080 (or a random port if 8080 is already in use).

### Verify that the server works
{:.no_toc}

To verify that the server works, build and then start it:

```bash
yarn build
# npm run build

# Start the built server
node dist
```

Assuming port 8080 isn't in use on your machine, opening http://localhost:8080/ should result in a "Hello world!" message.

## Step 4. Create a GrAMPS-powered GraphQL gateway

Now that we have a working server, we can set up GrAMPS to get our gateway running.

### Add dependencies
{:.no_toc}

```bash
yarn add @gramps/gramps apollo-server-express body-parser graphql
# npm install --save @gramps/gramps apollo-server-express body-parser graphql
```

### Set up the GraphQL endpoints
{:.no_toc}

```diff
  import Express from 'express';
  import getPort from 'get-port';
+ import bodyParser from 'body-parser';
+ import gramps from '@gramps/gramps';
+ import { GraphQLSchema } from 'graphql';
+ import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
  
  async function startServer(app) {
    const PORT = await getPort(8080);
    app.listen(PORT, () => {
      console.log(`=> server running at http://localhost:${PORT}/`);
    });
  }
  
  const app = Express();
+ const GraphQLOptions = gramps();
  
- app.get('/', (_, res) => res.send('Hello world!'));
+ app.use(bodyParser.json());
+ app.use('/graphql', graphqlExpress(GraphQLOptions));
+ app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));
  
  startServer(app);
```

### Test the gateway
{:.no_toc}

Let's make sure everything is working by starting the server and running a test query.

```bash
yarn build
# npm run build

node dist
```

Open http://localhost:8080/graphiql and run the following query:

```graphql
{
  grampsVersion
}
```

The result should look something like this:

```json
{
  "data": {
    "grampsVersion": "1.0.0"
  }
}
```

> **NOTE:** By default, GrAMPS exposes a single query — `grampsVersion` — which returns the current package version of `@gramps/gramps`.

## Step 5. Add a GrAMPS data source

Now that the gateway is running, let's hook it up to some data by installing the [xkcd GrAMPS data source](https://github.com/gramps-graphql/data-source-xkcd).

### Add dependencies
{:.no_toc}

```bash
yarn add @gramps/data-source-xkcd graphql-tools
# npm install --save @gramps/data-source-xkcd graphql-tools
```

> **NOTE:** GrAMPS data sources have a `peerDependency` of `graphql-tools`. This avoids a conflict where multiple data sources could introduce multiple versions of `graphql-tools` as subdependencies.

### Add the data source to the gateway
{:.no_toc}

Adding data sources to a GrAMPS gateway requires just two lines of code:

```diff
  import Express from 'express';
  import getPort from 'get-port';
  import bodyParser from 'body-parser';
  import gramps from '@gramps/gramps';
  import { GraphQLSchema } from 'graphql';
  import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
+ import XKCD from '@gramps/data-source-xkcd';
  
  async function startServer(app) {
    const PORT = await getPort(8080);
    app.listen(PORT, () => {
      console.log(`=> server running at http://localhost:${PORT}/`);
    });
  }
  
  const app = Express();
- const GraphQLOptions = gramps();
+ const GraphQLOptions = gramps({
+   dataSources: [XKCD],
+ });
  
  app.use(bodyParser.json());
  app.use('/graphql', graphqlExpress(GraphQLOptions));
  app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));
  
  startServer(app);
```

### Test the data source
{:.no_toc}

To verify that everything is working, run the following:

```bash
yarn build
# npm run build

node dist
```

Open http://localhost:8080/graphiql and run the following query:

```graphql
{
  getComicById(id: 123) {
    title
    link
  }
}
```

You should see the following output:

```json
{
  "data": {
    "getComicById": {
      "title": "Centrifugal Force",
      "link": "https://xkcd.com/123/"
    }
  }
}
```

Bam! We just added live data from a third party in two lines of code!

## Step 6. Add the GrAMPS CLI for development

In order to give ourselves the ability to develop more easily — for example, using mock data, or running our gateway with a local data source we're building — we'll need to add the GrAMPS CLI.

### Add dependencies
{:.no_toc}

```bash
yarn add --dev @gramps/cli
# npm install --save-dev @gramps/cli
```

### Create package scripts
{:.no_toc}

Let’s add a `dev` script that will run the GrAMPS CLI's `dev` command and tell it to use our gateway.

For convenience, let's also add a `predev` script to rebuild the gateway every time we run the `dev` script.

```diff
  {
    "name": "my-gateway",
    "version": "1.0.0",
    "main": "index.js",
    "license": "MIT",
    "scripts": {
+     "predev": "yarn build",
+     "dev": "gramps dev --gateway dist",
      "build": "babel index.js -d dist"
    },
    "devDependencies": {
      "@gramps/cli": "^1.0.0-beta.4",
      "babel-cli": "^6.26.0",
      "babel-preset-env": "^1.6.1"
    },
    "dependencies": {
      "@gramps/gramps": "^1.0.0-beta-7",
      "apollo-server-express": "^1.3.1",
      "body-parser": "^1.18.2",
      "express": "^4.16.2",
      "get-port": "^3.2.0",
      "graphql": "^0.12.3",
      "graphql-tools": "^2.13.0"
    }
  }
```

> **NOTE:** If you're using `npm`, make sure to update the `predev` command to use `npm run build` instead.

### Test the dev script
{:.no_toc}

Test that the script worked by running the following:

```bash
yarn dev
# npm run dev
```

Open http://localhost:8080/graphiql and run a test query. This should be exactly the same as our previous test of the gateway.

Next, let's use the CLI to run our gateway with mock data:

```bash
yarn dev --mock
# npm run dev -- --mock
```

Open http://localhost:8080/graphiql and run the test query again:

```graphql
{
  getComicById(id: 123) {
    title
    link
  }
}
```

This time, the response should be placeholder text that looks something like this:

```json
{
  "data": {
    "getComicById": {
      "title": "Quidem illo",
      "link": "http://Sylvester.biz/"
    }
  }
}
```

## What's Next?
{:.no_toc}

At this point, you've got a working GraphQL gateway running a GrAMPS data source!

From here, you can learn [how to build your own data source]({{ site.github.url }}/data-source/tutorial-setup), dive into the [CLI docs]({{ site.github.url }}/cli/cli-overview), or check out the [GrAMPS core docs]({{ site.github.url }}/core/core-overview).
