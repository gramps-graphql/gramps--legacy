<a href="https://ibm.biz/gramps-graphql"><img src="https://gramps-graphql.github.io/gramps-express/assets/img/gramps-banner.png" alt="GrAMPS · An easier way to manage the data sources powering your GraphQL server" width="450"></a>

# GrAMPS GraphQL Middleware for Apollo Express Server
[![license](https://img.shields.io/npm/l/@gramps/gramps-express.svg)](https://github.com/gramps-graphql/gramps-express/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/@gramps/gramps-express.svg?style=flat)](https://www.npmjs.com/package/@gramps/gramps-express) [![Build Status](https://travis-ci.org/gramps-graphql/gramps-express.svg?branch=master)](https://travis-ci.org/gramps-graphql/gramps-express) [![Maintainability](https://api.codeclimate.com/v1/badges/ac264833fac1fbd1afe0/maintainability)](https://codeclimate.com/github/gramps-graphql/gramps-express/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/ac264833fac1fbd1afe0/test_coverage)](https://codeclimate.com/github/gramps-graphql/gramps-express/test_coverage) [![Greenkeeper badge](https://badges.greenkeeper.io/gramps-graphql/gramps-express.svg)](https://greenkeeper.io/)

**An easier way to manage the data sources powering your GraphQL server.**

**GrAMPS** (short for **Gr**aphQL **A**pollo **M**icroservice **P**attern **S**erver) is middleware designed for [apollo-server-express](https://git.io/vd1wc) that allows independent data sources — a schema, resolvers, and data access model — to be composed into a single GraphQL schema, while keeping the code within each data source isolated, independently testable, and completely decoupled from the rest of your application.

## Developer Quickstart

[See the 5-minute quickstart in our documentation.](https://gramps-graphql.github.io/gramps-express/overview/quickstart/)

## Why Does GrAMPS Exist?

GrAMPS is an attempt to create a standard for organizing GraphQL data source repositories, which allows for multiple data sources to be composed together in a plugin-like architecture.

The architecture of GrAMPS data sources was inspired by @helfer, who [suggested models and connectors as abstractions](https://dev-blog.apollodata.com/how-to-build-graphql-servers-87587591ded5) when designing GraphQL servers. GrAMPS expands on the original concept and provides a standard that makes separate codebases interoperable.

The ability to combine independently managed data sources into a single GraphQL server is a core requirement for IBM Cloud’s microservice architecture. We have dozens of teams who expose data, so a single codebase with all GraphQL data sources inside was not an option; we needed a way to give each team control of their data while still maintaining the ability to simplify our data layer. 

GrAMPS solves this problem by allowing each data source to be an independent repository/package that can be composed together into a single GraphQL server.

## What GrAMPS Can Do

 -  Combine distinct schemas into a single GraphQL schema
 -  Allow local development with optional local overrides of data sources
 -  Improve error reporting with optional error handling

### How GrAMPS Works
1.  Import each GrAMPS data source as an npm package
2.  Check for local data sources specified in `GQL_DATA_SOURCES` or in the 
    `--data-source-dir` argument to the CLI command `gramps`
3.  Merge all GrAMPS data sources into a single GraphQL schema
4.  Attach the combined schema and context to the Express request
5.  Use the GrAMPS schema and context in `graphqlExpress` to start the server

## Roadmap

- [ ] Write a [data source](https://github.com/gramps-graphql/data-source-base) tutorial (#21, WIP at #22)
- [ ] Write a developer quickstart (#23)
- [ ] Add API docs (#24)
- [ ] Write docs about how error handling works (#25)
- [ ] Add a Redis add-on (#26)
- [ ] Add simpler cache key override (#27)
- [ ] Define a pattern for direct database access (#28)
- [ ] Add [all-contributors](https://github.com/kentcdodds/all-contributors) (#29)
- [ ] Add integration test examples/docs with [Cypress](https://www.cypress.io/) (#30)

## Credits

GrAMPS was born at [IBM Cloud](https://www.ibm.com/cloud-computing/) to solve the problem of maintaining a single GraphQL endpoint in a µ-service architecture where data sources are owned by dozens of teams.

We’re releasing it under the MIT license because we ❤️ the developer community.
