---
date: 2024-07-20
title: Angular Signals
description: In Angular, a signal is a way to keep track of a value and let others know when that value changes. Signals can hold any type of value, from simple numbers to complex data. You get a signal's value by calling its getter function, which helps Angular know where the signal is used. Signals can be either **writable**, meaning you can change their value, or **read-only**, meaning the value cannot be changed.
tags: ['angular', 'signals']
category: Angular
---

In Angular, a signal is a way to keep track of a value and let others know when that value changes. Signals can hold any type of value, from simple numbers to complex data. You get a signal's value by calling its getter function, which helps Angular know where the signal is used. Signals can be either **writable**, meaning you can change their value, or **read-only**, meaning the value cannot be changed.

:::note
When you access a signal within the template of an `OnPush` component, Angular tracks that signal as a dependency for the component. If the signal’s value changes, Angular automatically marks the component for update, ensuring it refreshes during the next change detection cycle.
:::

## Writable Signals

Writable signals offer an easy way to update their values directly. You create a writable signal by calling the signal function with an initial value. To change the value of a writable signal, you can either use the `.set()` method to assign a new value directly or use the `.update()` method to compute a new value based on the current one.

```ts "signal" ".set" ".update" title="app-component.ts"
import { Component, signal, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<div>
    <p>Counter Value: {{ counter() }}</p>
    <button (click)="setNewValue()">Set New Value</button>
    <button (click)="updateValue()">Update Value</button>
  </div>`,
})
export class AppComponent {
  counter: WritableSignal<number> = signal(0);

  setNewValue() {
    this.counter.set(150);
  }

  updateValue() {
    this.counter.update((currentValue) => currentValue + 1);
  }
}
```

## Computed Signals

Computed signals are **read-only** signals that derive their value from other signals through a derivation function. They enable you to create dynamic values based on existing signals. When a signal that a computed signal depends on (e.g., `temperature`) changes, the computed signal (e.g., `temperatureInFahrenheit`) is automatically updated.

Computed signals use lazy evaluation, meaning their derivation function is only executed when the computed value is first accessed. This avoids unnecessary calculations until the value is needed. Unlike writable signals, computed signals cannot be assigned values directly; attempting to do so will result in an error.

```ts "computed"
temperature: WritableSignal<number> = signal(20);
temperatureInFahrenheit: Signal<number> = computed(() => (this.temperature() * 9) / 5 + 32);
```

In this case, `temperatureInFahrenheit` depends on `temperature`. Whenever `temperature` changes, Angular will automatically update `temperatureInFahrenheit` accordingly.

### Computed signals are lazily evaluated and memoized

For example, `temperatureInFahrenheit` is calculated only once when first accessed, and its result is cached. If `temperature` changes, Angular will recalculate `temperatureInFahrenheit` on the next access to reflect the updated value.

This caching and recalculation approach allows you to perform expensive computations, like temperature conversions, efficiently.

### Dynamic Tracking of Computed Signal Dependencies

Computed signal dependencies are dynamic and only track signals that are actually read during their derivation.

```ts "computed"
isActive: WritableSignal<boolean> = signal(false);
value: WritableSignal<number> = signal(10);
displayMessage: Signal<string> = computed(() => {
  if (this.isActive()) {
    return `The value is ${this.value()}.`;
  } else {
    return 'No data to display.';
  }
});
```

When you access `displayMessage`, if `isActive` is false, it returns 'No data to display.' without reading the `value` signal. So, updating `value` won’t affect `displayMessage` until `isActive` becomes true.

If you set `isActive` to true and then access `displayMessage` again, the derivation function will re-run, include the `value` signal, and return the message showing `value`. If `value` changes afterward, it will invalidate `displayMessage`'s cached result.

Dependencies can be added or removed during a derivation. If `isActive` is set back to false, `value` will no longer be considered a dependency of `displayMessage`.

## Effects

Effects are operations that run whenever one or more signal values change. They are useful for reacting to updates in signals and can be created using the effect function:

```ts "effect"
import { Component, signal, WritableSignal, effect } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `...`,
})
export class AppComponent {
  userName: WritableSignal<string> = signal('andres');

  private logUserName = effect(() => {
    console.log(`The user is now ${userName()}`);
  });

  constructor() {
    effect(() => {
      console.log(`The user is now ${userName()}`);
    });
  }
}
```

Effects always execute at **least once** and **track** the signal values they read during their execution. If any of these signals change, the effect will run again. Like computed signals, effects dynamically manage their dependencies, _only monitoring the signals accessed in the latest execution_.

Effects run asynchronously as part of the change detection process.

### Use Cases for Effects

Effects are not commonly needed in most application code but can be useful in specific scenarios. Some examples where effects can be beneficial include:

- Logging data displayed and tracking changes for analytics or debugging purposes.
- Synchronizing data with `window.localStorage`.
- Implementing custom DOM behavior that can't be achieved with template syntax.
- Performing custom rendering with a `<canvas>`, charting library, or other third-party UI libraries.

### When Not to Use Effects

Avoid using effects to propagate state changes, as this can lead to issues like `ExpressionChangedAfterItHasBeenChecked` errors, infinite circular updates, or excessive change detection cycles.

To mitigate these risks, Angular by default prevents modifying signals within effects. This behavior can be overridden by setting the `allowSignalWrites` flag when creating an effect, but this should only be done if absolutely necessary. Instead, use `computed` signals to model state that depends on other signals.

### Effect Cleanup Functions

Effects may initiate long-running operations that need to be canceled if the effect is re-run or destroyed before completing. When creating an `effect`, you can optionally provide an `onCleanup` function as its first parameter. This function allows you to register a callback that will be invoked before the effect runs again or when the effect is destroyed.

```ts "onCleanup"
import { Component, signal, WritableSignal, effect } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `...`,
})
export class AppComponent {
  userName: WritableSignal<string> = signal('andres');

  private logUserName = effect((onCleanup) => {
    const user = this.userName();
    const timer = setTimeout(() => {
      console.log(`1 second ago, the user became ${user}`);
    }, 1000);

    onCleanup(() => {
      clearTimeout(timer);
    });
  });
}
```

## Reading Without Tracking Dependencies

Sometimes, you might want to read signals within a reactive function, such as a `computed` or `effect`, without creating a dependency on those signals.

For instance, if you want to log a counter value whenever `userName` changes, you could create an effect that reads both signals

```ts
import { Component, signal, WritableSignal, effect } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `...`,
})
export class AppComponent {
  userName: WritableSignal<string> = signal('andres');
  counter: WritableSignal<number> = signal(0);

  private logUserName = effect(() => {
    console.log(`User set to ${this.userName()} and the counter is ${this.counter()}`);
  });
}
```

In this example, the `effect` will log a message whenever either `userName` or `counter` changes. However, if you only want the `effect` to run when `userName` changes and not when `counter` changes, then `counter` should not be treated as a dependency.

To avoid tracking a signal read as a dependency, use the `untracked` function:

```ts "untracked"
import { Component, signal, WritableSignal, effect, untracked } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `...`,
})
export class AppComponent {
  userName: WritableSignal<string> = signal('andres');
  counter: WritableSignal<number> = signal(0);

  private logUserName = effect(() => {
    console.log(`User set to ${this.userName()} and the counter is ${untracked(this.counter)}`);
  });
}
```

Here, `untracked` prevents counter from being counted as a dependency.

Similarly, `untracked` can be useful when you need to call external code that might read signals without affecting the effect’s dependencies

```ts "untracked"
import { Component, signal, WritableSignal, effect, untracked } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `...`,
})
export class AppComponent {
  userName: WritableSignal<string> = signal('andres');

  private logUserNameApi = effect(() => {
    const user = this.userName();
    untracked(() => {
      // Calls to `loggingService` won't be considered dependencies
      this.loggingService.log(`User set to ${user}`);
    });
  });
}
```

In this example, `untracked` ensures that any signal reads within `loggingService.log` do not influence the effect's dependency tracking.
