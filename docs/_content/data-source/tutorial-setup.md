---
title: "Tutorial: Create a Data Source"
weight: 10
---

In this tutorial, we’re going to create a data source for [the IMDB API](http://www.theimdbapi.org/), which allows us to look up information about movies.

## Table of Contents
{:.no_toc}

-   **> [Initial Data Source Setup]({{ site.github.url }}/data-source/tutorial-setup)**
-   [Create a Connector]({{ site.github.url }}/data-source/tutorial-connector)
-   [Create a Model]({{ site.github.url }}/data-source/tutorial-model)
-   [Write a GraphQL Schema]({{ site.github.url }}/data-source/tutorial-schema)
-   [Write Resolvers]({{ site.github.url }}/data-source/tutorial-resolvers)
-   [Use Development Modes]({{ site.github.url }}/data-source/tutorial-dev)

## In This Section
{:.no_toc}

- 
{:toc}

> **NOTE:** The goal of this tutorial is to create a data source that will act 
> as a pass-through layer, meaning the GraphQL schema will exactly match the 
> REST API response. This is not the only way to approach a data source, so 
> please refer to this less as a “how to design a schema” tutorial than a “how 
> to create a GrAMPS-compatible data source” tutorial.

## Install the Data Source Base

To start off with most of the boilerplate taken care of, we’ll use the [GrAMPS data source base](https://github.com/gramps-graphql/data-source-base) as our starting point.

Create a folder for your new data source, then clone the data source base into it, update your remote Git URL, and install the dependencies.

```sh
# Create a folder for your data source and move into it
mkdir data-source-imdbapi
cd data-source-imdbapi/

# Clone the data source base into the new folder (note the trailing .)
git clone git@github.com:gramps-graphql/data-source-base.git .

# Change the remote URL to your data source GitHub repo
git remote set-url origin git@github.com:gramps-graphql/data-source-imdbapi.git

# Install dependencies
yarn install
```

> **NOTE:** We use [Yarn][4] because it’s currently better than npm at creating 
> lockfiles and tends to be a little faster/less verbose than npm. That being
> said, you can use npm if you prefer without any problems.

[4]: https://yarnpkg.com

## Update the Context Name for the Data Source

In a GraphQL server, resolver functions receive what’s called a “context”, which is an object that contains whatever we, as developers, want to pass along to help resolve our queries. The most common use of this is to provide a means of loading data, which is referred to as a “model” in the GrAMPS ecosystem.

Each GrAMPS data source will add its model to the context under a unique identifier, which we need to choose.

Open `src/index.js` and update the context:

```diff
  import schema from './schema.graphql';
  import resolvers from './resolvers';
  import Connector from './connector';
  import Model from './model';
  
  /*
   * For more information on the main data source object, see
   * https://ibm.biz/graphql-data-source-main
   */
  export default {
-   // TODO: Rename the context to describe the data source.
-   context: 'YourDataSource',
+   context: 'IMDBAPI',
    model: new Model({ connector: new Connector() }),
    schema,
    resolvers,
  };
```

> **NOTE:** In code examples, we show the diff of the changed file, which means
> red lines are the original code that needs to be changed or removed, and 
> green lines show the completed edits.

## Update package.json

Before we work on the code itself, we need to do a little bit of housekeeping. First, let’s edit `package.json` to add the correct info about our new data source.

```diff
  {
-   "name": "@gramps/data-source-base",
+   "name": "@gramps/data-source-imdbapi",
-   "description": "Base modules for a GrAMPS GraphQL data source.",
+   "description": "GrAMPS GraphQL data source for the IMDB API.",
    "contributors": [
-     "Jason Lengstorf <jason@lengstorf.com>"
+     "Your Name <your.email@example.org>"
    ],
    "repository": {
      "type": "git",
-     "url": "https://github.com/gramps-graphql/data-source-base.git"
+     "url": "https://github.com/gramps-graphql/data-source-imdbapi.git"
    },
    // ...
  }
```

## Update the README

Make sure to edit the name of the repo and the badges to point to your data source repo. An easy way to do this is to search for `data-source-base` in the README to find all the places that need to be updated.

## Next Up: Create a Connector
{:.no_toc}

With the initial setup out of the way, we can start writing actual code. In the next section, we’ll tell our data source where to load data from.

{% include button.html
    href="/data-source/tutorial-connector" 
    text="Create a GrAMPS Data Source Connector &rarr;"
%}
