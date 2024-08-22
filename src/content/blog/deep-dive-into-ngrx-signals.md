---
date: 2024-08-23
title: 'Deep Dive into @ngrx/signal Store'
description: In this deep dive, we’ll explore advanced features like lifecycle hooks, private store members, custom setups, and entity management. These tools will help you enhance your app’s state management, making it more efficient and flexible. Let’s dive in and unlock the full potential of @ngrx/signals!
tags: ['angular', 'ngrx']
category: NgRx
---

In this deep dive, we’ll explore advanced features like lifecycle hooks, private store members, custom setups, and entity management. These tools will help you enhance your app’s state management, making it more efficient and flexible. Let’s dive in and unlock the full potential of `@ngrx/signals`!

## Lifecycle Hooks

The `@ngrx/signals` package includes a feature called `withHooks` that lets you add lifecycle hooks to your `SignalStore`. This means you can run specific code when your store is **initialized** or when it’s **destroyed**.

The `withHooks` feature can be used in two ways:

- **Simple Usage:** The first way is to pass an object with `onInit` and/or `onDestroy` methods. These methods get the store instance as an argument. The `onInit` method runs in a special context that allows you to inject dependencies or use functions that need this context, like `takeUntilDestroyed`.

```ts "withHooks" title="shopping-car.store.ts"
import { computed } from '@angular/core';
import { signalStore, withComputed, withState } from '@ngrx/signals';
import { ShoppingCarItems } from '../models/shopping-car-item.model';

type ShoppingCarState = { ... };

const initialCarState: ShoppingCarState = { ... };

export const ShoppingCarStore = signalStore(
  withState(initialCarState),
  withComputed(({ items }) => ({
    totalItems: computed(() => items().reduce((sum, item) => sum + item.quantity, 0)),
    totalPrice: computed(() => items().reduce((sum, item) => sum + item.price * item.quantity, 0)),
  })),
  withMethods((store, shoppingCarService = inject(ShoppingCarService)) => ({
    addItem(item: ShoppingCarItems) {
      patchState(store, { items: [...store.items(), item] });
    },
    loadItems: rxMethod<void>(
      pipe(
        switchMap(() => shoppingCarService.loadItems().pipe(tap((result) => patchState(store, { items: [...result] }))))
      )
    ),
  })),
  withHooks({
    onInit(store) {
      store.loadItems();
    },
    onDestroy(store) {
      console.log('totalItems on destroy', store.totalItems());
    },
  })
);
```

- **Flexible Usage:** The second way is more flexible and useful if you need to share code between the `onInit` and `onDestroy` hooks or use injected dependencies in the `onDestroy` hook. Here, you pass a factory function instead of just an object. This function takes the store instance, returns an object with `onInit` and/or `onDestroy` methods, and runs in the same special context, giving you more control and reusability.

```ts "withHooks" title="shopping-car.store.ts"
export const ShoppingCarStore = signalStore(
  withState(initialCarState),
  withComputed(({ items }) => ({ ... })),
  withMethods((store, shoppingCarService = inject(ShoppingCarService)) => ({ ... })),
  withHooks((store) => {
    const logger = inject(Logger);

    return {
      onInit() {
        logger.log('OnInit');
        store.loadItems();
      },
      onDestroy() {
        logger.log('OnDestroy');
      },
    };
  }),
);
```

## Private Store Members

In `SignalStore`, you can define private members that are inaccessible from outside the store by prefixing them with an underscore (`_`). This applies to root-level state slices, computed signals, and methods, ensuring they remain internal to the store.

```ts "_" title="shopping-car.store.ts"
import { signalStore, withState } from '@ngrx/signals';
import { ShoppingCardItems } from '../models/shopping-card-item.model';

type ShoppingCarState = {
  items: ShoppingCardItems[];
  isLoading: boolean;
  filter: { query: string; order: 'asc' | 'desc' };,
  _privateItems: ShoppingCardItems[]
};

const initialCarState: ShoppingCarState = {
  items: [],
  isLoading: false,
  filter: {
    query: '',
    order: 'asc',
  },
  _privateItems: []
};

export const ShoppingCarStore = signalStore(withState(initialCarState));
```

## Custom Store Feature

## Entity Management

## RxMethod
