---
date: 2025-02-01
title: Angular linkedSignal
description: A Linked Signal is a computed property derived from one or more existing Signals. It automatically recalculates its value whenever any of its dependent Signals change.
tags: ['angular', 'linkedSignal', 'signals']
category: Angular
---

A `linkedSignal` is a type of signal that stays connected to another value. Unlike a regular `signal`, which might become outdated when its dependencies change, `linkedSignal` always updates itself when needed.

:::note
[`linkedSignal`](https://angular.dev/guide/signals/linked-signal) is still in [developer preview](https://angular.dev/reference/releases#developer-preview). This means it might change before it becomes a stable feature.
:::

### Why Use `linkedSignal`?

Let’s say you are making a **fantasy RPG character creator**. Players can pick a character class (like Warrior, Mage, or Rogue), and each class comes with a default weapon.

#### The Old Way Using Regular Signals

```typescript
@Component({
  /* ... */
})
export class CharacterCreator {
  availableClasses = signal<string[]>(['Warrior', 'Mage', 'Rogue']);
  defaultWeapons = signal<Record<string, string>>({
    Warrior: 'Sword',
    Mage: 'Staff',
    Rogue: 'Dagger',
  });

  selectedClass = signal(this.availableClasses()[0]);
  selectedWeapon = signal(this.defaultWeapons()[this.selectedClass()]);

  changeClass(newClassIndex: number) {
    this.selectedClass.set(this.availableClasses()[newClassIndex]);
    this.selectedWeapon.set(this.defaultWeapons()[this.selectedClass()]);
  }

  removeWarriorClass() {
    this.availableClasses.set(['Mage', 'Rogue')
  }
}
```

This setup has a problem. If `availableClasses` changes, `selectedClass` could point to a class that no longer exists. Also, `selectedWeapon` does not update automatically when `selectedClass` changes.

### The Better Way with `linkedSignal`

Using `linkedSignal`, we make sure `selectedWeapon` always updates when `selectedClass` changes.

```typescript
@Component({
  /* ... */
})
export class CharacterCreator {
  availableClasses = signal<string[]>(['Warrior', 'Mage', 'Rogue']);
  defaultWeapons = signal<Record<string, string>>({
    Warrior: 'Sword',
    Mage: 'Staff',
    Rogue: 'Dagger',
  });

  selectedClass = linkedSignal(() => this.availableClasses()[0]);
  selectedWeapon = linkedSignal(() => this.defaultWeapons()[this.selectedClass()]);

  changeClass(newClassIndex: number) {
    this.selectedClass.set(this.availableClasses()[newClassIndex]);
  }

  removeWarriorClass() {
    this.availableClasses.set(['Mage', 'Rogue')
  }
}
```

With `linkedSignal`:

- `selectedClass` updates to the first class if the class list changes.
- `selectedWeapon` automatically updates when `selectedClass` changes.

### Keeping the User’s Selection

Sometimes, we want to keep the user’s selection if it is still valid. If the class list changes but still includes the chosen class, we don’t want to reset it.

```typescript
@Component({
  /* ... */
})
export class CharacterCreator {
  availableClasses = signal<string[]>(['Warrior', 'Mage', 'Rogue']);
  defaultWeapons = signal<Record<string, string>>({
    Warrior: 'Sword',
    Mage: 'Staff',
    Rogue: 'Dagger',
  });

  selectedClass = linkedSignal<string[], string>({
    source: this.availableClasses,
    computation: (newClasses, previous) =>
      previous && newClasses.includes(previous.value) ? previous.value : newClasses[0],
  });

  selectedWeapon = linkedSignal(() => this.defaultWeapons()[this.selectedClass()]);
}
```

Now, if the selected class still exists after an update, it remains selected. If it is removed, the first class in the new list is selected.

### Custom Comparison for Updates

By default, `linkedSignal` updates whenever its source changes. However, sometimes we only want to update when a key part of the data changes.

For example, in an **NPC editor**, we may consider an NPC the same if their ID stays the same, even if other details change.

```typescript
const activeNPC = signal({ id: 1, name: 'Eldrin', role: 'Merchant' });

const npcBackup = linkedSignal(() => this.activeNPC(), {
  equal: (a, b) => a.id === b.id,
});
```

This way, `npcBackup` only updates when a **new** NPC is assigned, not when only their details change.

### Conclusion

`linkedSignal` is a useful tool for managing state in Angular. It helps keep data in sync and reduces bugs. Whether you are building a character creator, an NPC editor, or any app with linked data, `linkedSignal` makes state management easier.
