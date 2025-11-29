import './App.css';
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from './ThemeContext';
import { Link } from 'react-router-dom';

function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const { isDark } = useTheme();

  const calculateAnalytics = useCallback((lists) => {
    const now = new Date();
    const allTasks = lists.flatMap(list => list.tasks);
    const completedTasks = allTasks.filter(task => task.completed);
    
    // Calculate daily completion stats for the selected time range
    const days = timeRange === 'week' ? 7 : 30;
    const dailyCompletions = {};
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyCompletions[dateStr] = 0;
    }
    
    completedTasks.forEach(task => {
      if (task.completedAt) {
        const date = task.completedAt.split('T')[0];
        if (dailyCompletions[date] !== undefined) {
          dailyCompletions[date]++;
        }
      }
    });

    // Calculate productivity metrics
    const totalTimeTracked = lists.reduce((total, list) => 
      total + list.tasks.reduce((sum, task) => sum + (task.timeTracked || 0), 0), 0
    );

    const avgCompletionTime = completedTasks.length > 0 
      ? totalTimeTracked / completedTasks.length 
      : 0;

    // Priority distribution
    const priorityStats = {
      high: { total: 0, completed: 0 },
      medium: { total: 0, completed: 0 },
      low: { total: 0, completed: 0 }
    };

    allTasks.forEach(task => {
      const priority = task.priority || 'medium';
      priorityStats[priority].total++;
      if (task.completed) {
        priorityStats[priority].completed++;
      }
    });

    // List performance
    const listStats = lists.map(list => ({
      name: list.name,
      color: list.color,
      total: list.tasks.length,
      completed: list.tasks.filter(task => task.completed).length,
      completionRate: list.tasks.length > 0 
        ? (list.tasks.filter(task => task.completed).length / list.tasks.length * 100).toFixed(1)
        : 0
    }));

    return {
      summary: {
        totalTasks: allTasks.length,
        completedTasks: completedTasks.length,
        completionRate: allTasks.length > 0 ? (completedTasks.length / allTasks.length * 100).toFixed(1) : 0,
        totalTimeTracked,
        avgCompletionTime: Math.round(avgCompletionTime),
        productivityScore: calculateProductivityScore(completedTasks.length, totalTimeTracked, days)
      },
      dailyCompletions,
      priorityStats,
      listStats,
      recentActivity: getRecentActivity(lists),
      timeRange
    };
  }, [timeRange]);

  const loadAnalyticsData = useCallback(() => {
    const savedLists = localStorage.getItem('myTodoLists');
    if (savedLists) {
      const lists = JSON.parse(savedLists);
      const data = calculateAnalytics(lists);
      setAnalyticsData(data);
    }
  }, [calculateAnalytics]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const calculateProductivityScore = (completedTasks, totalTime, days) => {
    const tasksPerDay = completedTasks / days;
    const avgTimePerTask = completedTasks > 0 ? totalTime / completedTasks : 0;
    
    // Simple scoring algorithm (adjust weights as needed)
    const taskScore = Math.min(tasksPerDay * 10, 100);
    const efficiencyScore = avgTimePerTask > 0 ? Math.max(0, 100 - (avgTimePerTask / 10)) : 50;
    
    return Math.round((taskScore * 0.6 + efficiencyScore * 0.4));
  };

  const getRecentActivity = (lists) => {
    const allTasks = lists.flatMap(list => list.tasks);
    return allTasks
      .filter(task => task.completedAt || task.timeTracked > 0)
      .sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt))
      .slice(0, 10);
  };

  const formatTime = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getChartData = () => {
    if (!analyticsData) return [];
    return Object.entries(analyticsData.dailyCompletions).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      count,
      fullDate: date
    }));
  };

  const getMaxCompletion = () => {
    const values = Object.values(analyticsData?.dailyCompletions || {});
    return Math.max(...values, 1);
  };

  if (!analyticsData) {
    return (
      <div className={`App ${isDark ? 'dark-theme' : 'light-theme'}`}>
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className={`App ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <nav className="main-nav">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/about" className="nav-link">About</Link>
        <Link to="/analytics" className="nav-link">Analytics</Link>
      </nav>

      <header className="app-header">
        <div className="app-header-inner">
          <h1>📊 Productivity Analytics</h1>
          <p className="header-sub">Track your progress and improve your productivity</p>
        </div>
      </header>

      {/* Time Range Selector */}
      <div className="time-range-selector">
        <button 
          className={timeRange === 'week' ? 'active' : ''}
          onClick={() => setTimeRange('week')}
        >
          Last 7 Days
        </button>
        <button 
          className={timeRange === 'month' ? 'active' : ''}
          onClick={() => setTimeRange('month')}
        >
          Last 30 Days
        </button>
        <button onClick={loadAnalyticsData} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="analytics-summary">
        <div className="summary-card">
          <div className="summary-icon">✅</div>
          <div className="summary-content">
            <div className="summary-value">{analyticsData.summary.completionRate}%</div>
            <div className="summary-label">Completion Rate</div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">⚡</div>
          <div className="summary-content">
            <div className="summary-value">{analyticsData.summary.productivityScore}</div>
            <div className="summary-label">Productivity Score</div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">⏱️</div>
          <div className="summary-content">
            <div className="summary-value">{formatTime(analyticsData.summary.totalTimeTracked)}</div>
            <div className="summary-label">Total Time Tracked</div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">📈</div>
          <div className="summary-content">
            <div className="summary-value">{analyticsData.summary.completedTasks}</div>
            <div className="summary-label">Tasks Completed</div>
          </div>
        </div>
      </div>

      {/* Daily Completions Chart */}
      <div className="chart-section">
        <h3>Daily Completions</h3>
        <div className="chart-container">
          {getChartData().map((day, index) => (
            <div key={index} className="chart-bar-container">
              <div 
                className="chart-bar"
                style={{ 
                  height: `${(day.count / getMaxCompletion()) * 100}%`,
                  backgroundColor: day.count > 0 ? '#3b82f6' : '#e5e7eb'
                }}
                title={`${day.fullDate}: ${day.count} tasks`}
              >
                <span className="bar-value">{day.count}</span>
              </div>
              <div className="bar-label">{day.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Performance */}
      <div className="priority-section">
        <h3>Priority Performance</h3>
        <div className="priority-stats">
          {Object.entries(analyticsData.priorityStats).map(([priority, stats]) => (
            <div key={priority} className="priority-stat-card">
              <div className="priority-header">
                <span className={`priority-dot ${priority}`}></span>
                <span className="priority-name">{priority.toUpperCase()}</span>
              </div>
              <div className="priority-numbers">
                <div className="completion-rate">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </div>
                <div className="task-count">
                  {stats.completed}/{stats.total}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* List Performance */}
      <div className="list-performance">
        <h3>List Performance</h3>
        <div className="list-stats">
          {analyticsData.listStats.map((list, index) => (
            <div key={index} className="list-stat-card">
              <div className="list-header">
                <span 
                  className="list-color" 
                  style={{ backgroundColor: list.color }}
                ></span>
                <span className="list-name">{list.name}</span>
              </div>
              <div className="list-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${list.completionRate}%`,
                      backgroundColor: list.color
                    }}
                  ></div>
                </div>
                <span className="progress-text">{list.completionRate}%</span>
              </div>
              <div className="list-numbers">
                {list.completed}/{list.total} tasks
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {analyticsData.recentActivity.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon">
                {activity.completed ? '✅' : '⏱️'}
              </div>
              <div className="activity-content">
                <div className="activity-text">
                  {activity.completed ? 'Completed' : 'Time tracked'} - {activity.text}
                </div>
                <div className="activity-meta">
                  {activity.completedAt && (
                    <span>Completed: {new Date(activity.completedAt).toLocaleDateString()}</span>
                  )}
                  {activity.timeTracked > 0 && (
                    <span>Time: {formatTime(activity.timeTracked)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {analyticsData.recentActivity.length === 0 && (
            <div className="no-activity">No recent activity</div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="insights-section">
        <h3>📈 Productivity Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>Best Time to Work</h4>
            <p>You complete most tasks in the morning. Try scheduling important tasks before noon.</p>
          </div>
          <div className="insight-card">
            <h4>Priority Focus</h4>
            <p>High priority tasks have a {analyticsData.priorityStats.high.total > 0 ? 
              Math.round((analyticsData.priorityStats.high.completed / analyticsData.priorityStats.high.total) * 100) : 0}% completion rate.</p>
          </div>
          <div className="insight-card">
            <h4>Weekly Goal</h4>
            <p>You average {Math.round(analyticsData.summary.completedTasks / (timeRange === 'week' ? 7 : 30))} tasks per day. Keep it up!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;