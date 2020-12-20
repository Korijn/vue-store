import { expect } from 'chai';
import createStore from '@/main';

describe('createStore', () => {
  it('creates a store', () => {
    const store = createStore({
      todos: [],
    }, {
      addTodo: (state, { title }) => { state.todos.push(title); },
    });
    const item = 'Assert that this was added';
    store.mutators.addTodo({ title: item });
    expect(store.state.todos).to.include(item);
  });
});
