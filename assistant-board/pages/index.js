import fs from 'fs';
import path from 'path';
import Board from '../components/Board';

const dataCandidatePaths = (fileName) => [
  path.join(process.cwd(), 'assistant-board', 'data', fileName),
  path.join(process.cwd(), 'data', fileName),
  path.join(process.cwd(), '.openclaw', 'workspace', 'assistant-board', 'data', fileName)
];

const readDataFile = (fileName) => {
  const candidatePaths = dataCandidatePaths(fileName);
  const filePath = candidatePaths.find((p) => fs.existsSync(p));
  if (!filePath) {
    throw new Error(`Could not locate assistant-board/data/${fileName}`);
  }
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContents);
};

export async function getStaticProps() {
  const board = readDataFile('tasks.json');
  const cronJobs = readDataFile('cron_jobs.json');
  return { props: { board, cronJobs } };
}

export default function Home({ board, cronJobs }) {
  return <Board board={board} cronJobs={cronJobs} />;
}
