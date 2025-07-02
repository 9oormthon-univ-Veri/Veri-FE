// src/pages/LibraryPage/TodaysRecommendation.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ✨ import 변경:
// getTodaysRecommendation 대신 getPopularBooks를 임포트
// TodaysRecommendationBook 대신 PopularBookItem 타입과 GetPopularBooksQueryParams를 임포트
import { getPopularBooks, type PopularBookItem, type GetPopularBooksQueryParams } from '../../api/bookApi';

// 개별 추천 책 아이템의 타입 정의
// PopularBookItem의 필드에 맞춰 조정
interface RecommendedBookType {
  // PopularBookItem에는 bookId가 없고 isbn이 있으므로,
  // 여기서는 API 응답의 'isbn'을 'id'로 사용합니다.
  // BookDetail 페이지로 이동할 때 이 'id'가 사용될 것입니다.
  id: string; // isbn
  coverUrl: string; // PopularBookItem의 'image' 필드와 매핑
  title: string;
  author: string;
  // 필요하다면 publisher, isbn 등을 추가할 수 있습니다.
  // publisher: string;
  // isbn: string;
}

// 개별 추천 책 아이템을 렌더링하는 내부 컴포넌트
const SingleRecommendedBookItem: React.FC<RecommendedBookType> = ({ id, coverUrl, title, author }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/book-detail/${id}`);
  };
  const fallbackImageUrl = 'https://placehold.co/80x120?text=No+Cover';
  return (
    <div className="recommended-book-item" onClick={handleClick}>
      <div className="book-cover-thumbnail">
        <img
          src={coverUrl || fallbackImageUrl} // coverUrl이 없으면 대체 이미지 사용
          alt={title}
          onError={(e) => {
            // 이미지 로딩 실패 시 대체 이미지로 변경
            // 이미 fallbackImageUrl로 시도했는데 실패한 경우 무한 루프를 피하기 위해
            // 현재 src가 fallbackImageUrl이 아닐 때만 변경하도록 할 수도 있습니다.
            if (e.currentTarget.src !== fallbackImageUrl) {
              e.currentTarget.src = fallbackImageUrl;
            } else {
              // 이미 fallbackImageUrl로 시도했는데 실패한 경우 더 이상 할 것이 없음
              // 콘솔에 오류 로그를 남기거나, 사용자에게 메시지 표시 등
              console.warn(`이미지 로딩 실패: ${coverUrl}. 대체 이미지 ${fallbackImageUrl}도 실패.`);
            }
          }}
        />
      </div>
      <p className="book-title">{title}</p>
      <p className="book-author">{author}</p>
    </div>
  );
};

// '오늘의 추천' 섹션 전체를 담당하는 컴포넌트
const TodaysRecommendationSection: React.FC = () => {
  const [recommendedBooks, setRecommendedBooks] = useState<RecommendedBookType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // ✨ getTodaysRecommendation 대신 getPopularBooks 호출
        // API 쿼리 파라미터 설정 (예: 1페이지의 5개 아이템)
        const queryParams: GetPopularBooksQueryParams = {
          page: 1,
          size: 5,
        };
        const response = await getPopularBooks(queryParams); // ✨ API 호출

        if (response.isSuccess && response.result && response.result.books) {
          // API 응답 데이터를 RecommendedBookType에 맞게 매핑
          const mappedBooks: RecommendedBookType[] = response.result.books.map((book: PopularBookItem) => ({
            id: book.isbn, // PopularBookItem에는 bookId가 없으므로, ISBN을 고유 ID로 사용
            coverUrl: book.image, // PopularBookItem의 'image' 필드를 'coverUrl'로 매핑
            title: book.title,
            author: book.author,
          }));
          setRecommendedBooks(mappedBooks);
        } else {
          // response.result나 response.result.books가 없을 경우도 처리
          setError(response.message || "오늘의 추천 도서를 가져오는데 실패했습니다.");
        }
      } catch (err: any) {
        console.error('추천 도서 데이터를 불러오는 중 오류 발생:', err);
        setError(`추천 도서를 불러오는 데 실패했습니다: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []); // 컴포넌트가 처음 마운트될 때 한 번만 실행

  if (isLoading) {
    return (
      <section className="todays-recommendation">
        <div className="recommendation-section-header">
          <h3>오늘의 추천</h3>
          <span className="more-text">오늘 가장 많이 읽은 책이에요</span>
        </div>
        <div className="recommendation-list horizontal-scroll-container">
          <p className="loading-message">오늘의 추천 데이터를 불러오는 중...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="todays-recommendation">
        <div className="recommendation-section-header">
          <h3>오늘의 추천</h3>
          <span className="more-text">오늘 가장 많이 읽은 책이에요</span>
        </div>
        <div className="recommendation-list horizontal-scroll-container">
          <p className="error-message" style={{ color: 'red' }}>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="todays-recommendation">
      <div className="recommendation-section-header">
        <h3>오늘의 추천</h3>
        <span className="more-text">오늘 가장 많이 읽은 책이에요</span>
      </div>
      <div className="recommendation-list horizontal-scroll-container">
        {recommendedBooks.length > 0 ? (
          recommendedBooks.map((book) => (
            <SingleRecommendedBookItem
              key={book.id} // key로 id (isbn) 사용
              id={book.id}
              coverUrl={book.coverUrl}
              title={book.title}
              author={book.author}
            />
          ))
        ) : (
          <p className="no-cards-message">추천 도서가 없습니다.</p>
        )}
      </div>
    </section>
  );
};

export default TodaysRecommendationSection;