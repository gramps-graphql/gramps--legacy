---
title: Overview
weight: 1
---

To make development easier, GrAMPS provides a CLI.

The CLI is designed to make three things easier:

1. 
{:toc}

> **IMPORTANT:** The GrAMPS CLI starts a gateway _for development only_. It has not been tested in production, and isn’t intended to be used outside of local development.

## Running Local Data Sources

A primary focus of GrAMPS is on the development experience. To that end, we want to make it as painless as possible to start working on a new data source.

Thanks to the CLI, you can create and run your own data source in about 60 seconds using just four quick commands:

```bash
# Get a copy of the data source base without the git history
npx graphql-cli create -b gramps-graphql/data-source-base data-source-mydata && cd $_

# Start a gateway and start developing!
yarn dev
```

And that's it!

## Developing Custom Gateways

In a real project, a GraphQL gateway will likely include multiple data sources. For example, you might have a gateway with three data sources:

- User
- Product
- WishList

Let’s assume WishList depends on both User and Product.

Assuming the start script for the gateway is `server.js`, we can use the CLI to start the gateway like so:

```bash
gramps dev --gateway ./server.js
```

But what if we need to make changes to WishList? Not to worry: GrAMPS has you covered. Simply run the gateway and specify the path to your local data source:

```bash
gramps dev --gateway ./server.js --data-source ../data-source-wishlist
```

GrAMPS is smart enough to recognize that the local WishList data source should override the one that's installed in the gateway, so you can develop your data source in the context where it will be deployed.

## Developing Offline

Nothing is worse than losing a half day of work because the back-end is down.

Fortunately, GraphQL makes it really easy to [mock your data](https://www.apollographql.com/docs/graphql-tools/mocking.html), and GrAMPS allows you to enable mock data using the CLI:

```bash
# Develop a data source locally with mock data.
gramps dev --data-source ./data-source-test --mock

# Develop using your custom gateway with mock data.
gramps dev --gateway ./server.js --mock
```

## What’s Next?
{:.no_toc}

For more information, see the [full CLI API docs]({{ site.github.url }}/cli/cli-api).
