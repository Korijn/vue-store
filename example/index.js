import mutations from './mutations';
import createComputed from './computed';
import createStore from '../vue-store';

const createNotesStore = () => {
  const initialState = {
    notes: "",
  };
  const {
    state,
    ...rest
  } = createStore(initialState, mutations);
  return {
    state,
    computed: createComputed(state),
    ...rest,
  };
};

export default createNotesStore;
