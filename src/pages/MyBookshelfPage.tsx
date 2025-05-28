// src/pages/MyBookshelfPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyBookshelfPage.css'; // 새로운 책장 페이지 전용 CSS

// 책 데이터 타입을 정의합니다.
interface BookItem {
  id: string;
  title: string;
  author: string;
  coverUrl: string; // 책 표지 이미지 URL
  rating: number; // 별점 (0~5)
  status: string; // 독서 상태 (예: '독서중' 또는 '독서완료')
  date: string; // 날짜 (예: '2025.05.24')
}

// 별점 아이콘을 렌더링하는 헬퍼 컴포넌트
const StarRatingFullPage: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="star-rating-full-page">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className="star full">&#9733;</span> // ★
      ))}
      {hasHalfStar && <span className="star half">&#9733;</span>} {/* 반 별 (같은 유니코드 문자지만 CSS로 절반 채움) */}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className="star empty">&#9734;</span> // ☆
      ))}
    </div>
  );
};


function MyBookshelfPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<BookItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/datas/bookshelf.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText + '. Requested URL: /datas/bookshelf.json');
        }
        return response.json();
      })
      .then((data: BookItem[]) => {
        setBooks(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('책장 데이터를 불러오는 중 오류 발생:', err);
        setError('책장 데이터를 불러오는 데 실패했습니다: ' + err.message);
        setIsLoading(false);
      });
  }, []);

  // '최신순' 클릭 핸들러 (정렬 로직 필요 시 여기에 추가)
  const handleSortClick = () => {
    // 실제 정렬 로직은 여기에 구현 (예: setBooks(sortedBooks))
    console.log('최신순 정렬 클릭됨');
  };

  if (isLoading) {
    return <div className="my-bookshelf-page-container loading-state"><p>책장 데이터를 불러오는 중...</p></div>;
  }

  if (error) {
    return <div className="my-bookshelf-page-container error-state"><p style={{ color: 'red' }}>{error}</p></div>;
  }

  return (
    <div className="my-bookshelf-page-container">
      <header className="bookshelf-header">
        <div className="header-left-arrow" onClick={() => navigate(-1)}>
          <img src="/icons/arrow-left.svg" alt="뒤로가기" className="icon" /> {/* 뒤로가기 아이콘 경로 예시 */}
        </div>
        <h3>나의 책장</h3>
        <div className="header-right-dots">
          <img src="/icons/more-vertical.svg" alt="더보기" className="icon" /> {/* 점 3개 메뉴 아이콘 경로 예시 */}
        </div>
      </header>

      <div className="sort-options">
        <span className="sort-button" onClick={handleSortClick}>최신순 &gt;</span>
      </div>

      <div className="bookshelf-list-full">
        {books.length > 0 ? (
          books.map((book) => (
            <div key={book.id} className="bookshelf-item-full">
              <div className="book-cover-large">
                <img src={book.coverUrl || 'https://via.placeholder.com/80x120?text=No+Cover'} alt={book.title} />
              </div>
              <div className="book-details-full">
                <h4 className="book-title-full">{book.title}</h4>
                <p className="book-author-full">{book.author}</p>
                <StarRatingFullPage rating={book.rating} /> {/* 별점 컴포넌트 사용 */}
                <div className="book-status-info">
                  <span className="book-status">{book.status}</span>
                  <span className="book-date">{book.date}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-books-message">책장에 등록된 책이 없습니다.</p>
        )}
      </div>
      <div className="add-book-button-container">
        <button className="add-book-button">
          + 책 등록
        </button>
      </div>
    </div>
  );
}

export default MyBookshelfPage;