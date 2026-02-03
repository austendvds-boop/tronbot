import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'data', 'tasks.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(dataFile))) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
}

// Initialize with default tasks if file doesn't exist
if (!fs.existsSync(dataFile)) {
  const defaultTasks = {
    active: [],
    scheduled: [
      {
        id: '1',
        title: 'Send 7 AM SMS to parents',
        schedule: 'Daily at 7:00 AM',
        type: 'cron',
        status: 'scheduled'
      },
      {
        id: '2',
        title: 'Send 7 PM night-before reminder',
        schedule: 'Daily at 7:00 PM',
        type: 'cron',
        status: 'scheduled'
      },
      {
        id: '3',
        title: 'Hourly heartbeat check',
        schedule: 'Every hour 6 AM - 10 PM',
        type: 'cron',
        status: 'scheduled'
      }
    ],
    completed: []
  };
  fs.writeFileSync(dataFile, JSON.stringify(defaultTasks, null, 2));
}

function readTasks() {
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(data);
  } catch {
    return { active: [], scheduled: [], completed: [] };
  }
}

function writeTasks(tasks) {
  fs.writeFileSync(dataFile, JSON.stringify(tasks, null, 2));
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    const tasks = readTasks();
    // Filter completed to only show today's
    const today = new Date().toDateString();
    tasks.completed = tasks.completed.filter(t => 
      new Date(t.completedAt).toDateString() === today
    );
    res.status(200).json(tasks);
  }
  
  else if (req.method === 'POST') {
    const { title, status = 'scheduled', schedule } = req.body;
    const tasks = readTasks();
    
    const newTask = {
      id: Date.now().toString(),
      title,
      status,
      schedule,
      createdAt: new Date().toISOString()
    };
    
    tasks[status].push(newTask);
    writeTasks(tasks);
    
    res.status(201).json(newTask);
  }
  
  else if (req.method === 'PUT') {
    const { id, status } = req.body;
    const tasks = readTasks();
    
    // Find and remove from current status
    let task = null;
    ['active', 'scheduled', 'completed'].forEach(s => {
      const idx = tasks[s].findIndex(t => t.id === id);
      if (idx !== -1) {
        task = tasks[s].splice(idx, 1)[0];
      }
    });
    
    if (task) {
      task.status = status;
      if (status === 'active') {
        task.startedAt = new Date().toISOString();
      } else if (status === 'completed') {
        task.completedAt = new Date().toISOString();
      }
      tasks[status].push(task);
      writeTasks(tasks);
      res.status(200).json(task);
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  }
  
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}