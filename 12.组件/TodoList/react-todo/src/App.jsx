import React, { useState } from 'react';


function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // 添加
  const handleAddTodo = () => {
    if (inputValue.trim() !== '') {
      setTodos([...todos, { inputValue, isClick: false }]);
      console.log(todos, '...')
      setInputValue('');
    }
  };
  // 删除
  const handleDeleteTodo = (index) => {
    const newTodos = [...todos];
    newTodos.splice(index, 1);
    setTodos(newTodos);
  };
  // 完成
  const handleDoneTodo = (index) => {
    const newTodos = [...todos];
    newTodos[index].isClick = true;
    setTodos(newTodos);
  }

  return (
    <div className="App">
      <h1>Todo List</h1>
      <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
      <button onClick={handleAddTodo}>确认</button>
      <ul>
        {todos.map((todo, index) => (
          <li key={index} style={{ textDecoration: todo.isClick ? 'line-through' : '' }}>
            {todo.inputValue}
            <button onClick={() => handleDeleteTodo(index)}>删除</button>
            <button onClick={() => handleDoneTodo(index)}>完成</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;