/*
 * Generic store pattern implementation based on Vue 3 composition API and Immer
 */
import { produceWithPatches, enablePatches, setAutoFreeze } from 'immer';
import { computed, reactive, readonly, toRaw } from 'vue';
import { applyPatch } from 'rfc6902';

const standardizePatches = (patches, inversePatches) => {
  // immer.js generates patches very efficiently, but
  // they are not rfc6902 compliant
  [patches, inversePatches].forEach((patchList) => {
    patchList.forEach((patch) => {
      patch.path = `/${patch.path.join('/')}`;
    });
  });
};

// createStore can be called to create a store pattern based on
// a given initial state object and a set of mutations
const createStore = (initialState, mutations) => {
  enablePatches();
  setAutoFreeze(false);

  // create reactive state root
  // deep clone the initial state to guarantee ownership
  const state = reactive({
    past: [],
    present: initialState,
    future: [],
  });

  // commit a mutation to the present state
  // and update history
  const commit = (type, options) => {
    const rawOptions = toRaw(options);
    // get the mutator
    const fn = mutations[type];
    // run the mutator with immer.js to generate
    // patches in both directions
    const [, patches, inversePatches] = produceWithPatches(
      toRaw(state.present), (draftState) => fn(draftState, rawOptions),
    );
    // standardize the patches
    standardizePatches(patches, inversePatches);
    // apply them to our state (immer.js doesn't)
    applyPatch(state.present, patches);
    // update history
    state.past.push({ patches, inversePatches });
    state.future.splice(0);
  };

  // computed state regarding the state history
  const canUndo = computed(() => state.past.length > 0);
  const canRedo = computed(() => state.future.length > 0);

  // undo and redo can re-apply patches in the desired direction
  const undo = () => {
    if (!canUndo.value) return false;
    const { patches, inversePatches } = state.past.pop();
    applyPatch(state.present, inversePatches);
    state.future.unshift({ patches, inversePatches });
    return true;
  };
  const redo = () => {
    if (!canRedo.value) return false;
    const { patches, inversePatches } = state.future.shift();
    applyPatch(state.present, patches);
    state.past.push({ patches, inversePatches });
    return true;
  };

  // create shorthand commit functions for mutations
  // for example `commit('addTodo', { text: 'groceries' })`
  // is mapped to `addTodo({ text: 'groceries' })`
  const mutators = {};
  Object.keys(mutations).map((key) => {
    mutators[key] = (options) => commit(key, options);
  });

  // return the public API
  return {
    state: readonly(state.present),
    undoRedo: { canUndo, canRedo, undo, redo },
    mutators,
  };
};

export default createStore;
