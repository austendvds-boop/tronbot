export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, task, timestamp } = req.body;
  
  // Log the notification (in production, this would send to Telegram)
  console.log(`[${new Date().toISOString()}] Task ${action}:`, task);
  
  // Return success - the notification will be picked up by Claw's monitoring
  res.status(200).json({ 
    success: true, 
    message: `Task ${action} recorded. Claw will be notified.` 
  });
}