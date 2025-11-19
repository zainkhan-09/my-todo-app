import './App.css';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import About from './about';

function TodoApp() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('myTodoTasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [newTask, setNewTask] = useState('');

  const handleCheckboxClick = (taskId) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTasks(updatedTasks);
    localStorage.setItem('myTodoTasks', JSON.stringify(updatedTasks));
  };

  const addTask = () => {
    if (newTask.trim() !== '') {
      const newTaskItem = {
        id: Date.now(),
        text: newTask,
        completed: false
      };
      const updatedTasks = [...tasks, newTaskItem];
      setTasks(updatedTasks);
      localStorage.setItem('myTodoTasks', JSON.stringify(updatedTasks));
      setNewTask('');
    }
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    localStorage.setItem('myTodoTasks', JSON.stringify(updatedTasks));
  };

    return (
  <div className="App">
    {/* NAVIGATION OUTSIDE HEADER */}
    <nav className="main-nav">
      <Link to="/" className="nav-link">Home</Link>
      <Link to="/about" className="nav-link">About</Link>
    </nav>

    <header className="My todo">
      <h1>My Todo List</h1>
      <p>Total tasks: {tasks.length}</p>
    </header>

    <div className="add-task">
      <input 
        type="text" 
        placeholder="Enter new task..."
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
      />
      <button onClick={addTask}>Add Task</button>
    </div>
    
    <div className="Tasks">
      {tasks.map(task => (
        <div key={task.id} className="task-item">
          <input 
            type="checkbox" 
            checked={task.completed}
            onChange={() => handleCheckboxClick(task.id)}
          />
          <span className={task.completed ? 'completed' : ''}>
            {task.text}
          </span>
          <button 
            className="delete-btn"
            onClick={() => deleteTask(task.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  </div>
);
}
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TodoApp />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;