---
title: "Tutorial: Model"
weight: 30
hidden: true
---

Now that the [connector is ready]({{ site.github.url }}/data-source/tutorial-connector), we can write our data model class. This is pretty similar to any data access class you would write for an app, whether or not it uses GraphQL. If you’re familiar with the term <abbr title="Create Read Update Delete">CRUD</abbr>, this is the CRUD part of the data source.

## Table of Contents
{:.no_toc}

-   [Initial Data Source Setup]({{ site.github.url }}/data-source/tutorial-setup)
-   [Create a Connector]({{ site.github.url }}/data-source/tutorial-connector)
-   **> [Create a Model]({{ site.github.url }}/data-source/tutorial-model)**
-   [Write a GraphQL Schema]({{ site.github.url }}/data-source/tutorial-schema)
-   [Write Resolvers]({{ site.github.url }}/data-source/tutorial-resolvers)
-   [Use Development Modes]({{ site.github.url }}/data-source/tutorial-dev)

## In This Section
{:.no_toc}

- 
{:toc}

## Modify the Class Name and Remove the Example Method

To start, rename the model class in `src/model.js` and remove the example method:

```diff
- // TODO: change `YourDataSourceModel` to a descriptive name
- export default class YourDataSourceModel extends GraphQLModel {
+ export default class IMDBAPIModel extends GraphQLModel {
-   /**
-    * Loads a thing by its ID
-    * @param  {String}  id  the ID of the thing to load
-    * @return {Promise}     resolves with the loaded user data
-    */
-   getById(id) {
-     return this.connector.get(`/data/${id}`).catch(res =>
-       this.throwError(res, {
-         description: 'This is an example call. Add your own!',
-         docsLink:
-           'https://gramps-graphql.github.io/gramps-express/data-source/tutorial/',
-       }),
-     );
-   }
```

## Write Helper Methods

Since the API we’re using has multiple endpoints that all use query parameters, we’re going to write a couple helper functions to avoid repeating ourselves in the code.

We’ll make these helper functions pure so they’re easy to understand and debug, and we’ll put them **outside the class declaration**.

The first helper, `makeUrlSafe`, accepts a string and returns a URL-encoded string that uses `+` for spaces instead of the uglier `%20` syntax.

```diff
+ const makeUrlSafe = str => encodeURIComponent(str).replace('%20', '+');

  export default class IMDBAPIModel extends GraphQLModel {
```

The second helper, `getQueryString`, converts an object (e.g. `{ name: 'Idris Elba' }`) into a query string (e.g. `name=Idris+Elba`), using `makeUrlSafe` to encode the values and removing any empty arguments.

```diff
  const makeUrlSafe = str => encodeURIComponent(str).replace('%20', '+');
+ const getQueryString = args =>
+   Object.keys(args)
+     .map(key => (args[key] ? `${key}=${makeUrlSafe(args[key])}` : false))
+     // Remove any arguments that were falsy.
+     .filter(pair => pair !== false)
+     // Turn the array into a query string.
+     .join('&');

  export default class IMDBAPIModel extends GraphQLModel {
```

## Write a Data Access Method

Now we can write our first method, which will allow us to search for a movie by its title and (optionally) year:

```js
  /**
   * Searches for a movie by its title and (optionally) its release year.
   *
   * @see http://www.theimdbapi.org/
   * @param  {String}  args.title  movie title to search for
   * @param  {String?} args.year   year the movie was released
   * @return {Promise}             resolves with movie(s) matching the search
   */
  searchByTitle(args) {
    return this.connector
      .get(`/find/movie?${getQueryString(args)}`)
      .catch(res =>
        this.throwError(res, {
          description: 'Unable to search movies',
          docsLink: 'https://github.com/gramps-express/data-source-imdbapi',
        }),
      );
  }
```

For the sake of brevity, we won’t include the other three methods for the model here. However, you can see the full model code [on GitHub](https://github.com/gramps-graphql/data-source-imdbapi/blob/master/src/model.js).

## Write Tests for the Model

To test the model, let’s open up `test/model.test.js`, update the data source name, and remove the example tests:

```diff
- // TODO: Update the data source name.
- const DATA_SOURCE_NAME = 'YourDataSource';  
+ const DATA_SOURCE_NAME = 'IMDBAPI';

  const connector = new Connector();
  const model = new Model({ connector });  

  describe(`${DATA_SOURCE_NAME}Model`, () => {
    it('inherits the GraphQLModel class', () => {
      expect(model).toBeInstanceOf(GraphQLModel);
    });  

-   // TODO: Update this test to use your model’s method(s).
-   describe('getById()', () => {
+   describe('searchMoviesByTitle()', () => {
-     it('calls the correct endpoint with a given ID', () => {
-       const spy = jest.spyOn(connector, 'get');  
-
-       model.getById('1234');
-       expect(spy).toHaveBeenCalledWith('/data/1234');
-     });  
-
-     it('throws a GrampsError if something goes wrong', async () => {
-       expect.assertions(1);  
-
-       model.connector.get.mockImplementationOnce(() =>
-         Promise.reject({ no: 'good' }),
-       );  
-
-       try {
-         // TODO: Update to use one of your model’s methods.
-         await model.getById('1234');
-       } catch (error) {
-         expect(error.isBoom).toEqual(true);
-       }
-     });
    });
```

Inside the `searchMoviesByTitle()` block, let’s add a test to ensure that the model method sends a call to the IMDB API. We do this by by [spying][1] on the connector’s `get()` method so we can see what the API call looks like after processing.

[1]: https://facebook.github.io/jest/docs/en/jest-object.html#jestspyonobject-methodname)

```js
  describe('searchMoviesByTitle()', () => {
    it('calls the correct endpoint with a given ID', () => {
      const spy = jest.spyOn(connector, 'get');

      model.searchMoviesByTitle({ title: 'Test Movie' });
      expect(spy).toHaveBeenCalledWith('/find/movie?title=Test+Movie');
    });
  });
```

Next, let’s test that the option `year` parameter works:

```js
    it('correctly adds the year if one is supplied', () => {
      const spy = jest.spyOn(connector, 'get');

      model.searchMoviesByTitle({ title: 'Test Movie', year: '1979' });
      expect(spy).toHaveBeenCalledWith(
        '/find/movie?title=Test+Movie&year=1979',
      );
    });
```

And let’s also make sure that our `getQueryString()` helper is dropping empty parameters properly:

```js
    it('ignores the year if an empty value is provided', () => {
      const spy = jest.spyOn(connector, 'get');

      model.searchMoviesByTitle({ title: 'Test Movie', year: '' });
      expect(spy).toHaveBeenCalledWith('/find/movie?title=Test+Movie');
    });
```

Finally, let’s make sure we get a [`GrampsError`]({{ site.github.url }}/api/errors/#grampserrorerrordata) if the request fails:

```js
    it('throws a GrampsError if something goes wrong', async () => {
      expect.assertions(3);

      model.connector.get.mockImplementationOnce(() =>
        Promise.reject(Error('boom')),
      );

      try {
        await model.searchMoviesByTitle({ title: 'Test Movie' });
      } catch (error) {
        expect(error.isBoom).toEqual(true);
        expect(error.output.payload.description).toEqual(
          'Unable to search movies',
        );
        expect(error.output.payload.docsLink).toEqual(
          'https://github.com/gramps-express/data-source-imdbapi',
        );
      }
    });
```

For the full model test suite, [check out GitHub](https://github.com/gramps-graphql/data-source-imdbapi/blob/master/test/model.test.js).

## Next Up: Write a Schema

Okay, great — we can access data! In the next section, we’ll describe the data that comes back from the IMDB API as a GraphQL schema.

{% include button.html
    href="/data-source/tutorial-schema" 
    text="Create a GrAMPS Data Source Schema &rarr;"
%}
