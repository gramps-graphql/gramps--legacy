---
title: How to Test GrAMPS Data Sources
weight: 450
hidden: true
---

TKTK

## How to Convert Keyed Objects to Arrays

Something that can be tricky with GraphQL is the expectation that we know _exactly_ what fields are going to arrive. But we don’t always have that information — for example, the `filmography` field that comes back from the IMDB API when searching a person ([example](https://www.theimdbapi.org/api/find/person?name=jim+carrey)) is an object with keys that refer to the type of appearance that person made. Since we don’t have a master list of all available positions someone can hold, we aren’t able to define the schema with expected object keys.

Instead, we need to transform a response like this:

```json
{
  "filmography": {
    "actor": [
      {
        "imdb_id": "tt1234567",
        "...": "..."
      }
    ],
    "director": [
      {
        "imdb_id": "tt7654321",
        "...": "..."
      }
    ]
  }
}
```

Into something more like this:

```json
{
  "filmography": [
    {
      "position": "actor",
      "imdb_id": "tt1234567",
      "...": "..."
    },
    {
      "position": "director",
      "imdb_id": "tt7654321",
      "...": "..."
    }
  ]
}
```

This way, we can create a predictable data shape for our schema, despite not knowing exactly what the value of `position` will be.

The resolver we end up writing to account for this might look a little intimidating at first, especially if you’re not familiar with [array methods](https://mzl.la/2yX77TK) and/or [ES2015+ syntax](https://git.io/vdNeC), but let’s take a look, then break down what’s happening.

```js
    IMDB_Person: {
      // Convert the filmography object into an array for filtering/typing.
      filmography: ({ filmography }, { filter = 'all' }) =>
        Object.keys(filmography)
          .reduce(
            (works, position) =>
              works.concat(
                filmography[position].map(work => ({
                  position,
                  ...work,
                })),
              ),
            [],
          )
          .filter(work => filter === 'all' || work.position === filter),
    },
```

Let’s walk through this function step-by-step:

1.  First, we use [`Object.keys()`](https://mzl.la/2hWjc0P) to get an array of 
    the `filmography` object‘s keys (e.g. `['actor', 'director']`)
2.  Next, we use [`.reduce()`](https://mzl.la/2xe0nPv) to transform our array 
    of key names into an array of actual filmography objects. The `works` argument contains the entries we’ve added so far (this starts as an empty array), and `position` is the current key (e.g. `actor`)
3.  In the reducer, we use [`.concat()`](https://mzl.la/2gxku5y) to combine the 
    `works` array with a new array containing filmography objects
4.  The filmography objects are created by accessing the current position’s 
    array (e.g. if `position = 'actor'`, then `filmography[position] === filmography.actor`)
5.  Using [`.map()`](https://mzl.la/2ipT3v7), we loop through the position’s 
    array of works and return a new object, which is created by adding the position (e.g. `position: 'actor'`), then adding all the other fields from the original object with the spread operator
6.  After we have the full array of works, we can apply an optional filter to 
    the array (e.g. the query can be `filmography(filter: 'actor')`) using the `.filter()` method
