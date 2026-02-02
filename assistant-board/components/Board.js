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

export default function Board({ board: initialBoard }) {
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

  // Load saved board from localStorage if present
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
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Assistant Task Board</h1>
      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto 20px',
          padding: '12px 18px',
          borderRadius: '12px',
          background: '#111',
          color: '#f0f0f0',
          fontSize: '0.95rem',
          boxShadow: '0 0 20px rgba(0,0,0,0.25)'
        }}
      >
        <p>
          This board tracks the work I’m doing for DVDS. “Done” lists shipped items, “Backlog” holds tasks you can queue, and the other
          columns show what’s cooking right now.
        </p>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <strong>Done:</strong>
            <ul>
              {doneCards.map((card) => (
                <li key={card.id}>{card.title}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Ready to queue:</strong>
            <ul>
              {backlogCards.map((card) => (
                <li key={card.id}>{card.title}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div style={{ marginBottom: '20px', color: '#d0d0d0' }}>
        <p>
          In Progress: {inProgressCards.length} task(s) · To Do: {todoCards.length} task(s)
        </p>
      </div>
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
  );
}
