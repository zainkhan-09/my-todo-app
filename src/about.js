import './App.css';

function About() {
  return (
    <div className="App">
      <header className="My todo">
        <h1>About My Todo App</h1>
      </header>
      
      <div className="about-content">
        <h2>Welcome to My Todo List!</h2>
        <p>This is a simple todo list app built with React.</p>
        
        <h3>Features:</h3>
        <ul>
          <li>Add new tasks</li>
          <li>Mark tasks as complete</li>
          <li>Delete tasks</li>
          <li>Local storage - tasks saved automatically</li>
        </ul>
        
        <h3>How to use:</h3>
        <p>Just type your task and click "Add Task" to get started!</p>
        
        <div className="credit">
          <h3>Credit</h3>
          <p>Created with ❤️ by <strong>Zainullah</strong></p>
        </div>
        
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    </div>
  );
}

export default About;