---
title: "Tutorial: Schema"
weight: 40
hidden: true
---

At this point, we’ve [set up a connector]({{ site.github.url }}/data-source/tutorial-connector) to tell our data source where data comes from, and [defined data access methods in a model]({{ site.github.url }}/data-source/tutorial-model) to make requests for specific types of data. In this section, we’ll create a GraphQL schema to describe our data.

## Table of Contents
{:.no_toc}

-   [Initial Data Source Setup]({{ site.github.url }}/data-source/tutorial-setup)
-   [Create a Connector]({{ site.github.url }}/data-source/tutorial-connector)
-   [Create a Model]({{ site.github.url }}/data-source/tutorial-model)
-   **> [Write a GraphQL Schema]({{ site.github.url }}/data-source/tutorial-schema)**
-   [Write Resolvers]({{ site.github.url }}/data-source/tutorial-resolvers)
-   [Use Development Modes]({{ site.github.url }}/data-source/tutorial-dev)

## In This Section
{:.no_toc}

- 
{:toc}

## Remove the Example Query and Type

To get set up, let’s start by removing the example query and type in `src/schema.graphql`.

```diff
  # The query/queries for data access MUST extend the Query type.
  extend type Query {
-   # TODO: rename and add a description of this query
-   YourDataSource(
-     # TODO: Describe this argument
-     id: ID!
-   ): PFX_YourDataSource
  }

- # TODO: Choose a unique prefix and rename the type descriptively.
- type PFX_YourDataSource {
-   # The unique ID of the thing.
-   id: ID!
-   # Describe each field to help people use the data more effectively.
-   name: String
-   lucky_numbers: [Int]
- }
```

> **NOTE:** If you’re not familiar with the syntax for GraphQL schemas, 
> [read the GraphQL docs](http://graphql.org/learn/schema/) for more info.

## Extend the Query Type

In order to make GraphQL queries, we need to extend the `Query` type. **This is a GrAMPS-specific feature that allows GrAMPS data sources to be combined without transpilation.**

Let’s add our `searchMoviesByTitle` query:

```diff
  extend type Query {
+   # Search for a movie by its title and (optionally) release year.
+   searchMoviesByTitle(
+     # Argument object with the title and year to search for.
+     options: IMDB_MovieSearchInput
+   ): [IMDB_Movie]
  }
```

We’ll only look at the `searchMoviesByTitle` part of the schema in this tutorial, but you can see the full schema [on GitHub](https://github.com/gramps-graphql/data-source-imdbapi/blob/master/src/schema.graphql).

## Define an Input Type

To make sure our query is easy to use, but still strongly typed, we’re using an [input type](http://graphql.org/graphql-js/mutations-and-input-types/) to define arguments. In the case of our movie search, the possible arguments are the name of the movie (required) and the year it was released (optional). Let’s add that to the schema.

```gql
input IMDB_MovieSearchInput {
  # The title of the movie to search for (e.g. “Ready Player One”).
  title: String!

  # (Optional) The year the movie was released.
  year: String
}
```

## Define Field Types

Next, we need to map the API responses to GraphQL types. To do this, let’s take a look at the response (with some values edited for space) from the database for a movie search:

```json
[
  {
    "title": "Ready Player One", 
    "content_rating": "", 
    "original_title": "", 
    "metadata": {
      "languages": [
        "English"
      ], 
      "asp_retio": "2.35 : 1", 
      "filming_locations": [
        "Jewellery Quarter", 
        "Birmingham", 
        "England", 
        "UK"
      ], 
      "also_known_as": [
        "Jogador N&#186; 1"
      ], 
      "countries": [
        "USA"
      ], 
      "gross": "", 
      "sound_mix": [
        "Dolby Digital", 
        "Auro 11.1", 
        "Dolby Atmos"
      ], 
      "budget": ""
    }, 
    "release_date": "2018-03-30", 
    "director": "Steven Spielberg", 
    "url": {
      "url": "http://www.imdb.com/title/tt1677720"
    }, 
    "year": "2018", 
    "trailer": [
      {
        "mimeType": "video/mp4", 
        "definition": "720p", 
        "videoUrl": "https://video-http.media-imdb.com/M....mp4"
      }, 
      // ...
    ], 
    "length": "", 
    "cast": [
      {
        "character": "The Iron Giant       (voice)", 
        "image": "https://images-na.ssl-images-amazon.com/images/M/....jpg", 
        "link": "http://www.imdb.com/name/nm0004874/?ref_=tt_cl_t1", 
        "name": "Vin Diesel"
      }, 
      // ...
    ], 
    "imdb_id": "tt1677720", 
    "rating": "", 
    "genre": [
      "Action", 
      "Adventure", 
      "Sci-Fi"
    ], 
    "rating_count": "", 
    "storyline": "Film centers on...", 
    "description": "When the creator...", 
    "writers": [
      "Zak Penn", 
      "Ernest Cline"
    ], 
    "stars": [
      "Vin Diesel", 
      "Olivia Cooke", 
      "Hannah John-Kamen"
    ], 
    "poster": {
      "large": "https://images-na.ssl-images-amazon.com/images/M/....jpg", 
      "thumb": "https://images-na.ssl-images-amazon.com/images/M/....jpg"
    }
  }
]
```

> **NOTE:** There’s a typo in the API response, where “ratio” is misspelled “retio” — we’ll address that in our schema.

To convert this to a GraphQL type, we go field-by-field and add them, each with its corresponding type. Fields that return objects become their own types.

To avoid collisions with other GrAMPS data sources, we’ll add a prefix of `IMDB_` to each type.

Add the following to `src/schema.graphql` to define the movie type:

```gql
type IMDB_Movie {
  cast: [IMDB_Cast]!
  content_rating: String!
  description: String!
  director: String!
  genre: [String]!
  imdb_id: String!
  length: String!
  metadata: IMDB_Metadata!
  original_title: String!
  poster: IMDB_Poster!
  rating: String!
  rating_count: String!
  release_date: String!
  stars: [String]!
  storyline: String!
  title: String!
  trailer: [IMDB_Trailer]!
  url: IMDB_Url!
  writers: [String]!
  year: String!
}

type IMDB_Cast {
  character: String!
  image: String!
  link: String!
  name: String!
}

type IMDB_Metadata {
  also_known_as: [String]!
  # The aspect ratio of the film.
  #
  # NOTE: This field has a typo on the API (`asp_retio`).
  asp_ratio: String!
  budget: String!
  countries: [String]!
  filming_locations: [String]!
  gross: String!
  languages: [String]!
  sound_mix: [String]!
}

type IMDB_Poster {
  large: String!
  thumb: String!
}

type IMDB_Trailer {
  definition: String!
  mimeType: String!
  videoUrl: String!
}

type IMDB_Url {
  title: String
  url: String!
  year: String
}
```

## Next Up: Write Resolvers
{:.no_toc}

At this point, we’ve got a way to get data, and a definition for how someone can access data — all that’s left now is to connect the API data to our GraphQL schema with resolvers.

{% include button.html
    href="/data-source/tutorial-resolvers" 
    text="Write a GrAMPS Data Source Resolvers &rarr;"
%}
