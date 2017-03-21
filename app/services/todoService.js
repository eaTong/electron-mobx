/**
 * Created by eatong on 17-3-21.
 */
const todoList = [
  {id: 0, title: 'aaaaaaa', complete: false}
];


function getTodoList() {
  return todoList;
}


function addTodo(item) {
  const todo = {
    id: todoList.length + 1,
    title: item,
    complete: false
  };
  todoList.push(todo);
  return todo;
}
function toggleTodo(index) {
  todoList[index].complete = !todoList[index].complete;
  return todoList[index];
}

module.exports = {
  getTodoList,
  addTodo,
  toggleTodo
};
