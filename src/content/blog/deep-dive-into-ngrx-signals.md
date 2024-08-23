---
date: 2024-08-23
title: 'Deep Dive into @ngrx/signal Store'
description: In this deep dive, we'll explore advanced features like lifecycle hooks, private store members, and rxMethod. These tools will help you enhance your app's state management, making it more efficient and flexible. Let's dive in and unlock the full potential of @ngrx/signals!
tags: ['angular', 'ngrx']
category: NgRx
---

In this deep dive, we'll explore advanced features like lifecycle hooks, private store members, and `rxMethod`. These tools will help you enhance your app's state management, making it more efficient and flexible. Let's dive in and unlock the full potential of `@ngrx/signals`!

## Lifecycle Hooks

The `@ngrx/signals` package includes a feature called `withHooks` that lets you add lifecycle hooks to your `SignalStore`. This means you can run specific code when your store is **initialized** or when it's **destroyed**.

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

## RxMethod

The `rxMethod` function is designed to manage side effects using RxJS within `SignalStore`. It allows you to create reactive methods that handle various input types **static values**, **signals**, or **observables** by chaining RxJS operators.

### Basic Usage

The `rxMethod` function accepts a chain of RxJS operators via the `pipe` function and returns a reactive method. This method can process inputs such as **numbers**, **signals**, or **observables**. The example below demonstrates how to log the double of a number:

```ts "rxMethod" title="weather.component.ts"
import { Component, OnInit } from '@angular/core';
import { map, pipe, tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

@Component({
  /* ... */
})
export class WeatherComponent implements OnInit {
  // This reactive method will process temperature readings
  readonly logTripledTemperature = rxMethod<number>(
    pipe(
      map((temp) => temp * 3),
      tap((tripledTemp) => console.log(`Tripled Temperature: ${tripledTemp}°C`)),
    ),
  );

  ngOnInit(): void {
    this.logTripledTemperature(15); // console: Tripled Temperature: 45°C
    this.logTripledTemperature(20); // console: Tripled Temperature: 60°C
  }
}
```

:::note
**Important Note**: By default, the `rxMethod` needs to be executed within an injection context. This means it's tied to the lifecycle of its injector and is **automatically cleaned up when the injector is destroyed**. This lifecycle management ensures that your reactive methods are properly disposed of, preventing memory leaks and keeping your app performant.
:::

### Handling Signals and Observables

When using signals or observables, the reactive method executes the chain **every time** the input value changes or a new value is emitted:

```ts "rxMethod" title="numbers.component.ts"
import { Component, OnInit, signal } from '@angular/core';
import { map, pipe, tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

@Component({
  /* ... */
})
export class NumbersComponent implements OnInit {
  number = signal(10);
  readonly logDoubledNumber = rxMethod<number>(
    pipe(
      map((num) => num * 2),
      tap(console.log),
    ),
  );

  ngOnInit(): void {
    this.logDoubledNumber(this.number); // console: 20
  }

  addNumber() {
    this.number.set(2); // console: 4
  }
}
```

For observables:

```ts "rxMethod" title="numbers.component.ts"
import { Component, OnInit } from '@angular/core';
import { interval, of, pipe, tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

@Component({
  /* ... */
})
export class NumbersComponent implements OnInit {
  readonly logDoubledNumber = rxMethod<number>(
    pipe(
      map((num) => num * 2),
      tap(console.log),
    ),
  );

  ngOnInit(): void {
    const num1$ = of(100, 200, 300);
    this.logDoubledNumber(num1$); // console: 200, 400, 600

    const num2$ = interval(2000);
    this.logDoubledNumber(num2$); // console: 0, 2, 4, ... (every 2 seconds)
  }
}
```

### API Call Handling

The `rxMethod` is ideal for API calls.

```ts "rxMethod" title="news.component.ts"
import { Component, inject, OnInit, signal } from '@angular/core';
import { concatMap, filter, pipe } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { NewsService } from './news.service';

@Component({
  /* ... */
})
export class NewsComponent implements OnInit {
  private readonly newsService = inject(NewsService);
  readonly articles = signal<Record<string, any>>({});
  readonly selectedKeyword = signal<string | null>(null);

  readonly fetchArticlesByKeyword = rxMethod<string | null>(
    pipe(
      filter((keyword) => !!keyword && !this.articles()[keyword]),
      concatMap((keyword) =>
        this.newsService.getByKeyword(keyword).pipe(
          tapResponse({
            next: (fetchedArticles) => this.addArticles(fetchedArticles),
            error: console.error,
          }),
        ),
      ),
    ),
  );

  ngOnInit(): void {
    this.fetchArticlesByKeyword(this.selectedKeyword);
  }

  addArticles(articles: any[]): void {
    this.articles.update((currentArticles) => ({
      ...currentArticles,
      [article.id]: article,
    }));
  }
}
```

### Additional Features

- **Reactive Methods without Arguments:** Use `void` as the generic type to create methods without arguments.
- **Manual Cleanup:** You can manually unsubscribe reactive methods by calling the `unsubscribe` method.
- **Initialization Outside of Injection Context:** To initialize outside an injection context, pass an injector as the second argument.
