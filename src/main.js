/*
 * Generic store pattern implementation based on Vue 3 composition API and Immer
 */
import { Immer, enablePatches } from 'immer';
import { applyPatch } from 'rfc6902';
import {
  computed, reactive, readonly, toRaw,
} from 'vue';

const RESERVED_KEYS = ['state', 'past', 'future', 'commit', 'canUndo', 'canRedo', 'undo', 'redo'];

enablePatches();

// use a local immer.js instance so we don't disrupt global state
// where possible
const immer = new Immer();
immer.setAutoFreeze(false);

const standardizePatches = (patches, inversePatches) => {
  // immer.js generates patches very efficiently, but
  // they are not rfc6902 compliant
  [patches, inversePatches].forEach((patchList) => {
    for (let i = 0; i < patchList.length; i += 1) {
      const patch = patchList[i];
      patch.path = `/${patch.path.join('/')}`;
    }
  });
};

// createStore can be called to create a store pattern based on
// a given initial state object and a set of mutations
const createStore = (initialState, mutations) => {
  // create reactive state root
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
    const [, patches, inversePatches] = immer.produceWithPatches(
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
  Object.keys(mutations).forEach((key) => {
    if (RESERVED_KEYS.includes(key)) {
      console.warn(`No shorthand generated for mutation named '${key}' because of name clash`);
      return;
    }
    mutators[key] = (options) => commit(key, options);
  });

  return {
    // state & mutation API
    state: readonly(state.present),
    ...mutators,
    commit,
    // undo-redo API
    past: readonly(state.past),
    future: readonly(state.future),
    canUndo,
    canRedo,
    undo,
    redo,
  };
};

export default createStore;
