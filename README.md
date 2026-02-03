# Claw Assistant Task Board

Dashboard for managing Deer Valley Driving School automation tasks.

## Features

- **Active Tasks** - See what the assistant is working on right now
- **Scheduled Tasks** - Cron jobs and upcoming tasks
- **Completed Tasks** - What got done today
- **Add Tasks** - Queue new work for the assistant

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy

```bash
npm run build
```

Deploy the `dist` folder to Vercel.

## Default Scheduled Tasks

- 7:00 AM - Send daily SMS schedule to parents
- 7:00 PM - Send night-before reminder to parents  
- Hourly - Heartbeat check for urgent items