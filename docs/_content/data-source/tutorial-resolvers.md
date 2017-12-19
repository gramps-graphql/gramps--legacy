---
title: "Tutorial: Resolvers"
weight: 50
hidden: true
---

Now we know how to get data thanks to our [connector]({{ site.github.url }}/data-source/tutorial-connector) and [model]({{ site.github.url }}/data-source/tutorial-model), and have told GraphQL clients what kind of data to expect with our [schema]({{ site.github.url }}/data-source/tutorial-schema). In this section, we’ll add resolver functions to map the API response to our schema so we can actually return data.

## Table of Contents
{:.no_toc}

-   [Initial Data Source Setup]({{ site.github.url }}/data-source/tutorial-setup)
-   [Create a Connector]({{ site.github.url }}/data-source/tutorial-connector)
-   [Create a Model]({{ site.github.url }}/data-source/tutorial-model)
-   [Write a GraphQL Schema]({{ site.github.url }}/data-source/tutorial-schema)
-   **> [Write Resolvers]({{ site.github.url }}/data-source/tutorial-resolvers)**
-   [Use Development Modes]({{ site.github.url }}/data-source/tutorial-dev)

## In This Section
{:.no_toc}

- 
{:toc}

## Write Query Resolvers

The first thing we need to do is to tell GraphQL which model method should be called when a query is made. In `src/resolvers.js`, update the query resolver to call our movie search method:

```diff
  export default {
    queryResolvers: {
-     // TODO: Update query resolver name(s) to match schema queries
-     YourDataSource: (rootValue, { id }, context) =>
+     searchMoviesByTitle: (_, { options }, context) =>
        new Promise((resolve, reject) => {
-         // TODO: Update to use the model and call the proper method.
-         context.YourDataSource
-           .getById(id)
+         context.IMDBAPI
+           .searchMoviesByTitle(options)
            .then(resolve)
            .catch(reject);
        }),
    },
```

Rememember that [we provided a name for the `context`]({{ site.github.url }}/data-source/tutorial-setup/#update-the-context-name-for-the-data-source) in `src/index.js`, which is now used to refer to our model.

> **NOTE:** We don’t actually use the first argument to the query resolver
> because its original function has been replaced by the `context` argument.
> Using `_` is a convention to signify that an argument is unused.

## Test the Query Resolvers

One of the great things about the Apollo server is that resolvers are pure functions. This means that they’re not terribly hard to test, despite the fact that they’re used to load data.

To start, let’s remove the example tests from `test/resolvers.test.js`:

```diff
    describe('queryResolvers', () => {
-     describe(DATA_SOURCE_NAME, () => {
-       it('loads a thing by its ID', () => {
-         expect.assertions(1);
- 
-         const req = {};
- 
-         // TODO: Update with mock arguments for your model method.
-         const args = { id: 'abc1234' };
- 
-         // TODO: Update with the data source model name and method(s).
-         const mockContext = {
-           YourDataSource: {
-             // For testing, we mock the model to simply return the ID.
-             getById: id => Promise.resolve(id),
-           },
-         };
- 
-         return expect(
-           // TODO: Update to use your data source.
-           resolvers.queryResolvers.YourDataSource(req, args, mockContext),
-         ).resolves.toEqual('abc1234');
-       });
-     });
    });
```

In its place, let’s add a new test for `searchMoviesByTitle()`.

Before we write the test, we need to mock the context. Since unit tests should only test one unit of code at a time (e.g. this query resolver function), we’re going to mock the response from our connector method so it just returns a resolved Promise with the arguments that were provided to it. We do this so it’s easy to test whether or not the query resolver is asking for the correct data.


```diff
    describe('queryResolvers', () => {
+     const mockContext = {
+       IMDBAPI: {
+         searchMoviesByTitle: queryArgs => Promise.resolve(queryArgs),
+       },
+     };
    });
```

With the mock context read, we can set up a test for `searchMoviesByDefault()` that makes a call to the query resolver using our mock context and a properly formed `options` object — remember that it requires a `title` and optionally accepts a `year` — and expects that the connector method will be called with the contents of `options`.

Add the following t

```diff
    describe('queryResolvers', () => {
      const mockContext = {
        IMDBAPI: {
          searchMoviesByTitle: queryArgs => Promise.resolve(queryArgs),
        },
      };
  
+     describe('searchMoviesByTitle()', () => {
+       it('searches for movies by their titles', async () => {
+         expect.assertions(1);
+ 
+         const args = { options: { title: 'Test Movie' } };
+         const response = await resolvers.queryResolvers.searchMoviesByTitle(
+           null,
+           args,
+           mockContext,
+         );
+ 
+         return expect(response).toEqual({ title: 'Test Movie' });
+       });
+     });
    });
```

## Add Mock Data Resolvers for Development

One of the most powerful development tools offered by GraphQL is the ability to very easily mock data. This means that developers can work on a front end and back end simultaneously, as long as everyone’s agreed on what the data will look like at the end.

To take advantage of this, we’ll want to add mock resolvers. Without a mock resolver, all `String` fields return `Hello World`, which isn’t very useful for testing in many cases. We’ll use a helper library called [`casual`](https://www.npmjs.com/package/casual) to solve this, which generates more realistic mock data in useful formats like names, address info, dates, and more.

Add the following mock resolvers to `src/resolvers.js`:

```diff
    mockResolvers: {
-     // TODO: Update to mock all schema fields and types.
-     PFX_YourDataSource: () => ({
-       id: casual.uuid,
-       name: casual.name,
-       lucky_numbers: () => new MockList([0, 3]),
-     }),
+     IMDB_Movie: () => ({
+       cast: () => new MockList([1, 10]),
+       content_rating: casual.random_element(['PG', 'R', 'PG-13']),
+       description: casual.sentences(2),
+       director: casual.name,
+       genre: () =>
+         new MockList([1, 3], () =>
+           casual.random_element(['Action', 'Drama', 'Comedy']),
+         ),
+       imdb_id: `tt${Math.round(10000000 * Math.random())}`,
+       length: `${casual.integer(75, 190)}`,
+       original_title: casual.title,
+       rating: casual.integer(0, 100) / 10,
+       rating_count: casual.integer(0, 300),
+       release_date: casual.date('YYYY-MM-DD'),
+       stars: () => new MockList([1, 4], () => casual.name),
+       storyline: casual.sentences(2),
+       title: casual.title,
+       trailer: () => new MockList([1, 3]),
+       writers: () => new MockList([1, 4], () => casual.name),
+       year: casual.year,
+     }),
    },
```

> **NOTE:** For fields that return an array that may vary in length (for 
> example, the number of cast members), we can use Apollo’s [`MockList`][1]
> helper to provide a random-length array. [See the docs][1] for more info.

[1]: http://dev.apollodata.com/tools/graphql-tools/mocking.html#Using-MockList-in-resolvers

## Test the Mock Data Resolvers

Because we don’t actually know (or care) about the _actual_ response from a mock field (e.g. it doesn’t matter if a mocked name is “Mr. Bentley Tubbinsworth” or “Mrs. Roo Fluffkins”), we’re going to test that:

1.  The correct mock fields are returned by the mock resolver
2.  Fields that should return a `MockList` are actually returning `MockList`s
3.  `MockList`s with custom values are behaving as expected

To test that the correct fields are returned, we’re going to use the [`expectMockFields()` test helper]({{ site.github.url }}/api/testing/#expectmockfieldsresolver-fieldarray).

To test `MockList`s, we’ll use the [`expectMockList()` test helper]({{ site.github.url }}/api/testing/#expectmocklistresolver-fieldarray)

Add the following to `test/resolvers.test.js`:

```diff
    describe('mockResolvers', () => {
+     describe('IMDB_Movie', () => {
+       const mockResolvers = resolvers.mockResolvers.IMDB_Movie();
+ 
+       expectMockFields(mockResolvers, [
+         'cast',
+         'content_rating',
+         'description',
+         'director',
+         'genre',
+         'imdb_id',
+         'length',
+         'original_title',
+         'rating',
+         'rating_count',
+         'release_date',
+         'stars',
+         'storyline',
+         'title',
+         'trailer',
+         'writers',
+         'year',
+       ]);
+ 
+       expectMockList(mockResolvers, [
+         'cast',
+         'genre',
+         'stars',
+         'trailer',
+         'writers',
+       ]);
+ 
+       it('mocks the genre', () => {
+         expect(
+           ['Action', 'Drama', 'Comedy'].includes(
+             mockResolvers.genre().wrappedFunction(),
+           ),
+         ).toBe(true);
+       });
+ 
+       it('mocks the stars', () => {
+         expect(mockResolvers.stars().wrappedFunction()).toBeDefined();
+       });
+ 
+       it('mocks the writers', () => {
+         expect(mockResolvers.writers().wrappedFunction()).toBeDefined();
+       });
+     });
    });
```

> **NOTE:** The use of `wrappedFunction()` is a way to get at what the 
> `MockList` returns for a single entry, which allows us to test the value.

## Add Real Data Resolvers for Fields That Require Them

When we’re using live data, we don’t need to do anything in most cases: the default behavior of GraphQL is to look for a field in the data object that matches the field name in the schema, meaning this schema:

```graphql
type PFX_Person {
  name: String!
  company: String!
}
```

And this data response:

```json
{
  "name": "Jason Lengstorf",
  "company": "IBM"
}
```

Will work as-is, with no data resolvers required.

That means that for our IMDB API data source, there’s only one field that requires a data resolver: the `asp_ratio` field that’s misspelled in the API response.

Let’s add that resolver to `src/resolvers.js`:

```diff
    dataResolvers: {
-     // TODO: Update to reference the schema type(s) and field(s).
-     PFX_YourDataSource: {
-       // If a field isn’t always set, but it shouldn’t break the response, make it nullable.
-       name: data => data.name || null,
-     },
+     IMDB_Metadata: {
+       // Alias this field to fix a typo.
+       asp_ratio: data => data.asp_retio,
+     },
    },
```

## Test the Data Resolvers

To test the resolver, we need to make sure that it provides the expected value when given an object with the expected data. We get to see the power of using pure functions here again, because all we have to do is give our resolver an object and test what it returns.

Let’s add it by making the following changes in `test/resolvers.test.js`:

```diff
    describe('dataResolvers', () => {
-     describe('PFX_YourDataSource', () => {
-       const resolver = resolvers.dataResolvers.PFX_YourDataSource;
- 
-       expectNullable(resolver, ['name']);
-     });
+     describe('IMDB_Metadata', () => {
+       const resolver = resolvers.dataResolvers.IMDB_Metadata;
+ 
+       it('fixes the typo for the aspect ratio', () => {
+         expect(resolver.asp_ratio({ asp_retio: '16 : 9' })).toEqual('16 : 9');
+       });
+     });
    });
```

## Next Up: Use Development Modes
{:.no_toc}

At this point, we’ve got a fully functional data source — now we’re ready to test it out.

{% include button.html
    href="/data-source/tutorial-dev" 
    text="Test Your GrAMPS Data Source &rarr;"
%}
