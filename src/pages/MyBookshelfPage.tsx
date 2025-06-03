// src/pages/MyBookshelfPage.tsx
import React, { useEffect, useState, useMemo, useCallback } from 'react'; // useMemo, useCallback 추가
import { useNavigate } from 'react-router-dom';
import './MyBookshelfPage.css';
import { MdArrowBackIosNew } from 'react-icons/md';
import BookshelfList from '../components/MyBookshelfPage/BookshelfList';

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

// 별점 아이콘을 렌더링하는 헬퍼 컴포넌트 (변경 없음)
export const StarRatingFullPage: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="star-rating-full-page">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className="star full">&#9733;</span> // ★
      ))}
      {hasHalfStar && <span className="star half">&#9733;</span>} {/* 반 별 */}
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
  // 1. 정렬 기준 상태 추가: 'latest' (최신순), 'oldest' (오래된순)
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

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

  // 2. 정렬된 책 목록을 계산하는 useMemo 훅
  const sortedBooks = useMemo(() => {
    // 원본 배열을 복사하여 정렬합니다. (원본 배열 변경 방지)
    const sorted = [...books].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      if (sortOrder === 'latest') {
        // 최신순 (내림차순): 최근 날짜가 앞으로 오도록
        return dateB.getTime() - dateA.getTime();
      } else {
        // 오래된순 (오름차순): 오래된 날짜가 앞으로 오도록
        return dateA.getTime() - dateB.getTime();
      }
    });
    return sorted;
  }, [books, sortOrder]); // books 또는 sortOrder가 변경될 때만 재계산

  // 3. 정렬 버튼 클릭 핸들러 (useCallback으로 최적화)
  const handleSortClick = useCallback(() => {
    // 현재 'latest'이면 'oldest'로, 'oldest'이면 'latest'로 토글
    setSortOrder(prevOrder => (prevOrder === 'latest' ? 'oldest' : 'latest'));
  }, []); // 의존성 배열이 비어있으므로 컴포넌트 마운트 시 한 번만 생성

  if (isLoading) {
    return <div className="my-bookshelf-page-container loading-state"><p>책장 데이터를 불러오는 중...</p></div>;
  }

  if (error) {
    return <div className="my-bookshelf-page-container error-state"><p style={{ color: 'red' }}>{error}</p></div>;
  }

  return (
    <div className="my-bookshelf-page-container">
      <header className="detail-header">
        <div className="header-left-arrow" onClick={() => navigate(-1)}>
          <MdArrowBackIosNew size={24} color="#333" />
        </div>
        <h3>내가 읽은 책</h3>
        <div className="spacer">
        </div>
      </header>


      <div className="sort-options">
        {/* 4. 버튼에 클릭 핸들러 연결 및 텍스트 동적 변경 */}
        <span className="sort-button" onClick={handleSortClick}>
          {sortOrder === 'latest' ? '최신순' : '오래된순'} &gt;
        </span>
      </div>

      <BookshelfList books={sortedBooks} /> {/* 정렬된 책 목록을 BookshelfList 컴포넌트에 전달 */}

      <div className="add-book-button-container">
        <button className="add-book-button">
          + 책 등록
        </button>
      </div>
    </div>
  );
}

export default MyBookshelfPage;