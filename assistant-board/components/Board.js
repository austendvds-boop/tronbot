import dynamic from 'next/dynamic';
import { useState, useEffect, useMemo } from 'react';

const KanbanBoard = dynamic(
  () => import('@asseinfo/react-kanban'),
  { ssr: false }
);

const moveCardInBoard = (currentBoard, source, destination) => {
  if (!source || !destination) return currentBoard;
  const newBoard = {
    ...currentBoard,
    columns: currentBoard.columns.map((col) => ({ ...col, cards: [...col.cards] }))
  };
  const sourceColumn = newBoard.columns.find((col) => col.id === source.fromColumnId);
  const destinationColumn = newBoard.columns.find((col) => col.id === destination.toColumnId);
  if (!sourceColumn || !destinationColumn) return currentBoard;
  const [movedCard] = sourceColumn.cards.splice(source.fromPosition, 1);
  destinationColumn.cards.splice(destination.toPosition, 0, movedCard);
  return newBoard;
};

export default function Board({ board: initialBoard, cronJobs = [] }) {
  const [board, setBoard] = useState(initialBoard);

  const columnLookup = useMemo(() => {
    return board.columns.reduce((acc, column) => {
      acc[column.title] = column.cards;
      return acc;
    }, {});
  }, [board]);

  const doneCards = columnLookup['Done'] || [];
  const backlogCards = columnLookup['Backlog'] || [];
  const todoCards = columnLookup['To Do'] || [];
  const inProgressCards = columnLookup['In Progress'] || [];
  const totalCards = board.columns.reduce((sum, column) => sum + column.cards.length, 0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('assistantBoard');
      if (saved) {
        try {
          setBoard(JSON.parse(saved));
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('assistantBoard', JSON.stringify(board));
    }
  }, [board]);

  const handleCardMove = (card, source, destination) => {
    const newBoard = moveCardInBoard(board, source, destination);
    setBoard(newBoard);
  };

  const handleCardNew = (column) => {
    const title = window.prompt('Enter card title');
    if (!title) return;
    const newCard = { id: Date.now(), title };
    const newBoard = { ...board };
    const col = newBoard.columns.find((c) => c.id === column.id);
    col.cards.unshift(newCard);
    setBoard(newBoard);
  };

  const handleCardDelete = (card, column) => {
    if (!window.confirm('Delete card?')) return;
    const newBoard = { ...board };
    const col = newBoard.columns.find((c) => c.id === column.id);
    col.cards = col.cards.filter((c) => c.id !== card.id);
    setBoard(newBoard);
  };

  return (
    <div className="board-page">
      <div className="board-header">
        <div>
          <h1>Assistant Task Board</h1>
          <p>
            This is your interactive Trello-style workspace. Drag cards between Backlog, To Do, In Progress, and Done. Cards persist locally so you
            can track what I’ve completed and what’s ready to queue.
          </p>
        </div>
        <div className="board-stats">
          <div>
            <strong>{totalCards}</strong>
            <span>tasks total</span>
          </div>
          <div>
            <strong>{doneCards.length}</strong>
            <span>completed</span>
          </div>
          <div>
            <strong>{todoCards.length + inProgressCards.length}</strong>
            <span>active</span>
          </div>
        </div>
      </div>

      <div className="dashboard-layout">
        <section className="panel summary">
          <h3>Ready to queue</h3>
          <div className="summary-list">
            {backlogCards.map((card) => (
              <div key={card.id} className="summary-item">
                <span>{card.title}</span>
              </div>
            ))}
            {!backlogCards.length && <p className="empty">No backlog items right now.</p>}
          </div>
        </section>
        <section className="panel cron-panel">
          <h3>Scheduled cron jobs</h3>
          <ul className="cron-list">
            {cronJobs.map((cronJob) => (
              <li key={cronJob.id}>
                <div className="cron-row">
                  <strong>{cronJob.name}</strong>
                  <span>{cronJob.schedule}</span>
                </div>
                <p className="cron-status">{cronJob.status}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="kanban-wrapper">
        <KanbanBoard
          initialBoard={board}
          allowAddCard={{ on: 'top', prepend: true }}
          allowRemoveCard
          allowRenameColumn
          onCardDragEnd={handleCardMove}
          onNewCard={handleCardNew}
          onCardRemove={handleCardDelete}
        />
      </div>
    </div>
  );
}
