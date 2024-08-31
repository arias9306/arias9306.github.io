---
date: 2024-08-31
title: NgRx Signal Store | Entity Management
description: The @ngrx/signals/entities plugin makes managing collections of data easier when using NgRx SignalStore. It includes the withEntities feature and several built-in tools, called entity updaters, that help you quickly add, update, or remove items in your data. This plugin simplifies the process of working with groups of items (entities), helping you manage state more efficiently without a lot of extra code, making it a great addition to any NgRx project.
tags: ['angular', 'ngrx']
category: NgRx
---

The `@ngrx/signals/entities` plugin makes managing collections of data easier when using NgRx SignalStore. It includes the `withEntities` feature and several built-in tools, called entity updaters, that help you quickly add, update, or remove items in your data. This plugin simplifies the process of working with groups of items (entities), helping you manage state more efficiently without a lot of extra code, making it a great addition to any NgRx project.

## `withEntities` Feature

The `withEntities` feature is designed to integrate entity state directly into your store. It ensures that each entity in your collection has a unique identifier, known as the `id` property, which must be of type `EntityId` (either a string or a number).

```ts "withEntities" title="books.store.ts"
import { signalStore } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';

type Book = {
  id: string;
  title: string;
  author: string;
  read: boolean;
};

export const BooksStore = signalStore(withEntities<Book>());
```

In this example, `withEntities` helps manage a collection of books, where each book has a unique `id`, a `title`, an `author`, and a `read` status. The `withEntities` feature automatically adds several useful signals to the `BooksStore`:

- **`ids: Signal<EntityId[]>`**: An array containing all the book IDs.
- **`entityMap: Signal<EntityMap<Book>>`**: A map where each book’s ID is the key, and the book itself is the value.
- **`entities: Signal<Book[]>`**: An array of all the books.

The `ids` and `entityMap` signals represent slices of the state, while `entities` is a computed signal that provides easy access to the entire collection of books. This setup makes it simple to add, update, or remove books from the collection while keeping the state organized and efficient.

## Entity Updaters

The `@ngrx/signals/entities` plugin also comes with a powerful set of standalone entity updaters. These functions are designed to work seamlessly with `patchState`, making it easier to update your entity collections. Whether you need to add new items, modify existing ones, or remove them, these updaters provide a straightforward and efficient way to manage changes in your entity state.

### Add Entity

The `addEntity` function allows you to add a new entity to your collection. If an entity with the same ID already exists in the collection, the function does nothing—it won’t overwrite the existing entity, and no error is thrown. This is particularly useful for avoiding accidental data loss.

```ts "addEntity" title="books.store.ts"
import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { addEntity, withEntities } from '@ngrx/signals/entities';

export const BooksStore = signalStore(
  withEntities<Book>(),
  withMethods((store) => ({
    addBook(book: Book): void {
      patchState(store, addEntity(book));
    },
  })),
);
```

### Add Entities

The `addEntities` function allows you to add multiple entities to your collection at once. Like `addEntity`, it ensures that if any of the entities in the collection share the same IDs as the new ones, they won’t be overwritten, and no error will be thrown. This function is especially useful when you need to batch add a group of entities while ensuring existing data remains intact.

```ts "addEntities" title="books.store.ts"
import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { addEntities, withEntities } from '@ngrx/signals/entities';

export const BooksStore = signalStore(
  withEntities<Book>(),
  withMethods((store) => ({
    addBooks(books: Book[]): void {
      patchState(store, addEntities(books));
    },
  })),
);
```

### Set Entity

The `setEntity` function is used to either add a new entity to the collection or replace an existing one with the same ID. Unlike `addEntity`, which only adds entities if they don't already exist, `setEntity` ensures that the entity is added or updated, making it a reliable choice when you want to ensure a specific entity's data is always current.

```ts "setEntity" title="books.store.ts"
import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { setEntity, withEntities } from '@ngrx/signals/entities';

export const BooksStore = signalStore(
  withEntities<Book>(),
  withMethods((store) => ({
    setBook(book: Book): void {
      patchState(store, setEntity(book));
    },
  })),
);
```

### Set Entities

The `setEntities` function allows you to add or replace multiple entities in your collection at once. This function is particularly useful when you need to ensure that a group of entities is accurately represented in your store, whether by adding new entities or updating existing ones with the same IDs.

```ts "setEntities" title="books.store.ts"
import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { setEntities, withEntities } from '@ngrx/signals/entities';

export const BooksStore = signalStore(
  withEntities<Book>(),
  withMethods((store) => ({
    setBooks(books: Book[]): void {
      patchState(store, setEntities(books));
    },
  })),
);
```

### Set All Entities

The `setAllEntities` function is used to completely replace the current entity collection with a new one. This function is ideal when you need to reset the entire collection to a new state, ensuring that the store only contains the provided entities.

```ts "setAllEntities" title="books.store.ts"
import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

export const BooksStore = signalStore(
  withEntities<Book>(),
  withMethods((store) => ({
    setAllBooks(books: Book[]): void {
      patchState(store, setAllEntities(books));
    },
  })),
);
```

### Update Entity

The `updateEntity` function allows you to modify an existing entity in the collection based on its ID. It supports partial updates, meaning you can change only specific properties of the entity. If the entity with the specified ID does not exist, no error is thrown, which helps maintain robustness in your state management.

```ts "updateEntity" title="books.store.ts"
import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { updateEntity, withEntities } from '@ngrx/signals/entities';

export const BooksStore = signalStore(
  withEntities<Book>(),
  withMethods((store) => ({
    updateBook(bookId: string, changes: Partial<Book>): void {
      patchState(store, updateEntity({ id: bookId, changes }));
    },
    toggleReadStatus(bookId: string): void {
      patchState(
        store,
        updateEntity({
          id: bookId,
          changes: (book) => ({ read: !book.read }),
        }),
      );
    },
  })),
);
```

### Update Entities

The `updateEntities` function allows you to update multiple entities in the collection by specifying their IDs or using a predicate. This function supports partial updates, so you can modify only the properties you need to change. If some of the entities with the given IDs do not exist in the collection, no error will be thrown, which helps to avoid disruptions in your state management.

```ts "updateEntities" title="books.store.ts"
import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { updateEntities, withEntities } from '@ngrx/signals/entities';

export const BooksStore = signalStore(
  withEntities<Book>(),
  withMethods((store) => ({
    updateBooksByIds(bookUpdates: { id: string; changes: Partial<Book> }[]): void {
      patchState(store, updateEntities(bookUpdates));
    },
    updateBooksByPredicate(predicate: (book: Book) => boolean, changes: Partial<Book>): void {
      patchState(store, updateEntities({ predicate, changes }));
    },
  })),
);
```

### Update All Entities

The `updateAllEntities` function allows you to apply updates to every entity in the collection. This function supports partial updates, so you can specify which properties to modify while leaving others unchanged. If there are entities in the collection that do not exist or if the collection is empty, no error is thrown, ensuring that the operation is safe and robust.

```ts "updateAllEntities" title="books.store.ts"
import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { updateAllEntities, withEntities } from '@ngrx/signals/entities';

export const BooksStore = signalStore(
  withEntities<Book>(),
  withMethods((store) => ({
    updateAllBooks(changes: Partial<Book>): void {
      patchState(store, updateAllEntities(changes));
    },
  })),
);
```

### Remove Entity

The `removeEntity` function allows you to remove an entity from the collection based on its ID. If the entity with the specified ID does not exist, no error is thrown, making the operation smooth and error-resistant. This function helps manage the state by ensuring that non-existent entities do not cause issues during removal.

```ts "removeEntity" title="books.store.ts"
import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { removeEntity, withEntities } from '@ngrx/signals/entities';

export const BooksStore = signalStore(
  withEntities<Book>(),
  withMethods((store) => ({
    removeBook(bookId: string): void {
      patchState(store, removeEntity(bookId));
    },
  })),
);
```

### Remove Entities

The `removeEntities` function allows you to remove multiple entities from the collection based on their IDs or a predicate. This function ensures that if some of the entities with the specified IDs or matching the predicate do not exist, no errors are thrown. It simplifies the process of managing and cleaning up your entity collections.

```ts "removeEntities" title="books.store.ts"
import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { removeEntities, withEntities } from '@ngrx/signals/entities';

export const BooksStore = signalStore(
  withEntities<Book>(),
  withMethods((store) => ({
    removeBooksByIds(bookIds: string[]): void {
      patchState(store, removeEntities(bookIds));
    },
    removeBooksByPredicate(predicate: (book: Book) => boolean): void {
      patchState(store, removeEntities({ predicate }));
    },
  })),
);
```

### Remove All Entities

The `removeAllEntities` function allows you to clear out all entities from the collection. This function is useful when you need to reset or empty the entire collection. If the collection is already empty, no error will be thrown, making the operation both safe and straightforward.

```ts "removeAllEntities" title="books.store.ts"
import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { removeAllEntities, withEntities } from '@ngrx/signals/entities';

export const BooksStore = signalStore(
  withEntities<Book>(),
  withMethods((store) => ({
    removeAllBooks(): void {
      patchState(store, removeAllEntities());
    },
  })),
);
```

## Custom Entity Identifier

When your entities use a custom identifier other than the default `id` property, you can specify a custom ID selector. This selector should return either a `string` or `number` and helps the NgRx Signal Store manage and identify entities correctly. It's especially useful for operations like adding, setting, or updating entities.

```ts "removeAllEntities" title="books.store.ts"
import { patchState, signalStore, withMethods } from '@ngrx/signals';
import {
  addEntities,
  removeEntity,
  SelectEntityId,
  setEntity,
  updateAllEntities,
  withEntities,
} from '@ngrx/signals/entities';

type Book = {
  isbn: string; // Custom identifier
  title: string;
  author: string;
  read: boolean;
};

// Custom ID selector function
const selectId: SelectEntityId<Book> = (book) => book.isbn;

export const BooksStore = signalStore(
  withEntities<Book>(),
  withMethods((store) => ({
    addBooks(books: Book[]): void {
      patchState(store, addEntities(books, { selectId }));
    },
    setBook(book: Book): void {
      patchState(store, setEntity(book, { selectId }));
    },
    updateAllBooks(changes: Partial<Book>): void {
      patchState(store, updateAllEntities(changes, { selectId }));
    },
    removeBook(isbn: string): void {
      patchState(store, removeEntity(isbn));
    },
  })),
);
```

The `removeEntity` function and similar updaters automatically handle the identifier selection, so you do not need to provide a custom ID selector for these operations.

## Named Entity Collections

The `withEntities` feature in NgRx Signal Store allows you to specify a custom prefix for entity properties by providing a collection name. This feature helps in organizing and managing entity collections within the store more effectively, especially when dealing with multiple types of entities.

To use named entity collections, you pass a collection name as an argument to `withEntities`. This changes the default property names from `ids`, `entityMap`, and `entities` to prefixed versions, like `todoIds`, `todoEntityMap`, and `todoEntities`.

```ts "collection: 'book'" title="books.store.ts"
import { signalStore, type } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';

export const BookStore = signalStore(withEntities({ entity: type<Book>(), collection: 'book' }));
```

### Using Named Entity Collections with Updaters

When working with named entity collections, all updaters require the collection name to correctly identify and operate on the entities. Here’s how to define updaters with a named collection:

```ts "collection: 'book'" title="books.store.ts"
import { patchState, signalStore, type, withMethods } from '@ngrx/signals';
import { addEntity, removeEntity, withEntities } from '@ngrx/signals/entities';

export const BooksStore = signalStore(
  withEntities({ entity: type<Book>(), collection: 'book' }),
  withMethods((store) => ({
    addBook(book: Book): void {
      patchState(store, addEntity(book, { collection: 'book' }));
    },
    removeBook(id: number): void {
      patchState(store, removeEntity(id, { collection: 'book' }));
    },
  })),
);
```

### Managing Multiple Collections

Named entity collections also allow you to manage multiple collections within a single store.

```ts "withEntities" title="library.store.ts"
import { signalStore, type, withMethods } from '@ngrx/signals';
import { addEntity, removeEntity, withEntities } from '@ngrx/signals/entities';

type Book = { id: string; title: string; author: string };
type Author = { id: string; name: string };
type Category = { id: string; name: string };

export const LibraryStore = signalStore(
  withEntities({ entity: type<Book>(), collection: 'book' }),
  withEntities({ entity: type<Author>(), collection: 'author' }),
  withEntities({ entity: type<Category>(), collection: 'category' }),
  withMethods((store) => ({
    addBook(book: Book): void {
      patchState(store, addEntity(book, { collection: 'book' }));
    },
    addAuthor(author: Author): void {
      patchState(store, addEntity(author, { collection: 'author' }));
    },
    addCategory(category: Category): void {
      patchState(store, addEntity(category, { collection: 'category' }));
    },
  })),
);
```

In this example, the `LibraryStore` manages three different collections: `book`, `author`, and `category`. Each collection has its own set of properties and methods, allowing for organized and scalable state management.

:::caution
While managing multiple collections within a single store is possible, it’s often recommended to use dedicated stores for each entity type for better separation of concerns and more maintainable code.
:::
