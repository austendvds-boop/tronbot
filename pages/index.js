import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Dashboard() {
  const [tasks, setTasks] = useState({ active: [], scheduled: [], completed: [] });
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks');
    }
    setLoading(false);
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTask, status: 'scheduled' })
      });
      setNewTask('');
      fetchTasks();
    } catch (err) {
      console.error('Failed to add task');
    }
  };

  const completeTask = async (id) => {
    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'completed' })
      });
      fetchTasks();
    } catch (err) {
      console.error('Failed to complete task');
    }
  };

  const startTask = async (id) => {
    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'active' })
      });
      fetchTasks();
    } catch (err) {
      console.error('Failed to start task');
    }
  };

  const styles = {
    container: { maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' },
    header: { borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px' },
    section: { marginBottom: '30px', background: '#f5f5f5', padding: '15px', borderRadius: '8px' },
    sectionTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#333' },
    taskList: { listStyle: 'none', padding: 0 },
    taskItem: { 
      background: 'white', 
      padding: '12px', 
      marginBottom: '8px', 
      borderRadius: '4px',
      borderLeft: '4px solid #0070f3',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    completedItem: { borderLeftColor: '#00c853', opacity: 0.7 },
    scheduledItem: { borderLeftColor: '#ffab00' },
    button: { 
      padding: '6px 12px', 
      border: 'none', 
      borderRadius: '4px', 
      cursor: 'pointer',
      fontSize: '12px'
    },
    startBtn: { background: '#0070f3', color: 'white' },
    completeBtn: { background: '#00c853', color: 'white' },
    input: { 
      padding: '10px', 
      width: '70%', 
      border: '1px solid #ddd', 
      borderRadius: '4px',
      marginRight: '10px'
    },
    submitBtn: { 
      padding: '10px 20px', 
      background: '#0070f3', 
      color: 'white', 
      border: 'none', 
      borderRadius: '4px',
      cursor: 'pointer'
    },
    empty: { color: '#888', fontStyle: 'italic', padding: '10px' },
    status: { fontSize: '11px', color: '#666', marginTop: '4px' }
  };

  return (
    <div style={styles.container}>
      <Head>
        <title>Claw Assistant | DVDS Task Board</title>
      </Head>
      
      <header style={styles.header}>
        <h1>ðŸ¦ž Claw Task Board</h1>
        <p>Deer Valley Driving School Assistant Dashboard</p>
      </header>

      {/* Add Task */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>âž• Add New Task</div>
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
      </div>

      {/* Active Tasks */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>â–¶ï¸ Active Tasks ({tasks.active.length})</div>
        {tasks.active.length === 0 ? (
          <div style={styles.empty}>No active tasks</div>
        ) : (
          <ul style={styles.taskList}>
            {tasks.active.map(task => (
              <li key={task.id} style={styles.taskItem}>
                <div>
                  <strong>{task.title}</strong>
                  <div style={styles.status}>Started: {new Date(task.startedAt).toLocaleString()}</div>
                </div>
                <button 
                  onClick={() => completeTask(task.id)}
                  style={{...styles.button, ...styles.completeBtn}}
                >
                  âœ“ Complete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Scheduled Tasks */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>ðŸ“… Scheduled Tasks ({tasks.scheduled.length})</div>
        {tasks.scheduled.length === 0 ? (
          <div style={styles.empty}>No scheduled tasks</div>
        ) : (
          <ul style={styles.taskList}>
            {tasks.scheduled.map(task => (
              <li key={task.id} style={{...styles.taskItem, ...styles.scheduledItem}}>
                <div>
                  <strong>{task.title}</strong>
                  {task.schedule && <div style={styles.status}>â° {task.schedule}</div>}
                </div>
                <button 
                  onClick={() => startTask(task.id)}
                  style={{...styles.button, ...styles.startBtn}}
                >
                  â–¶ Start
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Completed Tasks */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>âœ… Completed Today ({tasks.completed.length})</div>
        {tasks.completed.length === 0 ? (
          <div style={styles.empty}>Nothing completed yet today</div>
        ) : (
          <ul style={styles.taskList}>
            {tasks.completed.map(task => (
              <li key={task.id} style={{...styles.taskItem, ...styles.completedItem}}>
                <div>
                  <strong>{task.title}</strong>
                  <div style={styles.status}>Completed: {new Date(task.completedAt).toLocaleString()}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading && <p>Loading tasks...</p>}
    </div>
  );
}