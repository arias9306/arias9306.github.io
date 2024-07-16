---
date: 2024-07-16
title: NgRx Meta-Reducers
description: Meta-reducers in NgRx are a clever tool that lets you intercept and change actions or state before they go to your reducers. They act as enhanced reducers, allowing you to handle important jobs like managing state loading, tracking actions for logs, and solving issues.
tags: ['angular', 'ngrx']
category: NgRx
---

Meta-reducers in **NgRx** are a clever tool that lets you intercept and change actions or state before they go to your reducers. They act as enhanced reducers, allowing you to handle important jobs like managing state loading, tracking actions for logs, and solving issues.

- **Definition and Purpose**: Meta-reducers wrap other reducers to enhance or modify their behavior. They can be applied to all actions or selectively to specific ones.

- **Usage**: Meta-reducers are registered using the `StoreModule.forRoot` or `StoreModule.forFeature` methods. They also utilize the `provideState` function. These meta-reducers receive the current state and action as inputs, allowing them to modify these inputs before passing them on to the next reducer.

## How to use

```ts title="meta-reducer.ts"
export function log(reducer: ActionReducer<any>): ActionReducer<any> {
  return function (state, action) {
    console.log('state ->', state);
    console.log('action ->', action);
    return reducer(state, action);
  };
}

export const metaReducers: MetaReducer<any>[] = [log];
```

```ts "metaReducers" title="app-config.ts" ins={6}
import { metaReducers } from './meta-reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(),
    provideState(booksFeature.name, booksFeature.reducer, { metaReducers }),
    provideEffects(BooksEffect),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
};
```

```bash
state  -> {books: Array(0)}
action -> {type: '[Books Api] Load Books'}
state  -> {books: Array(0)}
action -> {type: '[Books Api] Load Books Successful', books: Array(8)}
```

### Logger Meta-Reducer

Meta-reducer to log each action dispatched

```ts title="logger-meta-reducer.ts"
export function loggerMetaReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return (state, action) => {
    console.log('State before:', state);
    console.log('Action:', action);
    const newState = reducer(state, action);
    console.log('State after:', newState);
    return newState;
  };
}

export const metaReducers: MetaReducer<any>[] = [loggerMetaReducer];
```

### State Rehydration Meta-Reducer

Meta-reducer to rehydrate state from local storage:

```ts title="logger-meta-reducer.ts"
export function rehydrateMetaReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return (state, action) => {
    const storedState = localStorage.getItem('appState');
    if (storedState) {
      state = JSON.parse(storedState);
    }
    const newState = reducer(state, action);
    localStorage.setItem('appState', JSON.stringify(newState));
    return newState;
  };
}

export const metaReducers: MetaReducer<any>[] = [rehydrateMetaReducer];
```

With these meta-reducers, every action in your app is tracked, and the state is saved and restored between uses
