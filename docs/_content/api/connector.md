---
title: Connector
---

A detailed, technical list of the methods and properties of a Connector.

- 
{:toc}

## Class Properties

Property    | Required? | Default | Description
----------- | --------- | ------- | --------------------------------------------
apiBaseUri  | yes       |         | e.g. https://api.example.org/v2
cacheExpiry | no        | 600     | number of seconds the cache is valid
enableCache | yes       | true    | whether or not to cache requests
headers     | no        | {}      | headers sent with all requests

## Class Methods

The following public methods are available to be used in Connector instances.

##### `get(endpoint)`

Makes a `GET` request to a given endpoint and returns the result as a `Promise`.

###### Parameters

- `endpoint`: the endpoint to `GET` the data from

###### Return Value

TKTK

###### Example

```js
// TKTK
```

##### `post(endpoint [, body [, options]])`

Sends a `POST` request and returns the result as a `Promise`.

###### Parameters

- `endpoint`: the endpoint to `POST` the data to
- `body`: default `{}`. JSON-encoded payload to send in the body of the request
- `options`: default `{}`. any options accepted by [request-promise](https://www.npmjs.com/package/request-promise)

###### Return Value

TKTK

###### Example

```js
// TKTK
```

##### `put(endpoint [, body [, options]])`

Sends a `PUT` request and returns the result as a `Promise`.

###### Parameters

- `endpoint`: the endpoint to `PUT` the data to
- `body`: default `{}`. JSON-encoded payload to send in the body of the request
- `options`: default `{}`. any options accepted by [request-promise](https://www.npmjs.com/package/request-promise)

###### Return Value

TKTK

###### Example

```js
// TKTK
```

## Internal Dependencies

There are two properties that _can_ be overridden, but it's probably a bad idea that will lead to harder maintenance and more confusing bugs. However, for the sake of completeness:

- `request`: an instance of [request-promise](https://www.npmjs.com/package/request-promise) used to make all HTTP requests.
- `loader` is an instance of [DataLoader](https://github.com/facebook/dataloader). This is the library we use for fetching data and avoiding sending a bunch of duplicate requests to a data source during a single request to GraphQL.
