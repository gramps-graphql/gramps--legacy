---
title: "Tutorial: Development Modes"
weight: 60
hidden: true
---

At this point, we have our [connector]({{ site.github.url }}/data-source/tutorial-connector), [model]({{ site.github.url }}/data-source/tutorial-model), [schema]({{ site.github.url }}/data-source/tutorial-schema), and [resolvers]({{ site.github.url }}/data-source/tutorial-resolvers) built and ready to go. All that’s left to do is fire up our data source in mock and live mode to make sure it’s working.

## Table of Contents
{:.no_toc}

-   [Initial Data Source Setup]({{ site.github.url }}/data-source/tutorial-setup)
-   [Create a Connector]({{ site.github.url }}/data-source/tutorial-connector)
-   [Create a Model]({{ site.github.url }}/data-source/tutorial-model)
-   [Write a GraphQL Schema]({{ site.github.url }}/data-source/tutorial-schema)
-   [Write Resolvers]({{ site.github.url }}/data-source/tutorial-resolvers)
-   **> [Use Development Modes]({{ site.github.url }}/data-source/tutorial-dev)**

## In This Section
{:.no_toc}

- 
{:toc}

## Run the Data Source in Mock Data Mode

To test the data source with mock data, open your terminal and run the following command:

```bash
yarn mock-data
```

Then open `http://localhost:8080/graphiql` in your browser and run a test query. You’ll see the GraphiQL user interface, and you can make a test query like this:

```graphql
query searchMoviesByTitle($options: IMDB_MovieSearchInput) {
  searchMoviesByTitle(options: $options) {
    imdb_id
    title
    genre
    year
  }
}
```

The result will be mock data that looks something like this:

{% include figure.html
   src="/assets/img/data-source-mock-data.png"
   alt="A GrAMPS data source running in mock data mode"
   caption="A GrAMPS data source running in mock data mode"
%}

## Run the Data Source in Live Data Mode

To use live data, stop the server (`control` + `C`), then run this command:

```bash
yarn live-data
```

Then go back to `http://localhost:8080/graphiql` and run the same command we used with the mock data:

```graphql
query searchMoviesByTitle($options: IMDB_MovieSearchInput) {
  searchMoviesByTitle(options: $options) {
    imdb_id
    title
    genre
    year
  }
}
```

This time you’ll get back a response with live data!

> **NOTE:** Unfortunately, it turns out the IMDB API is pretty unreliable and 
> frequently goes down. It’s 
> [on our todo list](https://github.com/gramps-graphql/gramps-express/issues/31)
> to update this tutorial with a more reliable data source. (Want to contribute?
> We’d love to have you participate — 
> [get involved](https://github.com/gramps-graphql/gramps-express/issues/31)!)

## Further Reading

-   [Review the full source code of the GrAMPS data source for the IMBDAPI](https://github.com/gramps-graphql/data-source-imdbapi)
-   [Learn more about testing GrAMPS data sources]({{ site.github.url}}/data-source/testing)
-   [Learn how to publish GrAMPS data sources]({{ site.github.url}}/data-source/publishing)
