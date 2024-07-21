---
date: 2024-07-21
title: Angular Signal Input
description: Pending.
tags: ['angular', 'signals']
category: Angular
---

Signal inputs let you get values from parent components. These values are shown using a `Signal`

- **Optional inputs**: Inputs are optional by default unless you use `input.required`. You can provide an initial value, or Angular will use `undefined` by default.

- **Required inputs**: Required inputs must always have a value of the specified input type. They are defined using the `input.required` function.

```angular-ts "input" title="app-component.ts" ins={8,10,12,17,19,21} del={7,9,11,16,18,20}
import { Component, InputSignal, input } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<div>
    <p>Counter Value: {{ counter }}</p>
    <p>Counter Value: {{ counter() }}</p>
    <p>UserName Value: {{ userName }}</p>
    <p>UserName Value: {{ userName() }}</p>
    <p>LastName Value: {{ lastName }}</p>
    <p>LastName Value: {{ lastName() }}</p>
  </div>`,
})
export class AppComponent {
  @Input() counter: number | undefined;
  counter: InputSignal<number | undefined> = input<number>();
  @Input({ required: true }) userName!: string;
  userName: InputSignal<string> = input.required<string>();
  @Input() lastName: string = 'arias';
  lastName: InputSignal<string> = input<string>('arias');
}
```

### Input Alias

Angular uses the class member name as the input name by default. However, you can alias inputs to give them a different public name.

```ts "alias" title="app-component.ts"
import { Component, InputSignal, input } from '@angular/core';

@Component(/** ... */)
export class AppComponent {
  name: InputSignal<string> = input<string>('andres', { alias: 'userName' });
}
```

```angular-html "userName" title="root-component.html"
<app-component [userName]="value" />
```
