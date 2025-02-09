---
date: 2025-02-09
title: Angular resource and rxResource API
description: Angular v19 introduces a powerful new API for handling asynchronous data the `resource` and `rxResource` APIs. These new primitives integrate seamlessly with Angular's signal-based reactivity model, making it easier to fetch, manage, and update data while keeping track of loading and error states.
tags: ['angular', 'resource-api', 'signals']
category: Angular
---

Angular v19 introduces a powerful new API for handling asynchronous data: the `resource` and `rxResource` APIs. These new primitives integrate seamlessly with Angular's signal-based reactivity model, making it easier to fetch, manage, and update data while keeping track of loading and error states.

## Why Use the Resource API?

Before `resource`, developers often relied on `HttpClient` with `Observables` or `Promises` to manage async data. While this approach worked well, it required additional RxJS operators like `switchMap` to handle reactive changes effectively. The new `resource` API simplifies this by:

- Automatically tracking dependent signals and reloading data when they change.
- Handling request cancellation to prevent race conditions.
- Providing built-in methods for local updates and manual refreshes.
- Offering `rxResource` for developers who prefer working with Observables.

## `resource`

```typescript
import { resource, Signal } from '@angular/core';
import { Component, computed, effect, signal } from '@angular/core';

interface MissionLog {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'completed';
}

@Component({ selector: 'app-mission-log', templateUrl: './mission-log.component.html' })
export class MissionLogComponent {
  missionId = signal(1);

  missionResource = resource({
    request: this.missionId,
    loader: ({ request: id }) => fetch(`https://api.spacedata.com/missions/${id}`).then((res) => res.json()),
  });

  loading = this.missionResource.isLoading;
  error = this.missionResource.error;

  nextMission() {
    this.missionId.update((id) => id + 1);
  }
}
```

### Key Takeaways:

- `request`: Tracks the `missionId` signal so the loader fetches new data when it changes.
- `loader`: Defines how the mission data is fetched.
- `isLoading` and `error`: Useful for UI updates.

### Understanding Loaders

A loader is an asynchronous function that retrieves data when the `request` signal changes. Loaders receive an object with:

- `request`: The computed value from the `request` function.
- `previous`: The previous state of the resource, which includes the last known value and status.
- `abortSignal`: A signal used to cancel previous requests to avoid race conditions.

Example of using `abortSignal` in the loader:

```typescript
missionResource = resource({
  request: this.missionId,
  loader: ({ request: id, abortSignal }) =>
    fetch(`https://api.spacedata.com/missions/${id}`, { signal: abortSignal }).then((res) => res.json()),
});
```

This ensures that if a new request is made before the previous one completes, the older request is aborted.

:::caution
Loaders are untracked, meaning that changes inside a loader function do not trigger a re-execution of the function unless the `request` signal changes.
:::

### Resource Status

The `resource` API provides several status signals to help track the loading process:

- `Idle` No valid request; loader hasn't run yet.
- `Loading` Loader is currently running.
- `Resolved` Loader has successfully completed and returned a value.
- `Error` An error occurred while fetching data.
- `Reloading` A new request is in progress while keeping the last successful value.
- `Local` The resource was updated locally via `.set()` or `.update()`.

### Reloading a Resource

The `reload` method allows you to manually re-fetch data from the loader without changing the `request` signal. This is useful when you want to refresh the data on demand, such as when a user clicks a refresh button. Calling `reload()` will re-trigger the loader while maintaining the last known successful value until the new data is fetched.

```typescript
refreshMission() {
  this.missionResource.reload();
}
```

### Updating Mission Data Locally

Sometimes, you need to modify data without fetching from the server again. The `resource` API allows local updates:

```typescript
completeMission() {
  this.missionResource.update(mission => ({ ...mission, status: 'completed' }));
}
```

This marks the mission as completed locally, without making another API request.

## `rxResource`

For developers who prefer Observables, `rxResource` provides a reactive approach using RxJS:

```typescript
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { inject, signal } from '@angular/core';

@Component({ selector: 'app-rx-mission-log', templateUrl: './rx-mission-log.component.html' })
export class RxMissionLogComponent {
  http = inject(HttpClient);
  limit = signal(5);

  missionsResource = rxResource({
    request: this.limit,
    loader: (limit) => this.http.get<MissionLog[]>(`https://api.spacedata.com/missions?limit=${limit}`),
  });
}
```

This integrates seamlessly with Angular’s existing `HttpClient` and RxJS ecosystem, automatically switching to the latest request when the limit changes.

## Conclusion

The new `resource` and `rxResource` APIs are a game-changer for handling async data in Angular. They provide:

- Simple, declarative syntax for fetching data.
- Automatic request cancellation.
- Built-in support for local updates.
- A smooth transition for developers using RxJS.
