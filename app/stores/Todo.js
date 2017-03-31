/**
 * Created by eatong on 17-3-13.
 */
import {observable, action, computed, toJS} from 'mobx';
import {remote} from 'electron';
const {todo} = remote.require('./app/services');

class Todo {
  @observable items = [];

  constructor() {
  }

  @computed get list() {
    this.items = [...todo.getTodoList()];
    return this.items;
  }

  @action addTodo(title) {
    this.items.push(todo.addTodo(title));
  }

  @action toggleTodo(index) {
    this.items[index] = todo.toggleTodo(index);
  }
}
export default Todo;
