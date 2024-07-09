---
date: 2024-07-09
title: NgRx Actions Group
description: One of its lesser-known features is the createActionGroup function, which makes it easier to create and manage actions. In this post, we'll explore how createActionGroup works and how it can make your code cleaner and easier to understand.
tags: ['angular', 'ngrx']
category: NgRx
---

One of its lesser-known features is the `createActionGroup` function, which makes it easier to create and manage actions. In this post, we'll explore how `createActionGroup` works and how it can make your code cleaner and easier to understand.

## What is `createActionGroup`?

`createActionGroup` is a utility function introduced in **NgRx** to help developers define a set of related actions in a more concise and organized manner. This function not only reduces boilerplate code but also improves the readability and maintainability of your action definitions.

## Why Use `createActionGroup`?

Traditionally, defining actions in **NgRx** required creating individual action creators using the `createAction` function. While this approach works, it can become cumbersome as the number of actions grows. `createActionGroup` addresses this by allowing you to group related actions together, making your code cleaner and more manageable.

## How to Use `createActionGroup`

Let’s walk through an example to see how `createActionGroup` can be used in an Angular application. Suppose we are working on a feature related to user authentication. We might have actions for login, logout, and fetching user details.

### Traditional Approach

```ts title="actions.ts"
import { createAction, props } from '@ngrx/store';

export const login = createAction('[Auth] Login', props<{ username: string; password: string }>());

export const loginSuccess = createAction('[Auth] Login Success', props<{ user: any }>());

export const loginFailure = createAction('[Auth] Login Failure', props<{ error: any }>());

export const logout = createAction('[Auth] Logout');
```

Traditionally, creating actions in **NgRx** means writing a lot of similar code for each action. As the number of actions increases, this can become messy and hard to manage. You might end up with repetitive code, which can lead to mistakes and make your code harder to read and maintain. Keeping related actions separate also makes the code less organized. This is where `createActionGroup` helps by simplifying the process and keeping everything clean and organized.

### Using `createActionGroup`

Now, let’s see how the same actions can be defined using `createActionGroup`:

```ts "createActionGroup" title="actions.ts"
import { createActionGroup, props, emptyProps } from '@ngrx/store';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    Login: props<{ username: string; password: string }>(),
    'Login Success': props<{ user: any }>(),
    'Login Failure': props<{ error: any }>(),
    Logout: emptyProps(),
  },
});
```

:::note
The `emptyProps` function is used to define an action creator without payload within an action group.
:::

```ts title="app-component.ts"
onSubmit(username: string, password: string) {
  // action type: "[Auth] Login"
  store.dispatch(AuthActions.login({ username, password }));
}
```

As you can see, `createActionGroup` allows us to define all related actions within a single call, reducing redundancy and improving readability.

#### Benefits of createActionGroup

- **Reduced Boilerplate**: By grouping actions together, you write less code.
- **Improved Organization**: Actions related to a specific feature are organized in a single place.
- **Enhanced Readability**: The concise syntax makes it easier to understand what actions are available and what their payloads are.

#### Best Practices

- **Consistency**: Use `createActionGroup` for all new features to maintain a consistent codebase.
- **Naming Conventions**: Clearly name your action groups and events to reflect their purpose.
- **Documentation**: Even though `createActionGroup` simplifies action definitions, ensure you document your actions well for future reference.

## Useful links

- [NgRx - createActionGroup function](https://ngrx.io/api/store/createActionGroup)
