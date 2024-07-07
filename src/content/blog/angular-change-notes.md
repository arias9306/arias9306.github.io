---
date: 2024-07-07
title: Angular Change Detection Notes
description: Angular's change detection mechanism is one of its most powerful features, ensuring that the user interface (UI) stays in sync with the application state. However, it can also be a bit of a black box, especially for new developers. In this post, we'll demystify Angular change detection by highlighting some key points that will help you better understand and optimize your Angular applications.
tags: ['angular', 'change-detection']
category: Angular
---

Angular's change detection mechanism is one of its most powerful features, ensuring that the user interface (UI) stays in sync with the application state. However, it can also be a bit of a black box, especially for new developers. In this post, we'll demystify Angular change detection by highlighting some key points that will help you better understand and optimize your Angular applications.

Triggering of the change detection cycle can happen due to one of following reasons:

- Property marked as an `@Input` has changed.
- Manual trigger
- Using async calls such as setTimeout, event listeners, promises and so on. (Zone.js)

What Zone.js does is basically “monkey-patching” the native browser’s async methods to trigger the change detection so that we don’t have to trigger it manually. That is because in most cases there are changes that happened after an async operation.

## Important Methods

- `AplicationRef.tick()` runs the change detection on the whole application’s View Tree starting with the root View
- `ChangeDetectorRef.detectChanges()` performs a local change detection i.e. detects changes in the current View and all children Views
- `ChangeDetectorRef.markForCheck()` marks the current View and it’s ancestors dirty which will be checked in the next change detection cycle. (next detection cycle is commonly the next tick)
- `NgZone.run()` runs the code in the passed callback function inside the Angular zone i.e. all changes will be picked up by the change detection
- `NgZone.runOutsideAngular()` runs the code in the callback function outside the Angular zone which enables preventing the change detection from being triggered

## Change Detection Strategies

### Default

With this strategy, Angular performs change detection for the entire component tree on every async event that is being listened to in the application. This means that even if other component’s properties have not changed, Angular will still run a check for changes in all those components and its children on every event.

The `Default` strategy is more straightforward to use but can be less efficient for complex applications, as it may trigger unnecessary change detection cycles and lead to (sometimes massive) performance issues.

### OnPush

With the `OnPush` strategy, only components marked as dirty will be checked.

In the `OnPush` strategy, Angular only checks for input reference changes. If the reference remains the same, Angular assumes that the data has not changed and skips the change detection for that component and its children.

When using `OnPush`, you need to be careful to only modify the component’s properties by creating new references (e.g. using immutable data structures) to trigger the change detection correctly.

The `OnPush` strategy is more performant, especially for large and complex applications, as it reduces the number of change detection cycles and improves the overall application performance by also updating only some components of the tree.

The `markForCheck()` method marks all parents dirty and the next tick will check them for change detection.

To sum it up, when using OnPush strategy Angular will run change detection if:

- `@Input` is updated (by reference, not value!)
- Change detection is run manually by using `detectChanges()` or `markForCheck()`
- An event is fired from the template of a component or any of it’s children components (for example a (click) ).
- Note that `setTimeout` calls and any event listeners that are not from the template will not trigger a change detection.
- If we use an Observable as an `@Input` and we use the async pipe in the template. (because the async pipe subscribes to the observable and runs a change on every value change from the observable)

## Articles

- [Change Detection Fundamentals in Angular](https://medium.com/@antoniopk/angular-change-detection-explained-169aea595423)
- [Everything you need to know about change detection in Angular](https://angularindepth.com/posts/1053/everything-you-need-to-know-about-change-detection-in-angular)

## Videos

- [NG-NL 2016: Pascal Precht - Angular 2 Change Detection Explained](https://www.youtube.com/watch?v=CUxD91DWkGM&ab_channel=NG-NL)
- [Change Detection in Angular Pt.1 - View Checking](https://www.youtube.com/watch?v=hZOauXaO8Z8&ab_channel=DecodedFrontend)
- [Change Detection in Angular Pt.2 - The Role of ZoneJS (2023)](https://www.youtube.com/watch?v=Ys7xdebd66Y&ab_channel=DecodedFrontend)
- [Change Detection in Angular Pt.3 - OnPush Change Detection Strategy](https://www.youtube.com/watch?v=WAu7omIoerM&ab_channel=DecodedFrontend)

## More Useful Links

- [Visual Change Detection Process](https://jeanmeche.github.io/angular-change-detection/)
