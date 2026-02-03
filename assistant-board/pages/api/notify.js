export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, task, timestamp } = req.body;
  
  // Store notification in a log that Claw can check
  // In a real implementation, this would send to a message queue or database
  const notification = {
    id: Date.now().toString(),
    action,
    taskTitle: task.title,
    taskId: task.id,
    timestamp,
    receivedAt: new Date().toISOString(),
    status: 'pending'
  };
  
  // Log to console (Vercel logs are visible to Claw)
  console.log('CLAW_NOTIFICATION:', JSON.stringify(notification));
  
  // Also try to send Telegram message
  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '7077676180';
    
    if (BOT_TOKEN) {
      const message = `Task ${action}: ${task.title}`;
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message
        })
      });
    }
  } catch (e) {
    // Silent fail - console log is the primary method
  }
  
  res.status(200).json({ 
    success: true, 
    message: `Task ${action} recorded. Claw will see this in the logs.` 
  });
}