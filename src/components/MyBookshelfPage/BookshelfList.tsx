// src/components/MyBookshelfPage/BookshelfList.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // ✨ useNavigate 임포트
import './BookshelfList.css';
import { StarRatingFullPage } from '../../pages/MyBookshelfPage';

// 책 데이터 타입을 정의합니다.
interface BookItem {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  rating: number;
  status: string;
  date: string;
}

// BookshelfList 컴포넌트의 props 타입을 정의합니다.
interface BookshelfListProps {
  books: BookItem[]; // 책 데이터 배열
}

const BookshelfList: React.FC<BookshelfListProps> = ({ books }) => {
  const navigate = useNavigate(); // ✨ useNavigate 훅 사용

  // 책 클릭 시 상세 페이지로 이동하는 핸들러
  const handleBookClick = (bookId: string) => {
    navigate(`/book-detail/${bookId}`); // ✨ 상세 페이지 라우트로 이동
  };

  return (
    <div className="bookshelf-list-full">
      {books.length > 0 ? (
        books.map((book) => (
          // ✨ div를 클릭 가능한 요소로 만들고 onClick 핸들러 추가
          <div
            key={book.id}
            className="bookshelf-item-full"
            onClick={() => handleBookClick(book.id)} // 클릭 핸들러 연결
            role="button" // 접근성을 위해 role="button" 추가
            tabIndex={0} // 키보드 탐색을 위해 tabIndex 추가
          >
            <div className="book-cover-large">
              <img src={book.coverUrl || 'https://via.placeholder.com/80x120?text=No+Cover'} alt={book.title} />
            </div>
            <div className="book-details-full">
              <h4 className="book-title-full">{book.title}</h4>
              <p className="book-author-full">{book.author}</p>
              <div className="book-state-container">
                <StarRatingFullPage rating={book.rating} />
                <div className="book-status-info">
                  <span className={`book-status ${book.status === '독서중' ? '독서중' : '독서완료'}`}>
                    {book.status}
                  </span>
                  <span className="book-date">{book.date}</span>
                </div>
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