---
title: What Is a Data Source?
weight: 1
---

At its core, a GrAMPS data source is simply an organizational structure to make GraphQL servers easier to build out of modular components.

By following the GrAMPS structure, data sources become more manageable, testable, and shareable. Different teams can own and maintain data sources that are all composed together and exposed through a single GraphQL gateway. 

Developers can even get full GraphQL schemas for third-party services simply by installing that service’s data source.

## Table of Contents
{:.no_toc}

- 
{:toc}

## The Anatomy of a Data Source

Every GraphQL data source exports a **GrAMPS object** which defines the following properties:

-   `namespace` — a unique name for the data source

-   `context` — an object to be used as the context for the resolvers

-   `typeDefs` — type definitions for a GraphQL schema 
    (see [the GraphQL docs on schemas for more info][1])

-   `resolvers` — an object containing resolver functions
    (see [the GraphQL docs on execution for more info][2])

-   `mocks` — mock resolver functions
    (see [the Apollo docs on mocking for more info][3])

[1]: http://graphql.org/learn/schema/
[2]: http://graphql.org/learn/execution/
[3]: https://www.apollographql.com/docs/graphql-tools/mocking.html

## Why Follow the GrAMPS Standard?

-   Consistency, maintainability, and simplicity: data sources follow a 
    predictable, well-documented format.
-   Centralized data, distributed maintenance (one endpoint, many repos)
-   Reusability: plug together community GrAMPS data sources with your own to 
    build complex applications faster
