import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

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
