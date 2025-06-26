// src/components/MyBookshelfPage/BookshelfList.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BookshelfList.css';

import { StarRatingFullPage } from '../../pages/MyBookshelfPage';
import { type Book, type BookStatus } from '../../api/bookApi';

interface BookshelfListProps {
  books: Book[];
}

const BookshelfList: React.FC<BookshelfListProps> = ({ books }) => {
  const navigate = useNavigate();

  // 책 클릭 시 상세 페이지로 이동하며 bookId만 URL 파라미터로 전달
  const handleBookClick = (bookId: number) => {
    navigate(`/book-detail/${bookId}`);
  };

  const getStatusClass = (status: BookStatus) => {
    switch (status) {
      case '독서중':
        return 'status-reading';
      case '완독':
      case '미정':
        return 'status-completed'; // '완독'과 동일한 스타일로 처리
      case '읽고싶어요':
        return 'status-want-to-read';
      default:
        return 'status-unknown';
    }
  };

  return (
    <div className="bookshelf-list-full">
      {books.length > 0 ? (
        books.map((book) => (
          <div
            key={book.bookId}
            className="bookshelf-item-full"
            onClick={() => handleBookClick(book.bookId)} // bookId만 전달
            role="button"
            tabIndex={0}
          >
            <div className="book-cover-large">
              <img
                src={book.imageUrl || 'https://via.placeholder.com/80x120?text=No+Cover'}
                alt={book.title}
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/80x120?text=No+Cover";
                }}
              />
            </div>
            <div className="book-details-full">
              <div className="book-top-info">
                <h4 className="book-title-full">{book.title}</h4>
                <p className="book-author-full">{book.author}</p>
                <StarRatingFullPage rating={book.rating} />
              </div>
              <div className="book-status-info">
                  <span className={`book-status ${getStatusClass(book.status)}`}>
                    {book.status}
                  </span>
                  <span className="book-date">{book.date}</span>
                </div>
            </div>
          </div>
        ))
      ) : (
        <p className="no-books-message">책장에 등록된 책이 없습니다.</p>
      )}
    </div>
  );
};

export default BookshelfList;