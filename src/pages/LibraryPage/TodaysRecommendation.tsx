// src/pages/LibraryPage/TodaysRecommendation.tsx
import React, { useEffect, useState } from 'react';

// 개별 추천 책 아이템의 타입
interface RecommendedBookType {
  id: string;
  coverUrl: string;
  title: string;
  author: string;
}

// 개별 추천 책 아이템을 렌더링하는 내부 컴포넌트 (SingleBookshelfItem과 유사)
const SingleRecommendedBookItem: React.FC<RecommendedBookType> = ({ coverUrl, title, author }) => {
  return (
    <div className="recommended-book-item">
      <div className="book-cover-thumbnail">
        <img src={coverUrl || 'https://via.placeholder.com/80x120?text=No+Cover'} alt={title} />
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
    // public 폴더의 JSON 파일 경로
    fetch('/datas/recommendations.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText + '. Requested URL: /datas/recommendations.json');
        }
        return response.json();
      })
      .then((data: RecommendedBookType[]) => {
        setRecommendedBooks(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('추천 도서 데이터를 불러오는 중 오류 발생:', err);
        setError('추천 도서를 불러오는 데 실패했습니다: ' + err.message);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <p>오늘의 추천 데이터를 불러오는 중...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <section className="todays-recommendation">
      <div className="section-header">
        <h3>오늘의 추천</h3>
        <span className="more-text">오늘 가장 많이 읽은 책이에요</span>
      </div>
      {/* 가로 스크롤을 위해 horizontal-scroll-container 클래스 추가 */}
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
          <p>추천 도서가 없습니다.</p>
        )}
      </div>
    </section>
  );
};

export default TodaysRecommendationSection;