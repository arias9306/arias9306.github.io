---
date: 2024-07-14
title: NgRx Feature Creator Function
description: The createFeature function in NgRx simplifies state management in Angular applications by reducing boilerplate code and improving readability. It allows developers to define state, actions, reducers, and selectors easily, and supports additional selectors through the extraSelectors option.
tags: ['angular', 'ngrx']
category: NgRx
---

The `createFeature` function in **NgRx** simplifies state management in Angular applications by reducing boilerplate code and improving readability. It allows developers to define `state`, `actions`, `reducers`, and `selectors` easily, and supports additional selectors through the extraSelectors option.

## What is a Feature in NgRx?

In NgRx, a **feature** is a slice of the application state that is managed by a specific reducer and is often related to a specific domain or module of your application. For instance, in an e-commerce application, you might have features like `products`, `cart`, and `user`.

## Introducing the `createFeature` Function

The `createFeature` function in **NgRx** is a utility that simplifies the creation and management of feature states. It provides a more concise and readable way to define a feature, its initial state, and the associated reducer.

:::note
The `createFeature` function reduces repetitive code in selector files by generating a feature selector and child selectors for each feature state property
:::

## Benefits of Using `createFeature`

- **Simplification**: Reduces boilerplate code by combining multiple steps into a single function.
- **Clarity**: Enhances code readability and maintainability by providing a clear and structured way to define features.
- **Integration**: Works well with other NgRx functions and utilities, making it easier to manage complex state logic.

## How to Use `createFeature`

It accepts an object containing a feature name and a feature reducer as the input argument:

```ts "createFeature" title="feature-creator.ts"
import { createFeature, createReducer, on } from '@ngrx/store';
import { LoadBooksActions } from './actions';

export const initialState: State = {
  books: [],
  isLoading: false,
  query: '',
};

export const booksFeature = createFeature({
  name: 'books',
  reducer: createReducer(
    initialState,
    on(
      LoadBooksActions.loadBooksSuccessful,
      (state, { books }): State => ({
        ...state,
        books,
      }),
    ),
  ),
});
```

```ts "booksFeature" title="app.config.ts"
export const appConfig: ApplicationConfig = {
  providers: [provideStore(), provideState(booksFeature)],
};
```

An object created with the `createFeature` function includes a _feature name_, a _feature reducer_, a _feature selector_, and _selectors_ for each property of the feature state. All generated selectors have the **"select"** prefix, and the feature selector has the **"State"** suffix. For example, if the feature name is **"books"** the feature selector is named `selectBooksState`.

```ts title="feature-creator.ts"
const { name, reducer, selectBooksState, selectBooks, selectIsLoading, selectQuery } = booksFeature;
```

The generated selectors can be used on their own or as building blocks to create other selectors.

```ts title="selectors.ts"
import { createSelector } from '@ngrx/store';

export const selectBookListPageViewModel = createSelector(
  booksFeature.selectBooks,
  booksFeature.selectLoading,
  (books, loading) => ({ books, loading }),
);
```

The `createFeature` function can also provide additional selectors for the feature state using the `extraSelectors` option

```ts "extraSelectors" title="feature-creator.ts"
import { createFeature, createReducer, on } from '@ngrx/store';

export const initialState: State = {
  /** **/
};

export const booksFeature = createFeature({
  name: 'books',
  reducer: /** **/,
  extraSelectors: ({ selectQuery, selectBooks }) => ({
    selectFilteredBooks: createSelector(selectQuery, selectBooks, (query, books) =>
      books.filter((book) => book.title.includes(query)),
    ),
  }),
});
```

The `extraSelectors` option accepts a function that takes the generated **selectors** as input and returns an object containing any additional **selectors**. This allows us to define as many extra selectors as needed.

:::caution
The `createFeature` function cannot be used for features whose state contains optional properties. In other words, all state properties must be included in the initial state object.
:::

## Useful Links

- [GitHub - Source Code](https://github.com/arias9306/blog-src/tree/main/apps/ngrx)
- [NgRx - Feature Creators](https://ngrx.io/guide/store/feature-creators)
- [Angular NgRx - How to use Feature Creator](https://www.youtube.com/watch?v=bHw8SV4SNUU&ab_channel=DecodedFrontend)
