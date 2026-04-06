import React from 'react';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
  onClick: (title: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onClick }) => {
  return (
    <div className="book-card" onClick={() => onClick(book.title)}>
      <img src={book.thumbnail || 'https://via.placeholder.com/150x200?text=No+Cover'} alt={book.title} className="book-thumbnail" />
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.authors}</p>
        <div className="book-meta">
          <span className="book-rating">⭐ {book.average_rating}</span>
          <span className="book-category">{book.categories}</span>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
