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
    store.addTodo({ title: item });
    expect(store.state.todos).to.have.lengthOf(1);
    expect(store.state.todos).to.include(item);
    expect(store.canUndo.value).to.be.true;
    expect(store.canRedo.value).to.be.false;

    expect(store.undo()).to.be.true;
    expect(store.state.todos).to.have.lengthOf(0);
    expect(store.state.todos).not.to.include(item);
    expect(store.canUndo.value).to.be.false;
    expect(store.canRedo.value).to.be.true;

    expect(store.redo()).to.be.true;
    expect(store.state.todos).to.have.lengthOf(1);
    expect(store.state.todos).to.include(item);
    expect(store.canUndo.value).to.be.true;
    expect(store.canRedo.value).to.be.false;
  });
});
