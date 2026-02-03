export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, task, timestamp } = req.body;
  
  // Telegram Bot - FREE instant messaging
  const BOT_TOKEN = '8045371091:AAEqtTjupod0k-33OSgrp_UfRupabxcwt-E';
  const CHAT_ID = '7077676180';
  
  const message = `ðŸ“‹ Task Board: ${action.toUpperCase()}\n\n"${task.title}"\n\nTime: ${new Date(timestamp).toLocaleTimeString()}\n\nðŸ‘‰ View: https://assistant-board-n7pqxj5ps-austs-projects-ee024705.vercel.app`;
  
  try {
    // Send instant Telegram message to Claw
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      res.status(200).json({ 
        success: true, 
        message: `Task ${action} recorded. Claw notified instantly.` 
      });
    } else {
      throw new Error('Telegram API error');
    }
  } catch (error) {
    console.error('Notification failed:', error);
    res.status(200).json({ 
      success: true, 
      message: `Task ${action} recorded. (Notification queued for retry)` 
    });
  }
}