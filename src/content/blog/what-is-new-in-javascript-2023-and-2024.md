---
date: 2024-07-07
title: What's New in JavaScript 2023 and 2024
description: In 2023 and 2024, JavaScript has seen significant updates with the introduction of several powerful methods that enhance data manipulation and streamline development processes.
tags: ['Javascript', 'ES2023', 'ES2024']
category: Javascript
---

In 2023 and 2024, JavaScript has seen significant updates with the introduction of several powerful methods that enhance data manipulation and streamline development processes.

## Array Grouping

Array Grouping is a method that allows you to group elements of an array based on a given criterion. This can be incredibly useful when you need to categorize data into different groups.

Two methods are offered, `Object.groupBy` and `Map.groupBy`. The first returns a null-prototype object, which allows ergonomic destructuring and prevents accidental collisions with global Object properties. The second returns a regular `Map` instance, which allows grouping on complex key types.

```js "groupBy" title="group-by.js"
const transactions = [
  { id: 1, amount: 500, type: 'income', date: '2024-01-15' },
  { id: 2, amount: 100, type: 'expense', date: '2024-01-17' },
  { id: 3, amount: 200, type: 'income', date: '2024-02-10' },
  { id: 4, amount: 50, type: 'expense', date: '2024-02-11' },
  { id: 5, amount: 150, type: 'income', date: '2024-03-05' },
  { id: 6, amount: 75, type: 'expense', date: '2024-03-20' },
  { id: 7, amount: 100, type: 'income', date: '2024-01-25' },
  { id: 8, amount: 60, type: 'expense', date: '2024-02-28' },
];

Object.groupBy(transactions, (transaction) => transaction.type);
// -> {income: Array(4), expense: Array(4)}

Map.groupBy(transactions, (transaction) => transaction.type);
// -> Map(2) {'income' => Array(4), 'expense' => Array(4)}
```

:::tip[`Object.groupBy(items, callbackfn)`]

- `callbackfn` should be a function that accepts two arguments. groupBy calls `callbackfn` once for each element in `items`, in ascending order, and constructs a new Object of arrays. Each value returned by `callbackfn` is coerced to a property key, and the associated element is included in the array in the constructed object according to this property key.

- `callbackfn` is called with two arguments: the value of the element and the index of the element.

```js "groupBy"
Object.groupBy(array, (num, index) => {
  return num % 2 === 0 ? 'even' : 'odd';
});
// -> { odd: [1, 3, 5], even: [2, 4] }
```

:::

### Why is Array Grouping Useful?

- **Simplifies Data Organization**: Grouping data into meaningful categories can make it easier to process and analyze.
- **Reduces Boilerplate Code**: No more writing custom grouping functions. The new methods provide a clean, built-in solution.
- **Improves Readability**: Grouped data structures are often easier to understand and work with.

### Useful links

- [MDN Web Docs - Object.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy)
- [MDN Web Docs - Map.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/groupBy)
- [TC39 - Proposal Array Grouping](https://github.com/tc39/proposal-array-grouping/)

## New Array Methods

When using methods like `sort()`, `splice()`, and `reverse()`, the original array is mutated. This can sometimes lead to unintended side effects or issues.

However, with the introduction of methods like `toSorted()`, `toSpliced()`, `toReversed()`, and `with()`, you can splice, sort, reverse, or replace elements in an array without mutating the original array. These new methods return a new array, leaving the source array unchanged. This approach enhances predictability and prevents inadvertent modifications to your data.

### `toSorted(compareFn)`

The `toSorted()` method of Array instances is a non-mutating version of the `sort()` method. It returns a new array with the elements sorted in ascending order, leaving the original array unchanged.

```js "toSorted"
// Original array of fruits
const fruits = ['banana', 'apple', 'orange', 'grapes'];

// Using toSorted() to sort the array without mutating the original array
const sortedFruits = fruits.toSorted();

console.log('Original array:', fruits); // -> ["banana", "apple", "orange", "grapes"]
console.log('Sorted array:', sortedFruits); // -> ["apple", "banana", "grapes", "orange"]
```

### `toSpliced(start, deleteCount, itemN)`

The `toSpliced()` method of Array instances is a non-mutating version of the `splice()` method. It returns a new array with specific elements removed and/or replaced at a given index, leaving the original array unchanged.

```js "toSpliced"
// Original array of numbers
const numbers = [1, 2, 3, 4, 5];

// Using toSpliced() to remove 2 elements starting at index 1, and adding 8 and 9
const splicedNumbers = numbers.toSpliced(1, 2, 8, 9);

console.log('Original array:', numbers); // -> [1, 2, 3, 4, 5]
console.log('Spliced array:', splicedNumbers); // -> [1, 8, 9, 4, 5]
```

### `toReversed()`

The `toReversed()` method of Array instances is a non-mutating version of the `reverse()` method. It returns a new array with the elements in reversed order, while leaving the original array unchanged.

```js "toReversed"
// Original array of letters
const letters = ['a', 'b', 'c', 'd'];

// Using toReversed() to get a reversed copy of the array
const reversedLetters = letters.toReversed();

console.log('Original array:', letters); // -> ["a", "b", "c", "d"]
console.log('Reversed array:', reversedLetters); // -> ["d", "c", "b", "a"]
```

### `with(index, value)`

The `with()` method of Array instances provides a non-mutating alternative to using bracket notation to change the value of a specific index. It returns a new array where the element at the specified index is replaced with the provided value, while leaving the original array unchanged.

```js "with"
// Original array of fruits
const fruits = ['banana', 'apple', 'orange', 'grapes'];

// Using with() to replace an element at a specific index
const replacedFruits = fruits.with(1, 'peach');

console.log('Original array:', fruits); // -> ['banana', 'apple', 'orange', 'grapes']
console.log('Array with replaced element:', replacedFruits); // -> ['banana', 'peach', 'orange', 'grapes']
```

## Other Array Methods

Let's explore a few lesser-known methods

### `at(index)`

The `at()` method of Array instances accepts an integer and retrieves the item located at that index. It supports both positive and negative integers, where negative integers count backward from the last item in the array.

```js
// Original array of fruits
const fruits = ['banana', 'apple', 'orange', 'grapes'];

// Using the at() method to retrieve elements by index
const lastFruit = fruits.at(-1);
const firstFruit = fruits.at(0);
const penultimateFruit = fruits.at(-2);

console.log('Fruits array:', fruits); // -> ['banana', 'apple', 'orange', 'grapes']
console.log('Last fruit:', lastFruit); // -> 'grapes'
console.log('First fruit:', firstFruit); // -> 'banana'
console.log('Penultimate fruit:', penultimateFruit); // -> 'orange'
```

### `findLastIndex(callbackFn)`

The `findLastIndex()` method of Array instances iterates through the array in reverse order and returns the index of the last element that satisfies the provided testing function. If no elements satisfy the testing function, it returns -1.

```js "findLastIndex"
// Original array of numbers
const numbers = [5, 12, 50, 130, 44];

// Function to check if element is larger than 45
const isLargeNumber = (element) => element > 45;

// Using findLastIndex() to find the index of the last element greater than 45
const lastIndex = numbers.findLastIndex(isLargeNumber);

console.log('Array:', numbers); // -> [5, 12, 50, 130, 44]
console.log('Index of last large number:', lastIndex); // -> 3
console.log('Value at index 3:', numbers.at(lastIndex)); // -> 130
```

### `findLast(callbackFn)`

The `findLast()` method of Array instances iterates through the array in reverse order and returns the value of the last element that satisfies the provided testing function. If no elements satisfy the testing function, it returns `undefined`.

```js 'findLast'
// Original array of numbers
const numbers = [5, 12, 50, 130, 44];

// Using findLast() to find the last element greater than 45
const found = numbers.findLast((element) => element > 45);

console.log('Array:', numbers); // -> [5, 12, 50, 130, 44]
console.log('Last element greater than 45:', found); // -> 130
```

## Useful Links

- [TC39 - Finished Proposals](https://github.com/tc39/proposals/blob/main/finished-proposals.md)
- [Exploringjs](https://exploringjs.com/js/book/index.html)
