/**
 * Created by eatong on 17-3-13.
 */
import {observable, action, computed, toJS} from 'mobx';

class Todo {
  @observable items = [];

  constructor() {
  }

  @computed get list() {
    return this.items;
  }

  @action addTodo(item) {
    this.items.push({
      id: this.items.length + 1,
      title: item,
      complete: false
    })
  }

  @action toggleTodo(index) {
    this.items[index].complete = !this.items[index].complete;
  }
}
export default Todo;
