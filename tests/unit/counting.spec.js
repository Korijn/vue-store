import { expect } from 'chai';
import { mount } from '@vue/test-utils';
import Counting from './Counting.vue';

describe('counting', () => {
  it('counts', async () => {
    const wrapper = mount(Counting);

    const text = wrapper.find('p');
    const increment = wrapper.find('#increment');
    const undo = wrapper.find('#undo');
    const redo = wrapper.find('#redo');

    expect(text.text()).to.contain('Count: 0');
    expect(undo.attributes('disabled')).to.equal('');
    expect(redo.attributes('disabled')).to.equal('');

    await increment.trigger('click');
    expect(text.text()).to.contain('Count: 1');
    expect(undo.attributes('disabled')).to.be.undefined;
    expect(redo.attributes('disabled')).to.equal('');

    await undo.trigger('click');
    expect(text.text()).to.contain('Count: 0');
    expect(undo.attributes('disabled')).to.equal('');
    expect(redo.attributes('disabled')).to.be.undefined;

    await redo.trigger('click');
    expect(text.text()).to.contain('Count: 1');
    expect(undo.attributes('disabled')).to.be.undefined;
    expect(redo.attributes('disabled')).to.equal('');
  });
});
