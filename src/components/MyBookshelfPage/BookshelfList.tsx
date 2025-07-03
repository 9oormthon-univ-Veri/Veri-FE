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
      // API에서 반환되는 BookStatus 값에 맞게 케이스를 수정합니다.
      // 'READING', 'COMPLETED', 'WISH' 또는 기타 상태를 반영합니다.
      // API 명세에 '독서중', '완독', '미정', '읽고싶어요' 대신 영문 ENUM이 사용될 가능성이 높습니다.
      // bookApi.ts의 BookStatus 타입 정의를 참조했습니다.
      case 'READING':
        return '독서중';
      case 'DONE':
        return '완독'; // '완독'과 동일한 스타일로 처리
      // 현재 BookStatus 타입에 '미정'과 '읽고싶어요'가 직접 정의되어 있지 않으므로,
      // API 응답에 맞춰 'WISH' 또는 다른 적절한 ENUM으로 변경 필요
      // 임시로 '미정'과 '읽고싶어요'를 제거하거나, bookApi.ts의 BookStatus를 확장해야 합니다.
      // 여기서는 BookStatus에 명시된 'READING'과 'COMPLETED'만 사용하고,
      // 그 외의 경우를 위해 default를 추가합니다.
      default: // 예를 들어 'WISH' 등 새로운 상태가 추가될 경우 여기에 추가
        return 'status-unknown'; // 알 수 없는 상태에 대한 기본 스타일
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
                {/* Book 인터페이스에 rating 대신 score가 있으므로 score를 전달 */}
                <StarRatingFullPage rating={book.score} />
              </div>
              <div className="book-status-info">
                {/* BookStatus는 API 명세에 따라 "READING", "COMPLETED" 등으로 전달될 수 있습니다. */}
                {/* getStatusClass 함수 내부의 switch case도 이에 맞게 조정했습니다. */}
                <span className={`book-status ${getStatusClass(book.status)}`}>
                  {book.status === 'READING' ? '독서중' : book.status === 'DONE' ? '완독' : book.status}
                  {/* API 응답에 'WISH' 또는 다른 상태가 있다면 여기에 추가하여 한글로 표시할 수 있습니다. */}
                </span>
                {/* Book 인터페이스에 date 대신 startedAt이 있으므로 startedAt을 사용하고, 날짜 형식 지정 */}
                <span className="book-date">
                  {book.startedAt ? new Date(book.startedAt).toLocaleDateString('ko-KR') : ''}
                </span>
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
