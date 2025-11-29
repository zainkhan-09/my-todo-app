import './App.css';
import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import About from './about';
import Analytics from './Analytics.js';
import { ThemeProvider, useTheme } from './ThemeContext';
import { useVoiceCommands } from './useVoiceCommands';
import { useKeyboardShortcuts, keyboardShortcuts } from './useKeyboardShortcuts';

class CloudSync {
  constructor() {
    this.BIN_ID = 'your-jsonbin-id';
    this.API_KEY = 'your-jsonbin-api-key';
    this.BASE_URL = 'https://api.jsonbin.io/v3/b';
  }

  getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  async saveToCloud(data) {
    if (!this.API_KEY || this.API_KEY === 'your-jsonbin-api-key') {
      console.log('Cloud sync not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.BASE_URL}/${this.BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': this.API_KEY,
          'X-Bin-Name': 'MyTodoApp Data'
        },
        body: JSON.stringify({
          ...data,
          lastSync: new Date().toISOString(),
          deviceId: this.getDeviceId()
        })
      });
      
      if (response.ok) {
        console.log('✅ Data saved to cloud');
        return true;
      }
    } catch (error) {
      console.log('❌ Cloud save failed:', error);
    }
    return false;
  }

  async loadFromCloud() {
    if (!this.API_KEY || this.API_KEY === 'your-jsonbin-api-key') {
      return null;
    }

    try {
      const response = await fetch(`${this.BASE_URL}/${this.BIN_ID}/latest`, {
        headers: {
          'X-Master-Key': this.API_KEY
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Data loaded from cloud');
        return data.record;
      }
    } catch (error) {
      console.log('❌ Cloud load failed:', error);
    }
    return null;
  }
}

const cloudSync = new CloudSync();

function TodoApp() {
  const [lists, setLists] = useState([]);
  const [activeList, setActiveList] = useState(1);
  const [newTask, setNewTask] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [sortBy, setSortBy] = useState('default');
  const [activeTasks, setActiveTasks] = useState({});
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const { isDark, toggleTheme, setTheme, currentTheme, availableThemes } = useTheme();

  // Track task start/end times
  const startTaskTimer = useCallback((taskId, listId) => {
    const startTime = new Date().toISOString();
    setActiveTasks(prev => ({
      ...prev,
      [taskId]: { startTime, listId }
    }));
    
    // Update task with start time
    const updatedLists = lists.map(list => 
      list.id === listId 
        ? {
            ...list,
            tasks: list.tasks.map(task => 
              task.id === taskId 
                ? { ...task, timeStarted: startTime }
                : task
            )
          }
        : list
    );
    setLists(updatedLists);
  }, [lists]);

  const stopTaskTimer = useCallback((taskId) => {
    const taskData = activeTasks[taskId];
    if (!taskData) return;

    const endTime = new Date().toISOString();
    const startTime = new Date(taskData.startTime);
    const duration = Math.round((new Date(endTime) - startTime) / 1000 / 60); // minutes

    // Update task with time tracking data
    const updatedLists = lists.map(list => 
      list.id === taskData.listId 
        ? {
            ...list,
            tasks: list.tasks.map(task => 
              task.id === taskId 
                ? { 
                    ...task, 
                    timeTracked: (task.timeTracked || 0) + duration,
                    lastSession: { start: taskData.startTime, end: endTime, duration }
                  }
                : task
            )
          }
        : list
    );
    setLists(updatedLists);
    
    // Remove from active tasks
    setActiveTasks(prev => {
      const newActive = { ...prev };
      delete newActive[taskId];
      return newActive;
    });
  }, [activeTasks, lists]);

  const syncToCloud = useCallback(async () => {
    if (!navigator.onLine) return;
    
    setSyncStatus('syncing');
    const success = await cloudSync.saveToCloud({
      lists: lists,
      deviceId: cloudSync.getDeviceId(),
      analytics: getAnalyticsData(lists)
    });
    
    if (success) {
      const now = new Date().toISOString();
      setLastSync(now);
      localStorage.setItem('lastSync', now);
      setSyncStatus('success');
      
      setTimeout(() => setSyncStatus('idle'), 3000);
    } else {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  }, [lists]);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    if (navigator.onLine) {
      setSyncStatus('syncing');
      const cloudData = await cloudSync.loadFromCloud();
      
      if (cloudData && cloudData.lists) {
        const localTimestamp = localStorage.getItem('lastSync');
        
        if (!localTimestamp || new Date(cloudData.lastSync) > new Date(localTimestamp)) {
          setLists(cloudData.lists);
          setLastSync(cloudData.lastSync);
          localStorage.setItem('myTodoLists', JSON.stringify(cloudData.lists));
          localStorage.setItem('lastSync', cloudData.lastSync);
          setSyncStatus('success');
          return;
        }
      }
      setSyncStatus('idle');
    }

    const savedLists = localStorage.getItem('myTodoLists');
    if (savedLists) {
      setLists(JSON.parse(savedLists));
    } else {
      setLists([
        { id: 1, name: 'Personal', color: '#3b82f6', tasks: [] },
        { id: 2, name: 'Work', color: '#ef4444', tasks: [] },
        { id: 3, name: 'Shopping', color: '#10b981', tasks: [] }
      ]);
    }
  };

  useEffect(() => {
    if (lists.length > 0) {
      localStorage.setItem('myTodoLists', JSON.stringify(lists));
      
      if (navigator.onLine) {
        syncToCloud();
      }
    }
  }, [lists, syncToCloud]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncToCloud();
    };
    
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncToCloud]);

  // Check for overdue tasks
  const getListsWithOverdueStatus = useCallback(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    return lists.map(list => ({
      ...list,
      tasks: list.tasks.map(task => ({
        ...task,
        isOverdue: task.dueDate && task.dueDate < today && !task.completed
      }))
    }));
  }, [lists]);

  const manualSync = () => {
    syncToCloud();
  };

  const setupCloudSync = () => {
    const binId = prompt('Enter your JSONBin.io Bin ID:');
    const apiKey = prompt('Enter your JSONBin.io API Key:');
    
    if (binId && apiKey) {
      cloudSync.BIN_ID = binId;
      cloudSync.API_KEY = apiKey;
      localStorage.setItem('cloudConfig', JSON.stringify({ binId, apiKey }));
      alert('Cloud sync configured! Click Sync Now to save your data to cloud.');
    }
  };

  const currentList = lists.find(list => list.id === activeList) || lists[0];

  // Keyboard Shortcuts
  const keyboardCallbacks = {
    newTask: () => document.querySelector('.task-input')?.focus(),
    sync: () => syncToCloud(),
    toggleTheme: toggleTheme,
    showHelp: () => setShowHelpModal(true),
    voiceCommand: () => setShowVoiceModal(true),
  };

  useKeyboardShortcuts(keyboardCallbacks);

  // Sort tasks based on selected criteria
  const getSortedTasks = () => {
    const listsWithOverdue = getListsWithOverdueStatus();
    const currentListWithOverdue = listsWithOverdue.find(list => list.id === activeList) || listsWithOverdue[0];
    
    if (!currentListWithOverdue) return [];
    
    const tasks = [...currentListWithOverdue.tasks];
    
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
      
      case 'dueDate':
        return tasks.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        });
      
      case 'overdue':
        return tasks.sort((a, b) => {
          if (a.isOverdue && !b.isOverdue) return -1;
          if (!a.isOverdue && b.isOverdue) return 1;
          return 0;
        });
      
      case 'timeTracked':
        return tasks.sort((a, b) => (b.timeTracked || 0) - (a.timeTracked || 0));
      
      default:
        return tasks;
    }
  };

  const handleCheckboxClick = (taskId, listId) => {
    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        const updatedTasks = list.tasks.map(task => {
          if (task.id === taskId) {
            const completedAt = !task.completed ? new Date().toISOString() : null;
            return { 
              ...task, 
              completed: !task.completed,
              completedAt 
            };
          }
          return task;
        });
        return { ...list, tasks: updatedTasks };
      }
      return list;
    });
    setLists(updatedLists);
  };

  const addTask = () => {
    handleAddTask(newTask, taskTime, taskDueDate, taskPriority);
  };

  const handleAddTask = useCallback((text, time, dueDate, priority) => {
    if (text.trim() !== '' && currentList) {
      const newTaskItem = {
        id: Date.now(),
        text: text,
        time: time,
        dueDate: dueDate,
        priority: priority,
        completed: false,
        notified: false,
        isOverdue: false,
        createdAt: new Date().toISOString(),
        timeTracked: 0
      };

      const updatedLists = lists.map(list => 
        list.id === activeList 
          ? { ...list, tasks: [...list.tasks, newTaskItem] }
          : list
      );

      setLists(updatedLists);
      setNewTask('');
      setTaskTime('');
      setTaskDueDate('');
      setTaskPriority('medium');
    }
  }, [lists, activeList, currentList]);

    // Voice Commands - defined after handleAddTask
    const voiceCallbacks = useCallback(() => ({
      addTask: (text) => {
        setNewTask(text);
        setTimeout(() => {
          setNewTask('');
          if (currentList) {
            handleAddTask(text, taskTime, taskDueDate, taskPriority);
          }
        }, 500);
      },
      sync: () => syncToCloud(),
      toggleTheme: toggleTheme,
      showHelp: () => setShowHelpModal(true),
    }), [currentList, handleAddTask, syncToCloud, taskDueDate, taskPriority, taskTime, toggleTheme]);

    const { isListening, startListening, stopListening, supported: voiceSupported } = useVoiceCommands(voiceCallbacks());

  const deleteTask = (taskId, listId) => {
    // Stop timer if task is active
    if (activeTasks[taskId]) {
      stopTaskTimer(taskId);
    }
    
    const updatedLists = lists.map(list => 
      list.id === listId 
        ? { ...list, tasks: list.tasks.filter(task => task.id !== taskId) }
        : list
    );
    setLists(updatedLists);
  };

  const updateTaskPriority = (taskId, listId, newPriority) => {
    const updatedLists = lists.map(list => 
      list.id === listId 
        ? {
            ...list,
            tasks: list.tasks.map(task => 
              task.id === taskId ? { ...task, priority: newPriority } : task
            )
          }
        : list
    );
    setLists(updatedLists);
  };

  const updateTaskDueDate = (taskId, listId, newDueDate) => {
    const updatedLists = lists.map(list => 
      list.id === listId 
        ? {
            ...list,
            tasks: list.tasks.map(task => 
              task.id === taskId ? { 
                ...task, 
                dueDate: newDueDate,
                isOverdue: newDueDate && newDueDate < new Date().toISOString().split('T')[0] && !task.completed
              } : task
            )
          }
        : list
    );
    setLists(updatedLists);
  };

  const addNewList = () => {
    const newListName = prompt('Enter new list name:');
    if (newListName && newListName.trim() !== '') {
      const newList = {
        id: Date.now(),
        name: newListName.trim(),
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        tasks: []
      };
      setLists([...lists, newList]);
      setActiveList(newList.id);
    }
  };

  const deleteList = (listId) => {
    if (lists.length > 1) {
      const updatedLists = lists.filter(list => list.id !== listId);
      setLists(updatedLists);
      if (activeList === listId) {
        setActiveList(updatedLists[0].id);
      }
    } else {
      alert('You must have at least one list!');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Medium';
    }
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return '';
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    if (dueDate === today) return 'Today';
    if (dueDate === tomorrow) return 'Tomorrow';
    
    return new Date(dueDate).toLocaleDateString();
  };

  const formatTimeTracked = (minutes) => {
    if (!minutes) return 'Not tracked';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className={`App ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <nav className="main-nav">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/about" className="nav-link">About</Link>
        <Link to="/analytics" className="nav-link">Analytics</Link>
        
        {/* Theme Switcher */}
        <div className="theme-switcher">
          <select 
            value={currentTheme}
            onChange={(e) => setTheme(e.target.value)}
            className="theme-select"
            title="Switch theme (Ctrl+T)"
          >
            {availableThemes?.map(theme => (
              <option key={theme} value={theme}>
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <button onClick={toggleTheme} className="theme-toggle" title="Toggle dark/light mode">
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* Help and Voice */}
        <button 
          onClick={() => setShowHelpModal(true)} 
          className="help-btn"
          title="Show keyboard shortcuts (Ctrl+?)"
        >
          ❓
        </button>

        {voiceSupported && (
          <button 
            onClick={() => setShowVoiceModal(true)} 
            className="voice-btn"
            title="Voice commands (Alt+V)"
          >
            🎤
          </button>
        )}
      </nav>

      <div className="sync-status-bar">
        <div className="sync-info">
          <span className={`status-indicator ${syncStatus}`}></span>
          {isOnline ? '🟢 Online' : '🔴 Offline'}
          {lastSync && ` • Last sync: ${new Date(lastSync).toLocaleTimeString()}`}
        </div>
        <div className="sync-controls">
          <button 
            onClick={manualSync} 
            className="sync-btn"
            disabled={syncStatus === 'syncing' || !isOnline}
          >
            {syncStatus === 'syncing' ? '🔄 Syncing...' : '☁️ Sync Now'}
          </button>
          <button onClick={setupCloudSync} className="setup-cloud-btn">
            ⚙️ Setup Cloud
          </button>
        </div>
      </div>

      <header className="app-header">
        <div className="app-header-inner">
          <h1>My Todo Lists</h1>
          <p className="header-sub">Total tasks: {lists.reduce((total, list) => total + list.tasks.length, 0)}</p>
        </div>
      </header>

      {!isOnline && (
        <div className="offline-indicator">
          ⚠️ You are offline. Changes will sync when online.
        </div>
      )}

      {/* Quick Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card total">
          <div className="stat-number">{lists.reduce((total, list) => total + list.tasks.length, 0)}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card completed">
          <div className="stat-number">
            {lists.reduce((total, list) => total + list.tasks.filter(task => task.completed).length, 0)}
          </div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-number">
            {lists.reduce((total, list) => total + list.tasks.filter(task => !task.completed).length, 0)}
          </div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card time-tracked">
          <div className="stat-number">
            {formatTimeTracked(lists.reduce((total, list) => total + list.tasks.reduce((sum, task) => sum + (task.timeTracked || 0), 0), 0))}
          </div>
          <div className="stat-label">Time Tracked</div>
        </div>
      </div>

      <div className="list-selector">
        {lists.map(list => (
          <button
            key={list.id}
            className={`list-tab ${activeList === list.id ? 'active' : ''}`}
            onClick={() => setActiveList(list.id)}
            style={{ borderBottomColor: list.color }}
          >
            {list.name}
            <span className="task-count">{list.tasks.length}</span>
            {lists.length > 1 && (
              <button 
                className="delete-list-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteList(list.id);
                }}
              >
                ×
              </button>
            )}
          </button>
        ))}
        <button className="add-list-btn" onClick={addNewList}>
          + New List
        </button>
      </div>

      {currentList && (
        <div className="current-list-header" style={{ borderLeftColor: currentList.color }}>
          <h2>{currentList.name} List</h2>
          <span className="list-color-indicator" style={{ backgroundColor: currentList.color }}></span>
        </div>
      )}

      {/* Enhanced Add Task Form */}
      <div className="add-task enhanced">
        <input 
          type="text" 
          placeholder={`Add task to ${currentList?.name || 'list'}...`}
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          className="task-input"
        />
        
        <div className="task-options">
          <input 
            type="time" 
            value={taskTime}
            onChange={(e) => setTaskTime(e.target.value)}
            className="time-input"
          />
          
          <input 
            type="date" 
            value={taskDueDate}
            onChange={(e) => setTaskDueDate(e.target.value)}
            className="due-date-input"
            min={new Date().toISOString().split('T')[0]}
          />
          
          <select 
            value={taskPriority}
            onChange={(e) => setTaskPriority(e.target.value)}
            className="priority-select"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          
          <button onClick={addTask} className="add-task-btn">Add Task</button>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="sort-controls">
        <label>Sort by:</label>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="default">Default</option>
          <option value="priority">Priority</option>
          <option value="dueDate">Due Date</option>
          <option value="overdue">Overdue First</option>
          <option value="timeTracked">Time Tracked</option>
        </select>
      </div>
      
      {/* Enhanced Tasks List */}
      <div className="Tasks enhanced">
        {getSortedTasks().length === 0 ? (
          <div className="empty-state">
            <p>No tasks in {currentList?.name} list. Add your first task! 📝</p>
          </div>
        ) : (
          getSortedTasks().map(task => (
            <div 
              key={task.id} 
              className={`task-item enhanced ${task.isOverdue ? 'overdue' : ''} ${task.priority} ${activeTasks[task.id] ? 'active-timer' : ''}`}
            >
              <input 
                type="checkbox" 
                checked={task.completed}
                onChange={() => handleCheckboxClick(task.id, currentList.id)}
              />
              
              <div className="task-content">
                <div className="task-header">
                  <span className={task.completed ? 'completed' : ''}>
                    {task.text}
                  </span>
                  <div className="task-badges">
                    {task.priority && task.priority !== 'medium' && (
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                        title={getPriorityLabel(task.priority)}
                      >
                        {getPriorityLabel(task.priority)}
                      </span>
                    )}
                    {task.isOverdue && (
                      <span className="overdue-badge" title="Overdue">
                        ⚠️ Overdue
                      </span>
                    )}
                    {task.timeTracked > 0 && (
                      <span className="time-badge" title="Time tracked">
                        ⏱️ {formatTimeTracked(task.timeTracked)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="task-meta">
                  {task.time && (
                    <span className="task-time">
                      ⏰ {task.time}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className={`due-date ${task.isOverdue ? 'overdue' : ''}`}>
                      📅 {formatDueDate(task.dueDate)}
                    </span>
                  )}
                  {task.createdAt && (
                    <span className="created-date">
                      📝 {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  )}
                  {activeTasks[task.id] && (
                    <span className="active-timer-indicator">
                      🔴 Tracking...
                    </span>
                  )}
                </div>
              </div>

              <div className="task-actions">
                {!task.completed && (
                  <button 
                    className={`timer-btn ${activeTasks[task.id] ? 'stop' : 'start'}`}
                    onClick={() => activeTasks[task.id] ? stopTaskTimer(task.id) : startTaskTimer(task.id, currentList.id)}
                  >
                    {activeTasks[task.id] ? '⏹️' : '⏱️'}
                  </button>
                )}
                
                <select 
                  value={task.priority || 'medium'}
                  onChange={(e) => updateTaskPriority(task.id, currentList.id, e.target.value)}
                  className="priority-dropdown"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                
                <input 
                  type="date" 
                  value={task.dueDate || ''}
                  onChange={(e) => updateTaskDueDate(task.id, currentList.id, e.target.value)}
                  className="due-date-dropdown"
                  onClick={(e) => e.stopPropagation()}
                />
                
                <button 
                  className="delete-btn"
                  onClick={() => deleteTask(task.id, currentList.id)}
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="modal-content help-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⌨️ Keyboard Shortcuts</h2>
              <button className="close-btn" onClick={() => setShowHelpModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="shortcuts-grid">
                {keyboardShortcuts.map((shortcut, idx) => (
                  <div key={idx} className="shortcut-item">
                    <kbd className="shortcut-key">{shortcut.key}</kbd>
                    <span className="shortcut-desc">{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Commands Modal */}
      {showVoiceModal && (
        <div className="modal-overlay" onClick={() => setShowVoiceModal(false)}>
          <div className="modal-content voice-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎤 Voice Commands</h2>
              <button className="close-btn" onClick={() => setShowVoiceModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className={`voice-status ${isListening ? 'listening' : ''}`}>
                {isListening ? (
                  <>
                    <div className="listening-animation">
                      <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <p>Listening...</p>
                </>
              ) : (
                <p>Ready to listen</p>
              )}
            </div>
            <div className="voice-commands-list">
              <div className="voice-command-item">
                <strong>Add task:</strong> "Add task [task name]"
              </div>
              <div className="voice-command-item">
                <strong>Complete task:</strong> "Complete" or "Done"
              </div>
              <div className="voice-command-item">
                <strong>Sync:</strong> "Sync" or "Save"
              </div>
              <div className="voice-command-item">
                <strong>New list:</strong> "New list [name]"
              </div>
              <div className="voice-command-item">
                <strong>Toggle theme:</strong> "Dark mode" or "Light mode"
              </div>
            </div>
            <div className="voice-buttons">
              <button 
                onClick={isListening ? stopListening : startListening}
                className={`voice-action-btn ${isListening ? 'stop' : 'start'}`}
              >
                {isListening ? '⏹️ Stop' : '🎤 Start Listening'}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* App Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-left">© {new Date().getFullYear()} Todo Master</div>
          <div className="footer-right">
            <a href="/about">About</a>
            <a href="/analytics">Analytics</a>
            <a href="https://github.com/ZainullahLs/my-todo-app" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Analytics data helper function
function getAnalyticsData(lists) {
  const allTasks = lists.flatMap(list => list.tasks);
  const completedTasks = allTasks.filter(task => task.completed);
  
  // Daily completion stats
  const dailyStats = {};
  completedTasks.forEach(task => {
    if (task.completedAt) {
      const date = task.completedAt.split('T')[0];
      dailyStats[date] = (dailyStats[date] || 0) + 1;
    }
  });
  
  return {
    totalTasks: allTasks.length,
    completedTasks: completedTasks.length,
    completionRate: allTasks.length > 0 ? (completedTasks.length / allTasks.length * 100).toFixed(1) : 0,
    totalTimeTracked: lists.reduce((total, list) => total + list.tasks.reduce((sum, task) => sum + (task.timeTracked || 0), 0), 0),
    dailyCompletions: dailyStats,
    priorityBreakdown: {
      high: allTasks.filter(task => task.priority === 'high').length,
      medium: allTasks.filter(task => task.priority === 'medium').length,
      low: allTasks.filter(task => task.priority === 'low').length
    },
    lastUpdated: new Date().toISOString()
  };
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<TodoApp />} />
          <Route path="/about" element={<About />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;