// src/pages/MyBookshelfPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // useLocation 임포트 추가
import './MyBookshelfPage.css';
import { MdArrowBackIosNew } from 'react-icons/md';

// Book 인터페이스 import 시 타입명 일치 확인
// bookApi.ts에서 정의된 Book 타입에 score와 startedAt이 포함되어야 합니다.
import { getAllBooks, type Book, type GetAllBooksQueryParams } from '../api/bookApi';
import BookshelfList from '../components/MyBookshelfPage/BookshelfList';

const STAR_FILL_ICON = '/icons/star_fill.svg';
const STAR_LINE_ICON = '/icons/star_line.svg';

export const StarRatingFullPage: React.FC<{ rating: number }> = ({ rating }) => {
  // 별점 계산 로직 (기존과 동일)
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  const starElements = [];

  // 채워진 별
  for (let i = 0; i < fullStars; i++) {
    starElements.push(
      <img
        key={`full-${i}`}
        src={STAR_FILL_ICON}
        alt="filled star"
        className="star full"
      />
    );
  }

  if (hasHalfStar) {
    starElements.push(
      <img
        key="half"
        src={STAR_FILL_ICON} // 채워진 별 아이콘을 사용
        alt="half star"
        className="star half"
        style={{ clipPath: 'inset(0 50% 0 0)' }} // 반쪽 별을 위한 스타일 (예시)
      />
    );
  }

  for (let i = 0; i < emptyStars; i++) {
    starElements.push(
      <img
        key={`empty-${i}`}
        src={STAR_LINE_ICON}
        alt="empty star"
        className="star empty"
      />
    );
  }

  return (
    <div className="star-rating-full-page">
      {starElements}
    </div>
  );
};

function MyBookshelfPage() {
  const navigate = useNavigate();
  const location = useLocation(); // ✨ useLocation 훅 추가
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // API 명세에 맞춰 'newest' 또는 'oldest'로 설정
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // fetchBooks 함수를 useCallback으로 감싸고, sortOrder가 변경될 때마다 재생성되도록 합니다.
  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams: GetAllBooksQueryParams = {
        page: 1, // 첫 페이지
        size: 10, // 한 페이지에 10개씩 (필요에 따라 조정)
        sort: sortOrder, // API 명세의 sort 파라미터에 맞춤 ('newest' 또는 'oldest')
      };
      const response = await getAllBooks(queryParams);

      if (response.isSuccess) {
        // API 응답의 result.memberBooks를 사용
        setBooks(response.result.memberBooks);
      } else {
        setError(response.message || "책 목록을 가져오는데 실패했습니다.");
      }
    } catch (err: any) {
      setError("책 목록을 불러오는 중 오류가 발생했습니다: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [sortOrder]); // sortOrder가 변경될 때마다 fetchBooks 함수가 재생성됩니다.

  useEffect(() => {
    // fetchBooks 함수가 변경될 때마다 (즉, sortOrder가 변경될 때마다) 데이터를 다시 불러옵니다.
    // ✨ location.key를 의존성 배열에 추가하여 페이지에 접근할 때마다 새로고침을 유발합니다.
    fetchBooks();
  }, [fetchBooks, location.key]); // ✨ location.key 추가

  // API에서 이미 정렬을 처리하므로, 클라이언트 측에서 추가적인 useMemo 정렬은 필요 없습니다.
  // const sortedBooks = useMemo(() => {
  //   return books; // API에서 이미 정렬된 상태로 데이터를 받습니다.
  // }, [books]);

  const handleSortClick = useCallback(() => {
    // sortOrder 상태를 변경하여 useEffect가 fetchBooks를 다시 호출하게 합니다.
    setSortOrder(prevOrder => (prevOrder === 'newest' ? 'oldest' : 'newest'));
  }, []);

  // "+ 등록하기" 버튼 클릭 핸들러
  const handleCreateBookClick = useCallback(() => {
    // 책 등록/생성 페이지로 이동 (경로는 실제 라우팅에 맞게 조정)
    navigate('/book-search'); // 책 검색 페이지로 이동
  }, [navigate]);

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
        <button className="header-left-arrow" onClick={() => navigate("/")}>
          <MdArrowBackIosNew size={24} color="#333" />
        </button>
        <h3>나의책장</h3>
        <div className="dummy-box"></div>
      </header>

      <div className="header-margin"></div>

      <div className="sort-options">
        <span className="sort-button" onClick={handleSortClick}>
          {sortOrder === 'newest' ? '최신순' : '오래된순'} &gt;
        </span>
      </div>

      {books.length === 0 && !isLoading && !error ? (
        <div className="no-books-message">
          <p>등록된 책이 없습니다. 새로운 책을 등록해보세요!</p>
        </div>
      ) : (
        // BookshelfList 컴포넌트는 이미 Book 타입을 받도록 되어 있으므로,
        // score를 rating으로 매핑하는 추가 작업 없이 books를 직접 전달합니다.
        <BookshelfList books={books} />
      )}

      <div className="create-button-container">
        <button className="create-button" onClick={handleCreateBookClick}>
          + 등록하기
        </button>
      </div>
    </div>
  );
}

export default MyBookshelfPage;
