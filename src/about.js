import './App.css';
import { useTheme } from './ThemeContext';
import { Link } from 'react-router-dom';
import { keyboardShortcuts } from './useKeyboardShortcuts';

function About() {
  const { isDark } = useTheme();
  
  return (
    <div className={`App ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <nav className="main-nav">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/about" className="nav-link">About</Link>
        <Link to="/analytics" className="nav-link">Analytics</Link>
      </nav>
      
      <header className="app-header">
        <div className="app-header-inner">
          <h1>📋 Todo Master</h1>
          <p className="header-sub">Your Ultimate Productivity Companion</p>
        </div>
      </header>
      
      <div className="about-content">
        <h2>Welcome to Todo Master!</h2>
        <p>A modern, feature-rich todo list app built with React that helps you stay organized, track progress, and boost productivity.</p>
        
        <section className="feature-section">
          <h3>✨ Core Features</h3>
          <ul>
            <li>✅ Create unlimited todo lists with custom names</li>
            <li>📝 Add, edit, and delete tasks instantly</li>
            <li>🏷️ Assign priorities (High, Medium, Low)</li>
            <li>📅 Set due dates with overdue tracking</li>
            <li>⏰ Schedule specific times for tasks</li>
            <li>⏱️ Built-in time tracking for task duration</li>
            <li>🔄 Drag & drop tasks between lists</li>
          </ul>
        </section>

        <section className="feature-section">
          <h3>☁️ Cloud Sync & Backup</h3>
          <ul>
            <li>🔄 Automatic cloud synchronization with JSONBin</li>
            <li>📱 Access your tasks from any device</li>
            <li>🌐 Offline mode with automatic sync when online</li>
            <li>🔐 Secure data persistence</li>
            <li>💾 Automatic backup on every change</li>
          </ul>
        </section>

        <section className="feature-section">
          <h3>📈 Advanced Analytics</h3>
          <ul>
            <li>📊 Real-time productivity scoring</li>
            <li>📈 Daily completion tracking with charts</li>
            <li>🎯 Priority performance analysis</li>
            <li>⏰ Time tracking insights</li>
            <li>📅 Weekly and monthly views</li>
            <li>🏆 List performance comparison</li>
            <li>🔍 Recent activity feed with timestamps</li>
          </ul>
        </section>

        <section className="feature-section">
          <h3>🎨 Beautiful Themes & UI</h3>
          <ul>
            <li>🌈 <strong>6 Stunning Themes:</strong> Ocean, Forest, Sunset, Midnight, Rose, Lime</li>
            <li>🌙 Dark and Light mode toggle</li>
            <li>✨ Smooth animations and micro-interactions</li>
            <li>🎯 Intuitive, user-friendly interface</li>
            <li>📱 Fully responsive design for all devices</li>
          </ul>
        </section>

        <section className="feature-section">
          <h3>⌨️ Keyboard Shortcuts (Power User Mode)</h3>
          <p>Master these shortcuts to work at lightning speed:</p>
          <div className="shortcuts-reference">
            {keyboardShortcuts.map((shortcut, idx) => (
              <div key={idx} className="shortcut-ref-item">
                <kbd>{shortcut.key}</kbd>
                <span>{shortcut.description}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="feature-section">
          <h3>🎤 Voice Commands (Hands-Free Control)</h3>
          <p>Control your todo app using your voice:</p>
          <div className="voice-reference">
            <div className="voice-ref-item">
              <strong>Say:</strong> "Add task [task name]" → Create new task
            </div>
            <div className="voice-ref-item">
              <strong>Say:</strong> "Complete" or "Done" → Mark task as complete
            </div>
            <div className="voice-ref-item">
              <strong>Say:</strong> "Sync" or "Save" → Save to cloud
            </div>
            <div className="voice-ref-item">
              <strong>Say:</strong> "New list [list name]" → Create new list
            </div>
            <div className="voice-ref-item">
              <strong>Say:</strong> "Toggle theme" → Switch theme
            </div>
            <div className="voice-ref-item">
              <strong>Say:</strong> "Clear completed" → Remove completed tasks
            </div>
            <div className="voice-ref-item">
              <strong>Say:</strong> "Help" → Show help guide
            </div>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.7 }}>💡 Tip: Click the microphone icon to activate voice mode, or press Alt+V</p>
        </section>

        <section className="feature-section">
          <h3>🎨 Available Themes</h3>
          <p>Choose from 6 beautiful color themes:</p>
          <div className="themes-grid">
            <div className="theme-preview ocean">
              <div className="theme-color-circle" style={{ background: '#3498db' }}></div>
              <span>Ocean</span>
              <small>#3498db</small>
            </div>
            <div className="theme-preview forest">
              <div className="theme-color-circle" style={{ background: '#27ae60' }}></div>
              <span>Forest</span>
              <small>#27ae60</small>
            </div>
            <div className="theme-preview sunset">
              <div className="theme-color-circle" style={{ background: '#e74c3c' }}></div>
              <span>Sunset</span>
              <small>#e74c3c</small>
            </div>
            <div className="theme-preview midnight">
              <div className="theme-color-circle" style={{ background: '#2c3e50' }}></div>
              <span>Midnight</span>
              <small>#2c3e50</small>
            </div>
            <div className="theme-preview rose">
              <div className="theme-color-circle" style={{ background: '#e91e63' }}></div>
              <span>Rose</span>
              <small>#e91e63</small>
            </div>
            <div className="theme-preview lime">
              <div className="theme-color-circle" style={{ background: '#7cb342' }}></div>
              <span>Lime</span>
              <small>#7cb342</small>
            </div>
          </div>
        </section>

        <section className="feature-section">
          <h3>🚀 Pro Tips</h3>
          <ul>
            <li>💡 Use keyboard shortcuts for fastest navigation</li>
            <li>🎤 Enable voice commands for hands-free operation</li>
            <li>📊 Check Analytics regularly to track your productivity</li>
            <li>☁️ Your data syncs automatically - no manual saving needed</li>
            <li>🌙 Switch themes to personalize your experience</li>
            <li>⏱️ Use time tracking to build accurate productivity reports</li>
            <li>🎯 Set priorities to focus on what matters most</li>
          </ul>
        </section>
        
        <div className="credit">
          <h3>❤️ About This App</h3>
          <p>Created with passion by <strong>Zainullah</strong></p>
          <p>Built with React, React Router, and modern web technologies</p>
          <p>Designed to help you achieve more every single day</p>
        </div>
        
        <button onClick={() => window.history.back()} className="back-button">← Go Back Home</button>
      </div>
    </div>
  );
}

export default About;