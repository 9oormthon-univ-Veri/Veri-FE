// src/pages/LibraryPage/TodaysRecommendation.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getTodaysRecommendation, type TodaysRecommendationBook } from '../../api/bookApi'; // ✨ API 임포트

// 개별 추천 책 아이템의 타입 정의
interface RecommendedBookType {
  id: string; // bookId
  coverUrl: string; // imageUrl
  title: string;
  author: string;
}

// 개별 추천 책 아이템을 렌더링하는 내부 컴포넌트
const SingleRecommendedBookItem: React.FC<RecommendedBookType> = ({ id, coverUrl, title, author }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/book-detail/${id}`);
  };

  return (
    <div className="recommended-book-item" onClick={handleClick}>
      <div className="book-cover-thumbnail">
        <img src={coverUrl || 'https://via.placeholder.com/80x120?text=No+Cover'} alt={title} onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/80x120?text=No+Cover"; }} />
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
        const response = await getTodaysRecommendation(); // ✨ API 호출

        if (response.isSuccess) {
          // API 응답 데이터를 RecommendedBookType에 맞게 매핑
          const mappedBooks: RecommendedBookType[] = response.result.map((book: TodaysRecommendationBook) => ({
            id: String(book.bookId), // bookId를 string으로 변환
            coverUrl: book.imageUrl,
            title: book.title,
            author: book.author,
          }));
          setRecommendedBooks(mappedBooks);
        } else {
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
        <div className="section-header">
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
        <div className="section-header">
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
      <div className="section-header">
        <h3>오늘의 추천</h3>
        <span className="more-text">오늘 가장 많이 읽은 책이에요</span>
      </div>
      <div className="recommendation-list horizontal-scroll-container">
        {recommendedBooks.length > 0 ? (
          recommendedBooks.map((book) => (
            <SingleRecommendedBookItem
              key={book.id}
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