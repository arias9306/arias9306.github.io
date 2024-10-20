---
date: 2024-10-20
title: NgRx Signal Store | Custom Store Features
description: Custom SignalStore features provide a strong way to add extra functionality and organize common patterns, making it easier to reuse and share code across different stores. This helps keep your code more organized and reduces repetition in your application.
tags: ['angular', 'ngrx']
category: NgRx
---

Custom SignalStore features provide a strong way to add extra functionality and organize common patterns, making it easier to reuse and share code across different stores. This helps keep your code more organized and reduces repetition in your application.

## What Are Custom Features?

A custom feature in SignalStore is a reusable set of state slices, computed signals, or methods that can be applied to multiple stores. By creating custom features, you can keep your codebase DRY (Don’t Repeat Yourself), make state management consistent, and easily add new functionality to your app.

```ts "signalStoreFeature" title="user-preferences.feature.ts"
import { computed } from '@angular/core';
import { signalStoreFeature, withState, withComputed } from '@ngrx/signals';

export type PreferencesState = {
  theme: 'light' | 'dark';
  language: string;
  notificationsEnabled: boolean;
};

export function withUserPreferences() {
  return signalStoreFeature(
    withState<PreferencesState>({
      theme: 'light',
      language: 'en',
      notificationsEnabled: true,
    }),
    withComputed(({ theme, language, notificationsEnabled }) => ({
      isDarkMode: computed(() => theme() === 'dark'),
      isEnglish: computed(() => language() === 'en'),
    })),
  );
}
```

### Using the `withUserPreferences`

```ts "withUserPreferences" title="preference.store.ts"
export const PreferencesStore = signalStore(withUserPreferences());
```

## Custom Store Features with Inputs

Custom store features can also accept **inputs** to become more flexible, allowing them to adapt based on the store they are used in. These inputs can include state, computed signals, or methods that the store provides, making the feature more customizable.

```ts "{ state: type<{ items: Entity[] }>() }" title="filter.feature.ts"
import { computed } from '@angular/core';
import { signalStoreFeature, type, withComputed, withState } from '@ngrx/signals';

export type FilterState = { searchTerm: string };

export function withFilter() {
  return signalStoreFeature(
    { state: type<{ items: Entity[] }>() },
    withState<FilterState>({ searchTerm: '' }),
    withComputed(({ items, searchTerm }) => ({
      filteredItems: computed(() => {
        const term = searchTerm().toLowerCase();
        return items().filter((item) => item.name.toLowerCase().includes(term));
      }),
    })),
  );
}
```

The `withFilter` feature takes the store's `items` list as an input and adds the ability to filter these items based on a search term provided by the feature. This makes it a reusable feature for any store managing a collection of items.

### Using the `withFilter`

```ts "withFilter" title="users.store.ts"
export const UsersStore = signalStore(withState({ items: [] }), withFilter());
```

Custom store features can also accept inputs to become more flexible, allowing them to adapt based on the store they are used in. These inputs can include **state**, **computed** signals, or **methods** that the store provides, making the feature more customizable. You can define the expected state slices, methods, or computed signals within the feature itself, ensuring that the store using the feature has the necessary inputs to function correctly.
