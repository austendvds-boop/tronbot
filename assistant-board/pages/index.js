import fs from 'fs';
import path from 'path';
import Board from '../components/Board';

export async function getStaticProps() {
  const candidatePaths = [
    path.join(process.cwd(), 'assistant-board', 'data', 'tasks.json'),
    path.join(process.cwd(), 'data', 'tasks.json'),
    path.join(process.cwd(), '.openclaw', 'workspace', 'assistant-board', 'data', 'tasks.json')
  ];
  const filePath = candidatePaths.find((p) => fs.existsSync(p));
  if (!filePath) {
    throw new Error('Could not locate assistant-board/data/tasks.json');
  }
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const board = JSON.parse(fileContents);
  return { props: { board } };
}

export default function Home({ board }) {
  return <Board board={board} />;
}
