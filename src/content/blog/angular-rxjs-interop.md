---
date: 2024-08-10
title: Angular RxJS Interop
description: The @angular/core/rxjs-interop package introduces handy tools that make it easy to link Angular Signals with RxJS Observables. This simplifies how you can work with both in your Angular applications, ensuring smoother data handling and reactivity.
tags: ['angular', 'signals']
category: Angular
---

Angular's reactive programming landscape has been significantly enriched with the introduction of the `@angular/core/rxjs-interop` package. This package provides a range of utilities designed to bridge the gap between Angular Signals and RxJS Observables, making it easier to handle reactive data streams throughout your application.

## `toSignal`

The `toSignal` function is a powerful utility that allows you to create a `Signal` that tracks the value of an Observable. Similar to Angular's `async` pipe, `toSignal` subscribes to the Observable immediately, which may trigger side effects. However, unlike the `async` pipe, `toSignal` can be used anywhere in your application, offering greater flexibility.

One of the key advantages of `toSignal` is its automatic subscription management. When you use `toSignal`, **the subscription it creates is automatically cleaned up when the component or service that called it is destroyed**. This ensures that your application remains efficient and free of memory leaks.

```angular-ts "toSignal" title="signal.component.ts"
import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { fromEvent, map } from 'rxjs';

@Component({
  selector: 'app-signal',
  standalone: true,
  imports: [AsyncPipe, JsonPipe],
  template: `
    <div>Click Observable: {{ clickEvent$ | async | json }}</div>
    <div>Click Signal: {{ clickSignal() | json }}</div>
  `,
})
export class SignalComponent {
  clickEvent$ = fromEvent(window, 'click').pipe(
    map((click) => {
      const pointerEvent: PointerEvent = click as PointerEvent;
      return {
        x: pointerEvent.clientX,
        y: pointerEvent.clientY,
      };
    }),
  );

  clickSignal = toSignal(this.clickEvent$);
}
```

:::caution
Since `toSignal` creates a subscription, it’s crucial to avoid calling it repeatedly for the same Observable. Doing so could result in multiple unnecessary subscriptions, potentially leading to unintended side effects. Instead, it's best practice to create the Signal once and reuse it throughout your application.
:::

### `initialValue`

- **Purpose**: Sets the initial value for the Signal created by `toSignal`.
- **Details**: This value will be used by the Signal until the Observable emits its first value, helping to avoid undefined states.

```ts "initialValue"
counterObservable = interval(1000);
counter = toSignal(this.counterObservable, { initialValue: 0 });
```

### `requireSync`

- **Purpose**: Ensures that the Observable emits a value immediately upon subscription.
- **Details**: If set to true, `toSignal` expects the Observable to emit synchronously. This option eliminates the need for an `initialValue`, but will throw a runtime error if the Observable doesn't emit immediately.

```ts "requireSync"
counter = new BehaviorSubject(1);
counter$ = this.counter.asObservable();
counterSignal = toSignal(this.counter$, { requireSync: true });
```

### `injector`

- **Purpose**: Provides the Injector to supply the `DestroyRef` needed for subscription cleanup.
- **Details**: If not provided, `DestroyRef` is automatically retrieved from the current injection context, ensuring that the Observable subscription is properly managed.

```angular-ts "injector" title="signal.component.ts"
import { AsyncPipe } from '@angular/common';
import { Component, effect, inject, Injector, OnInit, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

@Component({
  selector: 'app-signal',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div>Couter Observable: {{ counter$ | async }}</div>
    <div>Couter Signal: {{ counter() }}</div>
  `,
})
export class SignalComponent implements OnInit {
  private injector = inject(Injector);

  counter$ = interval(1000);
  counter!: Signal<number | undefined>;

  ngOnInit(): void {
    this.counter = toSignal(this.counter$, { injector: this.injector });
  }
}
```

### `manualCleanup`

- **Purpose**: Controls whether the subscription should be cleaned up automatically or manually.
- **Details**: When set to `true`, the subscription persists until the Observable completes, bypassing automatic cleanup through `DestroyRef`.

### `rejectErrors`

- **Purpose**: Determines how to handle errors from the Observable.
- **Details**: If enabled, `toSignal` will throw errors from the Observable back to RxJS, resulting in uncaught exceptions. The Signal will continue to return the last good value, similar to the behavior of the `async` pipe.

```angular-ts "rejectErrors" title="signal.component.ts" ins={20,28}
import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval, map } from 'rxjs';

@Component({
  selector: 'app-signal',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div>Signal {{ counter() }}</div>
    <div>Observable {{ counterObservable$ | async }}</div>
    <button (click)="logSignal()">Log</button>
  `,
})
export class SignalComponent {
  counterObservable$ = interval(1000).pipe(
    map((value) => {
      if (value > 10) {
        throw new Error('Ups');
      }
      return value;
    }),
  );

  counter = toSignal(this.counterObservable$, {
    initialValue: 0,
    rejectErrors: true,
  });

  logSignal() {
    console.log({ signal: this.counter() }); // -> 10
  }
}
```

### `equal`

- **Purpose**: Defines how equality is determined for values emitted by the Observable.
- **Details**: This option lets you specify a custom comparison function, ensuring that only significant changes are reflected in the Signal. Comparisons are also made against the `initialValue`, if provided.

## `toObservable`

The `toObservable` utility converts a Signal into an Observable, enabling you to react to Signal changes using RxJS operators. This conversion is particularly useful for integrating Angular’s reactivity model with the broader ecosystem of RxJS-based data handling.

```ts "toObservable"
counter = signal(0);
counter$ = toObservable(this.counter);
```

### How It Works

- **Effect-Driven Tracking**: `toObservable` uses an effect to monitor changes in the Signal. These changes are stored in a `ReplaySubject`, which ensures that the latest value is emitted when an Observable subscribes.
- **Timing Considerations**: The first value from the Signal may be emitted synchronously, but all subsequent values are emitted asynchronously. This ensures that even if the Signal is updated multiple times in quick succession, `toObservable` **will only emit the final**, stabilized value.
- **Synchronous vs. Asynchronous**: Unlike Observables, Signals do not provide immediate notifications of changes. This means that even if you update a Signal’s value multiple times rapidly, `toObservable` will **only emit once**, after the Signal stabilizes.

```angular-ts "toObservable" title="signal.component.ts" ins={22}
import { AsyncPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-signal',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div>Couter Observable: {{ counter$ | async }}</div>
    <div>Couter Signal: {{ counter() }}</div>
  `,
})
export class SignalComponent implements OnInit {
  counter = signal(42);
  counter$ = toObservable(this.counter);

  ngOnInit(): void {
    this.counter.set(1);
    this.counter.set(2);
    this.counter.set(3);
    //Output -> Only the final value (3) will be emitted
  }
}
```

In this example, although the Signal’s value changes multiple times, `toObservable` only emits the final stabilized value, ensuring efficient and predictable data flow.

### Injection Context

`toObservable` typically requires an injection context, such as within the construction of a component or service. If an injection context is unavailable, you can manually specify an Injector to use instead.

```angular-ts "injector" title="signal.component.ts"
import { AsyncPipe } from '@angular/common';
import { Component, effect, inject, Injector, OnInit, Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { interval, Observable } from 'rxjs';

@Component({
  selector: 'app-signal',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div>Couter Observable: {{ counter$ | async }}</div>
    <div>Couter2 Observable: {{ newCounter$ | async }}</div>
    <div>Couter Signal: {{ counter() }}</div>
  `,
})
export class Signal2Component implements OnInit {
  private injector = inject(Injector);

  counter$ = interval(1000);
  counter!: Signal<number | undefined>;
  newCounter$!: Observable<number | undefined>;

  ngOnInit(): void {
    this.counter = toSignal(this.counter$, { injector: this.injector });
    this.newCounter$ = toObservable(this.counter, { injector: this.injector });
  }
}
```

## `outputFromObservable`

The `outputFromObservable` function allows you to declare an Angular output that uses an RxJS Observable as its source. This is particularly useful when you want to emit events to parent components using an Observable. The behavior is straightforward: new values from the Observable are forwarded to the Angular output, errors need to be handled manually, and the output stops emitting when the Observable completes.

```angular-ts "outputFromObservable" title="child.component.ts"
import { Component } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { interval, Subject } from 'rxjs';

@Component({
  selector: 'app-child',
  standalone: true,
  template: `<button (click)="change()">Change Name</button>`,
})
export class ChildComponent {
  nameSubject = new Subject<string>();
  nameChange$ = this.nameSubject.asObservable();
  nameChange = outputFromObservable(this.nameChange$);

  intervalChange = outputFromObservable(interval(1000));

  change() {
    this.nameSubject.next('Andrés');
  }
}
```

```html
<app-child (nameChange)="nameChanged($event)" (intervalChange)="logInterval($event)" />
```

## `outputToObservable`

The `outputToObservable` function converts an Angular output into an Observable. This allows you to subscribe to the output using RxJS and respond to events in a reactive manner.

```angular-ts "outputToObservable"
import { AsyncPipe } from '@angular/common';
import { Component, OnInit, output, viewChild } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { interval, Observable } from 'rxjs';

@Component({
  selector: 'app-interval',
  standalone: true,
  template: `<label>Interval</label> <button (click)="changeName()">Change Name</button>`,
})
export class IntervalComponent {
  intervalChange = outputFromObservable(interval(1000));
  nameChange = output<string>();

  changeName() {
    this.nameChange.emit('Andrés');
  }
}

@Component({
  selector: 'app-root-output',
  standalone: true,
  imports: [IntervalComponent, AsyncPipe],
  template: ` <div>
    <app-interval />
    <h1>IntervalChange {{ logInterval$ | async }}</h1>
    <h1>IntervalChange {{ nameChanged$ | async }}</h1>
  </div>`,
})
export class AppOutputComponent implements OnInit {
  childComponent = viewChild.required(IntervalComponent);
  logInterval$!: Observable<number>;
  nameChanged$!: Observable<string>;

  ngOnInit(): void {
    this.logInterval$ = outputToObservable(this.childComponent().intervalChange);
    this.nameChanged$ = outputToObservable(this.childComponent().nameChange);
  }
}
```

## `takeUntilDestroyed`

The `takeUntilDestroyed` operator is a convenient way to **automatically complete an Observable when the component, directive, or service using it is destroyed**. This is essential for preventing **memory leaks** and ensuring that your Observables don’t continue running after the context they are tied to has been destroyed.

```angular-ts "takeUntilDestroyed" title="take-until-destroyed.component.ts"
import { Component, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

@Component({
  selector: 'app-take-until',
  standalone: true,
  template: ``,
})
export class TakeUntilDestroyedComponent implements OnInit {
  ngOnInit(): void {
    interval(1000)
      .pipe(takeUntilDestroyed())
      .subscribe((value) => console.log(value));
  }
}
```

### `DestroyRef`

```angular-ts "takeUntilDestroyed" title="take-until-destroyed.component.ts"
import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

@Component({
  selector: 'app-child-interval',
  standalone: true,
  template: `<label>Child Interval</label>`,
})
export class ChildIntervalComponent {
  destroyRef = inject(DestroyRef);
}

@Component({
  selector: 'app-parent-interval',
  standalone: true,
  imports: [ChildIntervalComponent, AsyncPipe],
  template: ` <div>
    @if (visible()) {
    <app-child-interval />
    }
    <br />
    <button (click)="hideOrShow()">Destroy Child</button>
  </div>`,
})
export class ParentIntevalComponent {
  childComponent = viewChild(ChildIntervalComponent);
  visible = signal(true);

  intervalEffect = effect(() => {
    const child = this.childComponent();
    if (child) {
      interval(1000)
        .pipe(takeUntilDestroyed(child.destroyRef))
        .subscribe((value) => console.log('Parent', value));
    }
  });

  hideOrShow() {
    this.visible.update((visible) => !visible);
  }
}

```

In this code, we use the `takeUntilDestroyed` operator and pass the `destroyRef` from the child component. This means that when the child component is destroyed, the interval will automatically stop running.
