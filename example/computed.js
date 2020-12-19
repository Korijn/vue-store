import { computed, toRaw } from 'vue';

const createComputed = (presentState) => {
  const stateJSON = computed(() => JSON.stringify(toRaw(presentState)));
  return {
    stateJSON,
  };
};

export default createComputed;
