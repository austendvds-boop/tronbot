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
    container: { maxWidth: '1400px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' },
    header: { borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px' },
    board: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' },
    column: { background: '#f5f5f5', padding: '15px', borderRadius: '8px', minHeight: '400px' },
    columnTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', padding: '10px', background: '#333', color: 'white', borderRadius: '4px', textAlign: 'center' },
    taskList: { listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' },
    taskCard: { 
      background: 'white', 
      padding: '12px', 
      borderRadius: '6px',
      borderTop: '4px solid #0070f3',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    completedCard: { borderTopColor: '#00c853' },
    scheduledCard: { borderTopColor: '#ffab00' },
    cardTitle: { fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' },
    cardMeta: { fontSize: '11px', color: '#666', marginBottom: '8px' },
    button: { 
      padding: '6px 12px', 
      border: 'none', 
      borderRadius: '4px', 
      cursor: 'pointer',
      fontSize: '11px',
      marginRight: '5px'
    },
    startBtn: { background: '#0070f3', color: 'white' },
    completeBtn: { background: '#00c853', color: 'white' },
    addSection: { background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' },
    input: { 
      padding: '10px', 
      width: '60%', 
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
    empty: { color: '#888', fontStyle: 'italic', padding: '20px', textAlign: 'center' }
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
      <div style={styles.addSection}>
        <form onSubmit={addTask}>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="What should I work on?"
            style={styles.input}
          />
          <button type="submit" style={styles.submitBtn}>âž• Add Task</button>
        </form>
      </div>

      {/* Kanban Board */}
      <div style={styles.board}>
        {/* Active Column */}
        <div style={styles.column}>
          <div style={styles.columnTitle}>â–¶ï¸ ACTIVE ({tasks.active.length})</div>
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
                    âœ“ Done
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Scheduled Column */}
        <div style={styles.column}>
          <div style={styles.columnTitle}>ðŸ“… SCHEDULED ({tasks.scheduled.length})</div>
          {tasks.scheduled.length === 0 ? (
            <div style={styles.empty}>No scheduled tasks</div>
          ) : (
            <ul style={styles.taskList}>
              {tasks.scheduled.map(task => (
                <li key={task.id} style={{...styles.taskCard, ...styles.scheduledCard}}>
                  <div style={styles.cardTitle}>{task.title}</div>
                  {task.schedule && <div style={styles.cardMeta}>â° {task.schedule}</div>}
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

        {/* Completed Column */}
        <div style={styles.column}>
          <div style={styles.columnTitle}>âœ… DONE ({tasks.completed.length})</div>
          {tasks.completed.length === 0 ? (
            <div style={styles.empty}>Nothing completed today</div>
          ) : (
            <ul style={styles.taskList}>
              {tasks.completed.map(task => (
                <li key={task.id} style={{...styles.taskCard, ...styles.completedCard}}>
                  <div style={styles.cardTitle}>{task.title}</div>
                  <div style={styles.cardMeta}>âœ“ {new Date(task.completedAt).toLocaleTimeString()}</div>
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