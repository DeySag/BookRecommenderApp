import React from 'react';
import { Book } from '../types';
import BookCard from './BookCard';

interface BookDetailsProps {
  book: Book;
  recommendations: Book[];
  onBack: () => void;
  onBookClick: (title: string) => void;
}

const BookDetails: React.FC<BookDetailsProps> = ({ book, recommendations, onBack, onBookClick }) => {
  return (
    <div className="book-details-container">
      <button className="back-button" onClick={onBack}>← Back to Library</button>
      <div className="book-details-header">
        <img src={book.thumbnail || 'https://via.placeholder.com/300x450?text=No+Cover'} alt={book.title} className="detail-thumbnail" />
        <div className="detail-info">
          <h1 className="detail-title">{book.title}</h1>
          <h2 className="detail-subtitle">{book.subtitle}</h2>
          <p className="detail-author">By {book.authors}</p>
          <div className="detail-meta">
            <span>📅 {book.published_year}</span>
            <span>📖 {book.num_pages} pages</span>
            <span>⭐ {book.average_rating} ({book.ratings_count} ratings)</span>
          </div>
          <div className="detail-categories">
            {book.categories.split(';').map(cat => (
              cat.trim() && <span key={cat} className="category-tag">{cat}</span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="detail-description">
        <h3>Description</h3>
        <p>{book.description}</p>
      </div>

      <div className="recommendations-section">
        <h3>Books You Might Also Like</h3>
        <div className="recommendations-grid">
          {recommendations.map(rec => (
            <BookCard key={rec.isbn13 || rec.title} book={rec} onClick={onBookClick} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
