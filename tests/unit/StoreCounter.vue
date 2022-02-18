<template>
  <div class="app">
    <h1>StoreCounter component</h1>
    <p>Count: {{ state.count }}</p>
    <div>
      <button id="increment" @click="increment">Increment</button><br>
      <button id="undo" @click="undo" :disabled="!canUndo">Undo</button><br>
      <button id="redo" @click="redo" :disabled="!canRedo">Redo</button>
    </div>
  </div>
</template>

<script>
import createStore from '@/main';

export default {
  name: 'StoreCounter',
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
