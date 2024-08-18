---
date: 2024-08-18
title: 'Introduction to @ngrx/signal Store'
description: Managing application state in Angular can be tricky, especially as your app grows. @ngrx/signal Store, a new tool from the NgRx team, aims to make this easier. It’s designed to work with Angular Signals, offering a simple, efficient way to handle reactive data.
tags: ['angular', 'ngrx']
category: NgRx
---

Managing application state in Angular can be tricky, especially as your app grows. `@ngrx/signal` Store, a new tool from the **NgRx team**, aims to make this easier. It’s designed to work with Angular Signals, offering a simple, efficient way to handle reactive data.

`@ngrx/signal` Store is lightweight and easy to use, helping you write cleaner code without slowing down your app. It’s also flexible and scalable, growing with your app while ensuring type safety to catch errors early.

## Key Principles

- **Easy to Use**: Designed to be simple, making state management easy for developers.
- **Light and Fast**: Adds very little extra code, keeping your app fast and efficient.
- **Clear and Concise**: Promotes writing clean and easy-to-read code.
- **Flexible and Scalable**: Built to be flexible, allowing for the creation of modular, scalable components.
- **Opinionated, but Flexible**: Offers helpful guidelines but lets you customize where needed.
- **Type-safe**: Emphasizes type safety to prevent errors and ensure reliability during development.

## How to Create a Store

Creating a store in `@ngrx/signal` Store is simple and flexible. You start by using the `signalStore` function, which helps you build a `SignalStore`. This function takes in various store features, allowing you to add state, computed signals, and methods to your store, making it adaptable to your needs.

One key feature you'll use is `withState`, which adds state slices to your store. When you define a state slice, it starts with an initial state, which must be an object or record. For each piece of state you add, a corresponding signal is automatically created. **This also applies to nested properties—deeply nested signals are generated as needed, only when they're accessed.**

The result of calling `signalStore` is an **injectable service** that you can use throughout your application wherever you need it.

```ts "signalStore" title="shopping-car.store.ts"
import { signalStore, withState } from '@ngrx/signals';
import { ShoppingCardItems } from '../models/shopping-card-item.model';

type ShoppingCarState = {
  items: ShoppingCardItems[];
  isLoading: boolean;
  filter: { query: string; order: 'asc' | 'desc' };
};

const initialCarState: ShoppingCarState = {
  items: [],
  isLoading: false,
  filter: {
    query: '',
    order: 'asc',
  },
};

export const ShoppingCarStore = signalStore(withState(initialCarState));
```

The `ShoppingCarStore` instance will contain the following properties:

- `items: Signal<ShoppingCardItems[]>`
- `isLoading: Signal<boolean>`
- `filter: DeepSignal<{ query: string; order: 'asc' | 'desc' }>`
- `filter.query: Signal<string>`
- `filter.order: Signal<'asc' | 'desc'>`

## Providing and Injecting the SignalStore

In @ngrx/signal Store, you have the flexibility to provide your `SignalStore` either locally or globally, depending on your application's needs.

### **Component Level**

When you provide a `SignalStore` at the **component level**, it’s tied to that component’s lifecycle. This means the store is created when the component is instantiated and destroyed when the component is destroyed. This approach is ideal for managing **local or component-specific state**. For example, if a store is only relevant to a particular component or a small part of your app, you would provide it in that component’s `providers` array.

```ts "ShoppingCarStore" title="shopping-car.component.ts"
@Component({
  selector: 'app-shopping-car',
  templateUrl: './shopping-car.component.html',
  providers: [ShoppingCarStore], // Providing the store locally at the component level
})
export class ShoppingCarComponent {
  private shoppingCarStore = inject(ShoppingCarStore);
}
```

### **Global Store**

If your store needs to be accessible throughout your entire application, you can provide it globally by setting the `providedIn` property to `root` when defining the store. This registers the store with the **root injector**, making it a **singleton** that can be injected anywhere in the app. This is useful for managing **global state** that needs to be shared across multiple components or services.

```ts "providedIn"  title="shopping-car.store.ts"
export const ShoppingCarStore = signalStore({ providedIn: 'root' }, withState(initialCarState));
```

### When to Use Each Approach

- **Component Level:** Use this when the store is only relevant to a specific component or a small section of your app. This keeps the store’s lifecycle tightly coupled to the component, ensuring it is created and destroyed along with the component.

- **Global Store:** Use this when the store’s state needs to be accessed by multiple parts of the app, ensuring that all components or services that depend on this state are using the same instance of the store.

## Reading State

When you create a `SignalStore` and define state slices, each slice automatically generates a signal that allows you to access the state values easily. These signals can be used directly in your components or services to read the current state.

Assume we have a `ShoppingCarStore` with a state slice that contains items in the car. Here’s how you can read and use that state:

```angular-ts title="shopping-list.component.ts"
import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ShoppingCarStore } from './store/shopping-car.store';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  template: `
    <p>Items: {{ items() | json }}</p>
    <p>Loading: {{ isLoading() }}</p>
    <!--  The DeepSignal value can be read in the same way as Signal. -->
    <p>Pagination: {{ filter() | json }}</p>
    <!--  Nested signals are created as DeepSignal properties. -->
    <p>Query: {{ filter.query() }}</p>
    <p>Order: {{ filter.order() }}</p>
  `,
  imports: [JsonPipe],
  providers: [ShoppingCarStore],
})
export class ShoppingCarComponent {
  private readonly shoppingCarStore = inject(ShoppingCarStore);

  items = this.shoppingCarStore.items;
  isLoading = this.shoppingCarStore.isLoading;
  filter = this.shoppingCarStore.filter;
}
```

- **State Signals:** Each state slice in the `SignalStore` automatically creates a signal. For example, `shoppingCarStore.items` gives you access to the `items` array in the car.

- **DeepSignal:** For nested state properties, `DeepSignal` values are created automatically. You can read them in the same way as regular signals. For example, `filter` has nested properties , you can access them with `shoppingCarStore.filter.query` and `shoppingCarStore.filter.order` .

---

## Defining Computed Signals

Computed signals are an essential feature in `@ngrx/signal` Store, allowing you to derive new values based on the existing state or other computed signals. These are defined using the `withComputed` feature.

### How to Define Computed Signals

To add computed signals to your `SignalStore`, use the `withComputed` feature. This feature takes a factory function that creates a dictionary of computed signals. The factory function executes in the context of the store and has access to the state and other computed signals.

- **Create the Factory Function:** The factory function takes an object that provides access to the store's state and any existing computed signals.

- **Return Computed Signals:** The factory function should return an object where each key represents a computed signal and its value is a function that computes the signal based on the state and other signals.

Let's enhance our previous example by adding computed signals to calculate the total number of items and the total price.

```ts "withComputed" title="shopping-car.store.ts"
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
);
```

- **Factory Function:** The `withComputed` feature accepts a factory function that is called with the current state and existing signals. In this case, `{ items }` is the state slice.

- **Returning Computed Signals:** The function returns an object where `totalItems` and `totalPrice` are computed based on the `items` state. These computed signals are reactive and will automatically update when the state changes.

### Using Computed Signals in a Component

In your Angular component, you can use these computed signals just like any other state signals:

```angular-ts title="shopping-list.component.ts"
import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ShoppingCarStore } from './store/shopping-car.store';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  template: `
    <p>Total Items: {{ totalItems() }}</p>
    <p>Total Price: {{ totalPrice() }}</p>
  `,
  providers: [ShoppingCarStore],
})
export class ShoppingCarComponent {
  private readonly shoppingCarStore = inject(ShoppingCarStore);

  totalItems = this.shoppingCarStore.totalItems;
  totalPrice = this.shoppingCarStore.totalPrice;
}
```

By defining computed signals, you can efficiently derive and manage values based on your store's state, keeping your logic clean and encapsulated within the store.

## Defining Store Methods

In `@ngrx/signal` Store, you can add methods to your store using the `withMethods` feature. These methods can be used to update the state, trigger computed signals, or perform side effects like asynchronous operations.

### How to Define Store Methods

To add methods to your `SignalStore`, you use the `withMethods` feature, which takes a factory function as an argument. This factory function returns an object containing the methods you want to add to your store. **The factory function has access to the store's instance, including its state, computed signals, and any previously defined methods.**

Let's expand our shopping car store by adding methods to add, remove, and clear items, as well as perform an asynchronous side effect like saving the car to a server.

```ts "withMethods" title="shopping-car.store.ts"
import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ShoppingCarItems } from '../models/shopping-car-item.model';

type ShoppingCarState = { ... };

const initialCarState: ShoppingCarState = { ... };

export const ShoppingCarStore = signalStore(
  withState(initialCarState),
  withComputed(({ items }) => ({ ... })),
  withMethods((store) => ({
    addItem(item: ShoppingCarItems) {
      patchState(store, { items: [...store.items(), item] });
    },
  }))
);

```

- **State Updates with `patchState`:** The `patchState` function is used to update specific pieces of state in a type-safe and immutable manner. For example, the `addItem` method adds a new item to the car by creating a new array of items and updating the state with `patchState`.

### Using Store Methods in a Component

Here’s how you might use these methods in a component:

```angular-ts title="shopping-list.component.ts"
import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ShoppingCarStore } from './store/shopping-car.store';

@Component({
  selector: 'app-shopping-car',
  standalone: true,
  template: `
    <p>Items: {{ items() | json }}</p>

    <p>Total Items: {{ totalItems() }}</p>
    <p>Total Price: {{ totalPrice() }}</p>

    <button (click)="add()">add</button>
  `,
  imports: [JsonPipe],
  providers: [ShoppingCarStore],
})
export class ShoppingCarComponent {
  private readonly shoppingCarStore = inject(ShoppingCarStore);

  items = this.shoppingCarStore.items;

  totalItems = this.shoppingCarStore.totalItems;
  totalPrice = this.shoppingCarStore.totalPrice;

  add() {
    this.shoppingCarStore.addItem({
      id: 1,
      name: 'New Item',
      price: 100,
      quantity: 1,
    });
  }
}
```

## Reactive Store Methods

In more complex scenarios where managing asynchronous side effects becomes essential, integrating RxJS into your `SignalStore` methods is highly beneficial. RxJS allows you to handle streams of data, perform complex transformations, and manage side effects in a reactive manner.

To create a reactive method within a `SignalStore` that leverages RxJS, you can use the `rxMethod` function provided by the `rxjs-interop` plugin.

### How to Define Reactive Store Methods

To define a reactive method in your `SignalStore`, you can use the `rxMethod` function in conjunction with RxJS operators. This function allows you to create methods that return observables, which can handle asynchronous data streams, perform side effects, and interact with your store's state.

Let's enhance our shopping car store by adding a reactive method to save the car to a server using RxJS.

```ts "rxMethod" title="shopping-car.store.ts"
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap } from 'rxjs';
import { ShoppingCarItems } from '../models/shopping-car-item.model';
import { ShoppingCarService } from '../service/shopping-car.service';

type ShoppingCarState = { ... };

const initialCarState: ShoppingCarState = { ... };

export const ShoppingCarStore = signalStore(
  withState(initialCarState),
  withComputed(({ items }) => ({ ... })),
  withMethods((store, shoppingCarService = inject(ShoppingCarService)) => ({
    saveItem: rxMethod<ShoppingCarItems>(pipe(switchMap((item) => shoppingCarService.saveItem(item)))),
  }))
);
```

- **RxJS Integration with `rxMethod`:** The `rxMethod` function allows you to create a store method that returns an observable.

By using `rxMethod`, you can create reactive, RxJS-powered methods in your `SignalStore`, enabling more complex asynchronous data flows and side effects while maintaining clean, reactive state management within your Angular applications.
