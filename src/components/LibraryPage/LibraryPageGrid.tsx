import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LibraryPageGrid.css';
import { type Book } from '../../api/bookApi';

interface LibraryPageGridProps {
  books: Book[];
}

const LibraryPageGrid: React.FC<LibraryPageGridProps> = ({ books }) => {
  const navigate = useNavigate();

  const handleBookClick = (book: Book) => {
    navigate(`/book-detail/${book.memberBookId}`, { state: { book } });
  };

  const fallbackImageUrl = 'https://placehold.co/100x150?text=No+Cover';

  return (
    <div className="books-grid">
      {books.map((book) => (
        <div 
          key={book.memberBookId} 
          className="bookshelf-item"
          onClick={() => handleBookClick(book)}
        >
          <div className="book-cover-thumbnail">
            <img 
              src={book.imageUrl || fallbackImageUrl} 
              alt={book.title}
              onError={(e) => {
                if (e.currentTarget.src !== fallbackImageUrl) {
                  e.currentTarget.src = fallbackImageUrl;
                }
              }}
            />
          </div>
          <p className="book-title">{book.title}</p>
          <p className="book-author">{book.author}</p>
        </div>
      ))}
    </div>
  );
};

export default LibraryPageGrid;
