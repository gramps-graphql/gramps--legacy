<a href="https://gramps.js.org/"><img src="https://gramps.js.org/assets/img/gramps-banner.png" alt="GrAMPS · An easier way to manage the data sources powering your GraphQL server" width="450"></a>

# GrAMPS — Composable, Shareable Data Sources for GraphQL
[![license](https://img.shields.io/npm/l/@gramps/gramps.svg)](https://github.com/gramps-graphql/gramps/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/@gramps/gramps.svg?style=flat)](https://www.npmjs.com/package/@gramps/gramps) [![Build Status](https://travis-ci.org/gramps-graphql/gramps.svg?branch=master)](https://travis-ci.org/gramps-graphql/gramps) [![Maintainability](https://api.codeclimate.com/v1/badges/ac264833fac1fbd1afe0/maintainability)](https://codeclimate.com/github/gramps-graphql/gramps/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/ac264833fac1fbd1afe0/test_coverage)](https://codeclimate.com/github/gramps-graphql/gramps/test_coverage) [![Greenkeeper badge](https://badges.greenkeeper.io/gramps-graphql/gramps.svg)](https://greenkeeper.io/) [![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors)

**An easier way to manage the data sources powering your GraphQL server.**

**GrAMPS** (short for **Gr**aphQL **A**pollo **M**icroservice **P**attern **S**erver) is a thin layer of helper tools designed for the [Apollo GraphQL server](https://github.com/apollographql/apollo-server/) that allows independent data sources — a schema, resolvers, and data access model — to be composed into a single GraphQL schema, while keeping the code within each data source isolated, independently testable, and completely decoupled from the rest of your application.

## Developer Quickstart

To get a GrAMPS+[Apollo](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-express) gateway up and running, start by installing the required packages:

```bash
yarn add @gramps/gramps express apollo-server-express body-parser graphql
```

Next, create a file called `index.js` and put the following inside:

```js
const Express = require('express');
const bodyParser = require('body-parser');
const gramps = require('@gramps/gramps').default;
const { GraphQLSchema } = require('graphql');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');

const app = Express();
const GraphQLOptions = gramps();

app.use(bodyParser.json());
app.use('/graphql', graphqlExpress(GraphQLOptions));
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

app.listen(8080, () => console.log(`=> running at http://localhost:8080/`));
```

Start the server with `node index.js`, then open http://localhost:8080/graphiql to see the GraphiQL user interface.

For a more in-depth starter, [see the 5-minute quickstart](https://gramps.js.org/overview/quickstart/) in our documentation.

## Why Does GrAMPS Exist?

GrAMPS is an attempt to create a standard for organizing GraphQL data source repositories, which allows for multiple data sources to be composed together in a plugin-like architecture.

The ability to combine independently managed data sources into a single GraphQL server is a core requirement for IBM Cloud’s microservice architecture. We have dozens of teams who expose data, so a single codebase with all GraphQL data sources inside was not an option; we needed a way to give each team control of their data while still maintaining the ability to unify and expose our data layer under a single GraphQL microservice. 

GrAMPS solves this problem by splitting each data source into independent packages that are composed together into a single GraphQL server.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars2.githubusercontent.com/u/163561?v=4" width="100px;"/><br /><sub><b>Jason Lengstorf</b></sub>](https://code.lengstorf.com)<br />[💻](https://github.com/gramps-graphql/gramps/commits?author=jlengstorf "Code") [🎨](#design-jlengstorf "Design") [📖](https://github.com/gramps-graphql/gramps/commits?author=jlengstorf "Documentation") [📢](#talk-jlengstorf "Talks") | [<img src="https://avatars1.githubusercontent.com/u/5205440?v=4" width="100px;"/><br /><sub><b>Eric Wyne</b></sub>](https://github.com/ecwyne)<br />[💻](https://github.com/gramps-graphql/gramps/commits?author=ecwyne "Code") [🤔](#ideas-ecwyne "Ideas, Planning, & Feedback") | [<img src="https://avatars1.githubusercontent.com/u/2746394?v=4" width="100px;"/><br /><sub><b>Cory Cook</b></sub>](https://github.com/corycook)<br />[🤔](#ideas-corycook "Ideas, Planning, & Feedback") | [<img src="https://avatars0.githubusercontent.com/u/8397708?v=4" width="100px;"/><br /><sub><b>Michael Fix</b></sub>](https://mfix22.github.io)<br />[💻](https://github.com/gramps-graphql/gramps/commits?author=mfix22 "Code") |
| :---: | :---: | :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!
