---
title: What Is a Data Source?
weight: 1
---

A GrAMPS data source is not a huge toolset — it’s just a way to organize your GraphQL data sources in such a way that they can easily be managed as separate packages, shared between different GraphQL servers, and independently maintained and tested.

## Table of Contents
{:.no_toc}

- 
{:toc}

## The Anatomy of a Data Source

Every GraphQL data source has five (5) main components:

1.  **Main (GrAMPS) Object** — combines the other components into a single 
    object for use with GrAMPS
2.  **Connector** — where to get data + methods for accessing it
3.  **Model** — methods to make specific requests using the connector
4.  **Schema** — description of the fields and types returned by the GraphQL 
    queries and mutations (see [the GraphQL docs on schemas for more info][1])
5.  **Resolvers** — functions to map the model responses to GraphQL schemas 
    (see [the GraphQL docs on execution for more info][2])

[1]: http://graphql.org/learn/schema/
[2]: http://graphql.org/learn/execution/

## Why Follow the GrAMPS Standard?

-   Consistency
-   Maintainability because different data source codebases have common 
    structure
-   Centralized data, distributed maintenance (one endpoint, many repos)
-   Reusability — plug together community GrAMPS data sources with your own to 
    build complex applications faster
