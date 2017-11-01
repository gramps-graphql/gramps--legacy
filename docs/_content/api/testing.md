---
title: Test Helpers
---

These functions are used to make it easier to write tests for GrAMPS data sources.

- 
{:toc}

##### `expectMockFields(resolver, fieldArray)`

Creates Jest tests for each field in `fieldArray` to ensure that the `resolver` returns a mock value for it.

> **NOTE:** This helper is intended for use with mock resolvers.

###### Parameters

- `resolver`: a mock resolver for a given GraphQL type
- `fieldArray`: an array of field names that should be mocked

###### Return Value

Returns a [Jest test](https://facebook.github.io/jest/docs/en/api.html#testname-fn).

###### Example

Assuming type `PFX_MyType` with two fields, `fieldOne` and `fieldTwo`, which both have mock resolvers defined:

```js
import resolvers from '../src/resolvers';

describe('PFX_MyType', () => {
  const mockResolver = resolvers.mockResolvers.PFX_MyType();
  expectMockFields(mockResolver, ['fieldOne', 'fieldTwo']);
});
```

##### `expectMockList(resolver, fieldArray)`

Creates Jest tests for each field in `fieldArray` to ensure that the `resolver` returns an instance of [`MockList`](http://dev.apollodata.com/tools/graphql-tools/mocking.html#Using-MockList-in-resolvers).

> **NOTE:** This helper is intended for use with mock resolvers.

###### Parameters

- `resolver`: a mock resolver for a given GraphQL type
- `fieldArray`: an array of field names that should be mocked

###### Return Value

Returns an array of [Jest tests](https://facebook.github.io/jest/docs/en/api.html#testname-fn).

###### Example

Assuming type `PFX_MyType` with two fields, `fieldOne` and `fieldTwo`, which both use `MockList` to generate an array of mock data:

```js
import resolvers from '../src/resolvers';

describe('PFX_MyType', () => {
  const mockResolver = resolvers.mockResolvers.PFX_MyType();
  expectMockList(mockResolver, ['fieldOne', 'fieldTwo']);
});
```

##### `expectNullable(resolver, fieldArray)`

Creates Jest tests for each field in `fieldArray` to ensure that the `resolver` returns `null` if a value isn’t found for the given field.

> **NOTE:** This helper is intended for use with field resolvers.

###### Parameters

- `resolver`: a mock resolver for a given GraphQL type
- `fieldArray`: an array of field names that should be mocked

###### Return Value

Returns an array of [Jest tests](https://facebook.github.io/jest/docs/en/api.html#testname-fn).

###### Example

Assuming type `PFX_MyType` with one nullable field, `fieldOne`:

```js
import resolvers from '../src/resolvers';

describe('PFX_MyType', () => {
  const resolver = resolvers.dataResolvers.PFX_MyType;
  expectNullable(resolver, ['fieldOne']);
});
```
