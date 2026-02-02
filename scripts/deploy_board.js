#!/usr/bin/env node
// Deploy assistant-board to Vercel using the Vercel CLI and your token in secrets/vercel.json
const { execSync } = require('child_process');
const path = require('path');
const token = require(path.join(__dirname, '..', 'secrets', 'vercel.json')).token;

const cwd = path.join(__dirname, '..', 'assistant-board');

try {
  console.log('Linking project to Vercel...');
  execSync(`npx vercel link --yes --token ${token} --cwd ${cwd}`, { stdio: 'inherit' });

  console.log('Deploying assistant-board to Vercel (production)...');
  execSync(`npx vercel --prod --token ${token} --cwd ${cwd} --yes`, { stdio: 'inherit' });

  console.log('Deployment complete.');
} catch (err) {
  console.error('Deployment failed:', err);
  process.exit(1);
}
