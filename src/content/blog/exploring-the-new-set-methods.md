---
date: 2024-07-08
title: Exploring the New Set Methods in JavaScript
description: JavaScript's Set object has always been a powerful tool for handling collections of unique values. With the recent introduction of several new methods, working with sets has become even more intuitive and efficient. Now, we'll dive into the new Set methods `intersection()`, `union()`, `difference()`, `symmetricDifference()`, `isSubsetOf()`, `isSupersetOf()`, and `isDisjointFrom()`.
tags: ['Javascript']
category: Javascript
---

JavaScript's Set object has always been a powerful tool for handling collections of unique values. With the recent introduction of several new methods, working with sets has become even more intuitive and efficient.

Now, we'll dive into the new Set methods: `intersection()`, `union()`, `difference()`, `symmetricDifference()`, `isSubsetOf()`, `isSupersetOf()`, and `isDisjointFrom()`.

## `intersection()`

The `intersection()` method returns a new set containing elements that are present in both the original set and a given set.

```js "intersection" title="intersection.js"
const friendA = new Set(['Inception', 'Interstellar', 'The Matrix']);
const friendB = new Set(['The Matrix', 'Avatar', 'Inception']);

const commonMovies = friendA.intersection(friendB);
console.log(commonMovies); // -> Set { 'Inception', 'The Matrix' }
```

## `union()`

The `union()` method returns a new set containing all unique elements from both sets.

```js "union" title="union.js"
const recipeA = new Set(['flour', 'sugar', 'eggs']);
const recipeB = new Set(['sugar', 'milk', 'butter']);

const allIngredients = recipeA.union(recipeB);
console.log(allIngredients); // -> Set { 'flour', 'sugar', 'eggs', 'milk', 'butter' }
```

## `difference()`

The `difference()` method returns a new set with elements that are in the original set but not in the given set.

```js "difference" title="difference.js"
const recipe = new Set(['flour', 'sugar', 'eggs', 'milk']);
const pantry = new Set(['flour', 'eggs', 'butter']);

const missingIngredients = recipe.difference(pantry);
console.log(missingIngredients); // -> Set { 'sugar', 'milk' }
```

## `symmetricDifference()`

The `symmetricDifference()` method returns a new set with elements that are in either of the sets but not in both.

```js "symmetricDifference" title="symmetric-difference.js"
const andresHobbies = new Set(['reading', 'cycling', 'hiking', 'painting']);
const felipeHobbies = new Set(['cycling', 'swimming', 'gaming', 'hiking']);

const uniqueHobbies = andresHobbies.symmetricDifference(felipeHobbies);
console.log(uniqueHobbies); // -> Set { 'reading', 'painting', 'swimming', 'gaming' }
```

## `isSubsetOf()`

The `isSubsetOf()` method checks if all elements of the original set are present in the given set. It returns true if the original set is a subset of the given set, and false otherwise.

```js "isSubsetOf" title="is-subset-of.js"
const shoppingList = new Set(['bread', 'butter', 'jam']);
const cart = new Set(['bread', 'butter', 'jam', 'milk']);

console.log(shoppingList.isSubsetOf(cart)); // -> true
```

## `isSupersetOf()`

The `isSupersetOf()` method checks if all elements of the given set are present in the original set. It returns true if the original set is a superset of the given set, and false otherwise.

```js "isSupersetOf" title="is-superset-of.js"
const inventory = new Set(['flour', 'sugar', 'eggs', 'milk', 'butter']);
const recipe = new Set(['flour', 'sugar', 'eggs']);

console.log(inventory.isSupersetOf(recipe)); // -> true
```

## `isDisjointFrom()`

The `isDisjointFrom()` method checks if the original set has no elements in common with the given set. It returns true if the sets are disjoint, and false otherwise.

```js "isDisjointFrom" title="is-disjoint-from.js"
const groupA = new Set(['Alice', 'Bob', 'Charlie']);
const groupB = new Set(['Dave', 'Eve', 'Frank']);

console.log(groupA.isDisjointFrom(groupB)); // -> true
```

## Useful Links

- [TC39 - proposal-set-methods](https://github.com/tc39/proposal-set-methods/tree/main)
- [MDN - New JavaScript Set methods](https://developer.mozilla.org/en-US/blog/javascript-set-methods/)
