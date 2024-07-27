---
date: 2024-07-27
title: Angular Model Inputs
description: Model inputs are special inputs that allow two-way data binding. This means one component can send new values to another, and both components can share and update data easily.
tags: ['angular', 'signals']
category: Angular
---

Model inputs are special inputs that support **two-way data binding**. This means that one component can send new values to another, allowing both components to share and update data seamlessly.

You can make a `model` input `required` or assign it an alias, just as you would with a standard input.

Use `model` inputs in components that need to update values based on user actions. For instance, custom form controls like date pickers or combo boxes should use model inputs for their main values.

```ts "model" title="child.component.ts" ins={12} del={10,11}
import { Component, EventEmitter, Input, model, Output, ModelSignal } from '@angular/core';

@Component({
  selector: 'app-child',
  standalone: true,
  templateUrl: './child.component.html',
  styleUrl: './child.component.css',
})
export class ChildComponent {
  @Input({ required: true }) selected!: boolean;
  @Output() selectedChange = new EventEmitter<boolean>();
  selected: ModelSignal<boolean> = model<boolean>;
  // selected = model.required<boolean>; -> Make the Model required
}
```

Model inputs enable the component author to assign values to a property. Apart from this, `model` inputs function similarly to standard inputs: you can read the value by calling the signal function, even in reactive contexts like `computed` and `effect`.

When a component assigns a new value to a `model` input, Angular can propagate this value back to the component that originally bound the value to the input. This process is known as **two-way binding**, as it allows data to flow in both directions.

## Model with Signals

You can bind a writable signal to a model input.

```angular-ts title="app.component.ts"
import { Component, WritableSignal, signal } from '@angular/core';
import { ChildComponent } from './child/child.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChildComponent],
  template: `<div>
    <app-child [(selected)]="userSelected" />
  </div>`,
})
export class AppComponent {
  userSelected: WritableSignal<boolean> = signal(false);
}
```

In the example above, the `ChildComponent` component updates its `selected` model input, which then updates the `userSelected` signal in `AppComponent`. This connection keeps the `selected` and `userSelected` values in sync. **Notice that the connection uses the `userSelected` signal itself, not just its current value**.

## Model with plain properties

You can bind a writable signal to a model input.

```angular-ts title="app.component.ts"
import { Component } from '@angular/core';
import { ChildComponent } from './child/child.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChildComponent],
  template: `<div>
    <app-child [(selected)]="userSelected" />
  </div>`,
})
export class AppComponent {
  userSelected: boolean = false;
}
```

In the example above, the `ChildComponent` can update its `selected` model input, which then sends these updates to the `userSelected` property in `AppComponent`. This connection ensures that the values of `selected` and `userSelected` stay in sync.

## Change events

When you declare a `model` input in a component or directive, Angular automatically creates a corresponding output event named by appending `'Change'` to the model input’s name.

This change event is emitted whenever you update the model input by using its set or update methods.

```angular-ts "selectedChange" title="app.component.ts"
import { Component, WritableSignal, signal } from '@angular/core';
import { ChildComponent } from './child/child.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChildComponent],
  template: `<div>
    <app-child [(selected)]="userSelected" (selectedChange)="selectChanged($event)" />
  </div>`,
})
export class AppComponent {
  userSelected: WritableSignal<boolean> = signal(false);

  selectChanged(selected: boolean) {
    console.log(selected);
  }
}
```

## Differences Between `model()` and `input()`

Both `input()` and `model()` are used to define signal-based inputs in Angular, but they have key differences:

- `model()`: Defines both an **input** and an **output**. The output is named with "Change" appended to the input name, supporting two-way binding. Users can choose to use the input, the output, or both. `ModelSignal` is **writable**, meaning its value can be changed using set and update methods, and will emit changes to its output.

- `input()`: Defines a read-only input `InputSignal` that can only be changed via the template. `InputSignal` does not emit changes.

Additionally, `model` inputs do not support input transformations, unlike signal inputs.
