import { useState, useEffect } from 'react';
import Head from 'next/head';
import tasksData from '../data/tasks.json';

export default function Dashboard() {
  const [tasks, setTasks] = useState({ active: [], scheduled: [], completed: [] });
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [clawStatus, setClawStatus] = useState({ active: false, lastSeen: null });
  const [prevCompletedCount, setPrevCompletedCount] = useState(0);
  const [newCompleted, setNewCompleted] = useState(0);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Load from localStorage if available, else use imported JSON
    const saved = localStorage.getItem('clawTasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    } else {
      setTasks(tasksData);
    }
    setLoading(false);
    
    // Auto-save to localStorage every 10 seconds
    const interval = setInterval(() => {
      localStorage.setItem('clawTasks', JSON.stringify(tasks));
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    // Track new completed tasks
    if (tasks.completed.length > prevCompletedCount && prevCompletedCount > 0) {
      setNewCompleted(tasks.completed.length - prevCompletedCount);
    }
    setPrevCompletedCount(tasks.completed.length);
    setLastUpdate(Date.now());
    
    // Check Claw activity based on recent task updates
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    let latestActivity = null;
    
    // Check completed tasks
    if (tasks.completed.length > 0) {
      const latestCompleted = tasks.completed[0]; // Most recent first
      if (latestCompleted.completedAt) {
        const completedTime = new Date(latestCompleted.completedAt).getTime();
        if (completedTime > fiveMinutesAgo) {
          latestActivity = new Date(latestCompleted.completedAt);
        }
      }
    }
    
    // Check active tasks
    if (tasks.active.length > 0) {
      const latestActive = tasks.active[0];
      if (latestActive.startedAt) {
        const startedTime = new Date(latestActive.startedAt).getTime();
        if (startedTime > fiveMinutesAgo && (!latestActivity || startedTime > latestActivity.getTime())) {
          latestActivity = new Date(latestActive.startedAt);
        }
      }
    }
    
    if (latestActivity) {
      setClawStatus({ active: true, lastSeen: latestActivity });
    } else {
      // Find most recent activity ever
      let mostRecent = null;
      [...tasks.completed, ...tasks.active].forEach(task => {
        const time = new Date(task.completedAt || task.startedAt || task.createdAt).getTime();
        if (!mostRecent || time > mostRecent.getTime()) {
          mostRecent = new Date(task.completedAt || task.startedAt || task.createdAt);
        }
      });
      setClawStatus({ active: false, lastSeen: mostRecent });
    }
  }, [tasks]);

  const fetchTasks = async () => {
    // Client-side only - load from imported JSON
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      setTasks(tasksData);
    } catch (err) {
      console.error('Failed to load tasks');
    }
    setLoading(false);
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    const newTaskObj = {
      id: Date.now().toString(),
      title: newTask,
      status: 'scheduled',
      schedule: 'Manual',
      type: 'manual',
      createdAt: new Date().toISOString()
    };
    
    const updatedTasks = {
      ...tasks,
      scheduled: [...tasks.scheduled, newTaskObj]
    };
    
    setTasks(updatedTasks);
    localStorage.setItem('clawTasks', JSON.stringify(updatedTasks));
    setNewTask('');
    
    // Show notification
    setNotification(`Task "${newTask}" added! Message @NotZlaner69420 on Telegram to notify Claw.`);
    setTimeout(() => setNotification(null), 5000);
  };

  const completeTask = async (id) => {
    // Find task in active
    const task = tasks.active.find(t => t.id === id);
    if (task) {
      const completedTask = {
        ...task,
        status: 'completed',
        completedAt: new Date().toISOString()
      };
      
      const updatedTasks = {
        ...tasks,
        active: tasks.active.filter(t => t.id !== id),
        completed: [completedTask, ...tasks.completed]
      };
      
      setTasks(updatedTasks);
      localStorage.setItem('clawTasks', JSON.stringify(updatedTasks));
    }
  };

  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;
    
    const updatedTasks = {
      ...tasks,
      scheduled: tasks.scheduled.filter(t => t.id !== id)
    };
    
    setTasks(updatedTasks);
    localStorage.setItem('clawTasks', JSON.stringify(updatedTasks));
  };

  const startTask = async (id) => {
    // Find task in scheduled
    const task = tasks.scheduled.find(t => t.id === id);
    if (task) {
      const activeTask = {
        ...task,
        status: 'active',
        startedAt: new Date().toISOString()
      };
      
      const updatedTasks = {
        ...tasks,
        scheduled: tasks.scheduled.filter(t => t.id !== id),
        active: [...tasks.active, activeTask]
      };
      
      setTasks(updatedTasks);
      localStorage.setItem('clawTasks', JSON.stringify(updatedTasks));
    }
  };

  const styles = {
    container: { maxWidth: '1400px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#0d1117', color: '#c9d1d9', minHeight: '100vh' },
    header: { borderBottom: '2px solid #30363d', paddingBottom: '10px', marginBottom: '20px' },
    board: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' },
    column: { background: '#161b22', padding: '15px', borderRadius: '8px', minHeight: '400px', border: '1px solid #30363d' },
    columnTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', padding: '10px', background: '#21262d', color: '#c9d1d9', borderRadius: '4px', textAlign: 'center', border: '1px solid #30363d', fontFamily: 'system-ui, -apple-system, sans-serif' },
    taskList: { listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' },
    taskCard: { 
      background: '#0d1117', 
      padding: '12px', 
      borderRadius: '6px',
      borderTop: '4px solid #58a6ff',
      border: '1px solid #30363d',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
    },
    completedCard: { borderTopColor: '#238636' },
    scheduledCard: { borderTopColor: '#d29922' },
    cardTitle: { fontWeight: 'bold', marginBottom: '5px', fontSize: '14px', color: '#c9d1d9' },
    cardMeta: { fontSize: '11px', color: '#8b949e', marginBottom: '8px' },
    button: { 
      padding: '6px 12px', 
      border: 'none', 
      borderRadius: '4px', 
      cursor: 'pointer',
      fontSize: '11px',
      marginRight: '5px',
      fontWeight: 'bold'
    },
    startBtn: { background: '#1f6feb', color: 'white' },
    completeBtn: { background: '#238636', color: 'white' },
    deleteBtn: { background: '#da3633', color: 'white' },
    addSection: { background: '#161b22', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #30363d' },
    input: { 
      padding: '10px', 
      width: '60%', 
      border: '1px solid #30363d', 
      borderRadius: '4px',
      marginRight: '10px',
      background: '#0d1117',
      color: '#c9d1d9'
    },
    submitBtn: { 
      padding: '10px 20px', 
      background: '#238636', 
      color: 'white', 
      border: 'none', 
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold'
    },
    empty: { color: '#8b949e', fontStyle: 'italic', padding: '20px', textAlign: 'center' },
    statusBox: { 
      background: '#161b22', 
      padding: '12px 16px', 
      borderRadius: '8px', 
      border: '1px solid #30363d',
      minWidth: '200px'
    },
    statusRow: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      marginBottom: '4px'
    },
    greenDot: { 
      width: '10px', 
      height: '10px', 
      borderRadius: '50%', 
      backgroundColor: '#3fb950',
      boxShadow: '0 0 8px #3fb950',
      animation: 'pulse 2s infinite'
    },
    grayDot: { 
      width: '10px', 
      height: '10px', 
      borderRadius: '50%', 
      backgroundColor: '#484f58'
    },
    statusText: { 
      fontWeight: 'bold', 
      fontSize: '14px',
      color: '#c9d1d9'
    },
    lastSeen: { 
      fontSize: '11px', 
      color: '#8b949e',
      marginLeft: '18px'
    },
    refreshTime: {
      fontSize: '10px',
      color: '#6e7681',
      marginLeft: '18px',
      marginTop: '2px'
    },
    notification: {
      background: '#238636',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: 'bold',
      marginTop: '8px',
      textAlign: 'center'
    },
    notificationBanner: {
      background: '#1f6feb',
      color: 'white',
      padding: '10px',
      borderRadius: '4px',
      fontSize: '12px',
      marginTop: '10px',
      textAlign: 'center'
    }
  };

  return (
    <div style={styles.container}>
      <Head>
        <title>Claw Assistant | DVDS Task Board</title>
        <style>{`
          body { 
            margin: 0; 
            background-color: #0d1117; 
            color: #c9d1d9;
          }
          html { background-color: #0d1117; }
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}</style>
      </Head>
      
      <header style={styles.header}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h1 style={{margin: 0}}>Claw Task Board</h1>
            <p style={{margin: '5px 0 0 0', color: '#8b949e'}}>Deer Valley Driving School Assistant Dashboard</p>
          </div>
          <div style={styles.statusBox}>
            <div style={styles.statusRow}>
              <span style={clawStatus.active ? styles.greenDot : styles.grayDot}></span>
              <span style={styles.statusText}>
                {clawStatus.active ? 'Claw is active' : 'Claw idle'}
              </span>
            </div>
            <div style={styles.lastSeen}>
              Last seen: {clawStatus.lastSeen ? new Date(clawStatus.lastSeen).toLocaleTimeString() : 'Never'}
            </div>
            <div style={styles.refreshTime}>
              Updated: {new Date(lastUpdate).toLocaleTimeString()}
            </div>
            {newCompleted > 0 && (
              <div style={styles.notification} onClick={() => setNewCompleted(0)}>
                {newCompleted} task{newCompleted > 1 ? 's' : ''} completed! (click to dismiss)
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Add Task */}
      <div style={styles.addSection}>
        <form onSubmit={addTask}>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="What should I work on?"
            style={styles.input}
          />
          <button type="submit" style={styles.submitBtn}>Add Task</button>
        </form>
        {notification && (
          <div style={styles.notificationBanner}>
            {notification}
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <div style={styles.board}>
        {/* Active Column */}
        <div style={styles.column}>
          <div style={styles.columnTitle}>ACTIVE ({tasks.active.length})</div>
          {tasks.active.length === 0 ? (
            <div style={styles.empty}>No active tasks</div>
          ) : (
            <ul style={styles.taskList}>
              {tasks.active.map(task => (
                <li key={task.id} style={styles.taskCard}>
                  <div style={styles.cardTitle}>{task.title}</div>
                  <div style={styles.cardMeta}>Started: {new Date(task.startedAt).toLocaleTimeString()}</div>
                  <button 
                    onClick={() => completeTask(task.id)}
                    style={{...styles.button, ...styles.completeBtn}}
                  >
                    Done
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Scheduled Column */}
        <div style={styles.column}>
          <div style={styles.columnTitle}>SCHEDULED ({tasks.scheduled.length})</div>
          {tasks.scheduled.length === 0 ? (
            <div style={styles.empty}>No scheduled tasks</div>
          ) : (
            <ul style={styles.taskList}>
              {tasks.scheduled.map(task => (
                <li key={task.id} style={{...styles.taskCard, ...styles.scheduledCard}}>
                  <div style={styles.cardTitle}>{task.title}</div>
                  {task.schedule && <div style={styles.cardMeta}>{task.schedule}</div>}
                  <button 
                    onClick={() => startTask(task.id)}
                    style={{...styles.button, ...styles.startBtn}}
                  >
                    Start
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    style={{...styles.button, ...styles.deleteBtn}}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Completed Column */}
        <div style={styles.column}>
          <div style={styles.columnTitle}>DONE ({tasks.completed.length})</div>
          {tasks.completed.length === 0 ? (
            <div style={styles.empty}>Nothing completed today</div>
          ) : (
            <ul style={styles.taskList}>
              {tasks.completed.map(task => (
                <li key={task.id} style={{...styles.taskCard, ...styles.completedCard}}>
                  <div style={styles.cardTitle}>{task.title}</div>
                  <div style={styles.cardMeta}>{new Date(task.completedAt).toLocaleTimeString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {loading && <p style={{textAlign: 'center'}}>Loading tasks...</p>}
    </div>
  );
}