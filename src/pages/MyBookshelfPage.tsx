// src/pages/MyBookshelfPage.tsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyBookshelfPage.css';
import { MdArrowBackIosNew } from 'react-icons/md';

import { getAllBooks, type Book, type GetAllBooksQueryParams } from '../api/bookApi';
import BookshelfList from '../components/MyBookshelfPage/BookshelfList';

export const StarRatingFullPage: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="star-rating-full-page">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className="star full">&#9733;</span>
      ))}
      {hasHalfStar && <span key="half" className="star half">&#9733;</span>}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className="star empty">&#9734;</span>
      ))}
    </div>
  );
};


function MyBookshelfPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]); // BookItem 대신 Book 타입 사용
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

  const accessToken = "your_dummy_access_token";

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams: GetAllBooksQueryParams = {
          offset: 0,
          page: 1
        };
        const response = await getAllBooks(queryParams);

        if (response.isSuccess) {
          setBooks(response.result.books);
        } else {
          setError(response.message || "책 목록을 가져오는데 실패했습니다.");
        }
      } catch (err: any) {
        setError("책 목록을 불러오는 중 오류가 발생했습니다: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [accessToken]);

  const sortedBooks = useMemo(() => {
    const sorted = [...books].sort((a, b) => {
      const dateA = new Date(a.date); // Book 타입에 date 필드 존재
      const dateB = new Date(b.date); // Book 타입에 date 필드 존재

      if (sortOrder === 'latest') {
        return dateB.getTime() - dateA.getTime();
      } else {
        return dateA.getTime() - dateB.getTime();
      }
    });
    return sorted;
  }, [books, sortOrder]);

  const handleSortClick = useCallback(() => {
    setSortOrder(prevOrder => (prevOrder === 'latest' ? 'oldest' : 'latest'));
  }, []);

  if (isLoading) {
    return (
      <div className="loading-page-container">
        <p>책장 데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-page-container">
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="detail-header">
        <div className="header-left-arrow" onClick={() => navigate(-1)}>
          <MdArrowBackIosNew size={24} color="#333" />
        </div>
        <h3>내가 읽은 책</h3>
        <div className="spacer">
        </div>
      </header>

      <div className="header-margin65">
      </div>

      <div className="sort-options">
        <span className="sort-button" onClick={handleSortClick}>
          {sortOrder === 'latest' ? '최신순' : '오래된순'} &gt;
        </span>
      </div>

      <BookshelfList books={sortedBooks} />

      <div className="add-book-button-container">
        <button className="add-book-button">
          + 책 등록
        </button>
      </div>
    </div>
  );
}

export default MyBookshelfPage;