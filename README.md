[![npm version](https://raster.shields.io/npm/v/@korijn/vue-store.png)](https://www.npmjs.com/package/@korijn/vue-store)
![build status](https://img.shields.io/github/workflow/status/Korijn/vue-store/ci/master)

# vue-store

Lightweight Vue 3 composition API-compatible store pattern library. Offers a simple alternative
that is on par with VueX in terms of features:

* Simple API to learn; only 1 function to create the store
* Choose between local and global store instances
* Exposed state is `readonly` to prevent modifications via accidental references
* No eagerly-evaluated getters or actions, just use `computed` and regular functions
* Undo/redo functionality for free, thanks to [immer.js](https://immerjs.github.io/immer/docs/introduction) and [rfc6902](https://github.com/chbrown/rfc6902)
* Small bundle footprint (< 3 kB unminified)

## Installing

```
npm install --save @korijn/vue-store
```

## Quick start / minimal example

This example briefly demonstrates a locally scoped store with out-of-the-box undo/redo functionality. Read on to learn more about the options provided.

```html
<template>
  <div>
    <p>Count: {{ state.count }}</p>
    <p>
      <button @click="increment">Increment</button>
      <button @click="undo" :disabled="!canUndo">Undo</button>
      <button @click="redo" :disabled="!canRedo">Redo</button>
    </p>
  </div>
</template>

<script>
import createStore from '@korijn/vue-store';

export default {
  name: 'Counter',
  setup() {
    const store = createStore({
      count: 0,
    }, {
      increment(state) {
        state.count += 1;
      },
    });
    return { ...store };
  },
};
</script>

```

## Creating a store instance

This library provides a single function `createStore` with the following signature:

```js
import createStore from '@korijn/vue-store';

const store = createStore(initialState, mutations);
```

The constructor arguments are defined as follows:

* `initialState` - the state object with which the store will be initialized. For example:
  ```js
  const initialState = {
    todos: [],
  };
  ```
* `mutations` - the mutations that you wish to expose on your store instance. These should be
  provided as an object, mapping from name to callback. When called, mutation callbacks will
  receive the current `state` as their first positional argument, and any options provided to
  the mutation as the second positional argument. For example:
  ```js
  const mutations = {
    addTodo(state, { text }) { state.todos.push({ text, status: 'open' }); },
  };
  ```
  Note: mutations cannot return anything, and must be synchronous entirely.

## Local or global store instance

You can create your store inside a component's `setup` function if you want the
store to be **locally** defined, or you can do so in a plain JS module and _import it_ from
various places accross your application to have a **globally** defined store instance.

The same holds true for any `computed` ref's you'd like to define. These don't necessarily have to
live in a component. If you want them to be globally available, just define them in a plain JS
module and import them where you need to.

## The store instance API

The `store` object returned by `createStore` provides the following keys:

* `state` - a [reactive readonly](https://v3.vuejs.org/api/basic-reactivity.html#readonly) proxy to
  the store's present state. You can return this object from a component's `setup` function to use
  it in a template, but you can just as well implement `watch`, `watchEffect` and `computed`
  expressions with it, either in components or globally in plain JS modules. For example:
  ```js
  setup() {
    const store = createStore(...);
    return {
      state: store.state,
    };
  }
  ```
* `commit(type, options)` - use this function to commit mutations to the store. `type` is the
  type of mutation, and `options` passes any relevant data to the mutation callback. For example:
  ```js
  store.commit('addTodo', { text: 'Buy groceries' });
  ```
* `...mutators` - as a convenience shorthand, you can call mutations directly as functions on the
  store. For example, the following is equivalent to the `commit` example above:
  ```js
  store.addTodo({ text: 'Buy groceries' });
  ```
* `undo()`, `redo()` - whenever you commit a mutation to the store, immer.js is used to generate
  patch objects which can be used to rollback the store's state, either backwards or forwards in
  time. Calling these functions will do so, and they will return a `bool` to indicate whether or
  not the rollback was successful. In other words: `undo()` returns `false` iff the store is
  already in its initial state, and `redo()` returns `false` iff the store is already in its final
  state. For example:
  ```js
  const success = store.undo();
  ```
* `canUndo`, `canRedo` - these are two plain `computed` refs, which will tell you whether or not
  there are undo/redo steps left in the store's mutation history. For example, you can use these
  to disable undo/redo buttons in your template:
  ```html
  <button @click='undo' :disabled="!canUndo">Undo</button>
  ```
* `past`, `future` - two more reactive readonly objects, each holding the store's mutation history
  as lists of patch objects in both directions. You can use these to display the mutation history
  in your application, or to count the amount of steps left in the history. For example:
  ```js
  const undoStepsLeft = computed(() => store.past.length);
  ```

## Demo and example project

You can see a Todo MVC application using a globally instanced store at the following URL:

https://korijn.dev/vue-store-todo-app/index.html

Source code:

https://github.com/Korijn/vue-store-todo-app

In particular the following files will be of interest for your review:

* `/src/store.js`
* `/src/App.vue`

## About

I wrote this library when I realized I needed a way to centrally manage state in a new Vue 3
application I was working on, and noticed that VueX didn't offer what I needed:

* Lazily evaluated computed state
  * VueX getters are eagerly evaluated after every mutation, which can cause applications to slow
    down
* Memory and compute-efficient undo/redo with little additional development overhead
  * VueX doesn't support this at all, only in development mode there is time travel but it uses
    deep copies of the state which is memory hungry and slow
  * Command pattern requires all mutations to support both forward and backward callbacks which is
    annoying to write
* Vue 3 support was also still very early days for VueX

At some point I found the incredible [immer.js](https://immerjs.github.io/immer/docs/introduction)
library and noticed it could _generate JSON patches in **both directions** while running mutation
callbacks_. Combining that with the [rfc6902](https://github.com/chbrown/rfc6902)
library was the key to this library's `commit` function, which works as follows:

* immer.js `produceWithPatches` is run on _non-reactive_ store state, using Vue's `toRaw`, so as to
  generate regular and inverse patches for the mutation
* The patches are applied to the store's _reactive_ state and recorded in the store's history
* Undo/redo is now simply a matter of applying patches again, and tracking in what position in the
  timeline the store is

This way, developers only need to write forward mutation callbacks, and since all state is plain
`reactive` objects, they can leverage all the regular Vue composition API utilities such as
`computed`, `watch` and `watchEffect` to their fullest extent.

## Thank you

Thank you for reading this and checking out my library. If you have any questions, bug reports, or
feature requests, feel free to create an issue.
