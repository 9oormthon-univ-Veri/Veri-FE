// src/pages/LibraryPage/TodaysRecommendation.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate 임포트

// ---
// 개별 추천 책 아이템의 타입 정의
// ---
interface RecommendedBookType {
  id: string;
  coverUrl: string;
  title: string;
  author: string;
}

// ---
// 개별 추천 책 아이템을 렌더링하는 내부 컴포넌트
// ---
const SingleRecommendedBookItem: React.FC<RecommendedBookType> = ({ id, coverUrl, title, author }) => {
  const navigate = useNavigate(); // SingleRecommendedBookItem 내부에서 useNavigate 훅 사용

  const handleClick = () => {
    // 클릭 시 해당 책의 상세 페이지로 이동 (필요하다면 실제 라우팅 경로로 수정)
    navigate(`/book-detail/${id}`);
  };

  return (
    // LibraryPage.css의 .recommended-book-item 클래스 적용
    <div className="recommended-book-item" onClick={handleClick}>
      <div className="book-cover-thumbnail">
        {/* coverUrl이 없을 경우를 대비한 폴백 이미지 */}
        <img src={coverUrl || 'https://via.placeholder.com/80x120?text=No+Cover'} alt={title} />
      </div>
      {/* LibraryPage.css의 .book-title과 .book-author에 말줄임표 스타일이 있으므로 긴 제목도 잘 처리됩니다. */}
      <p className="book-title">{title}</p>
      <p className="book-author">{author}</p>
    </div>
  );
};

// ---
// '오늘의 추천' 섹션 전체를 담당하는 컴포넌트
// ---
const TodaysRecommendationSection: React.FC = () => {
  const [recommendedBooks, setRecommendedBooks] = useState<RecommendedBookType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // public 폴더의 JSON 파일 경로로 fetch 요청
    fetch('/datas/recommendations.json')
      .then(response => {
        if (!response.ok) {
          // 네트워크 응답이 200 OK가 아니면 에러 발생
          throw new Error(`Network response was not ok: ${response.statusText}. Requested URL: /datas/recommendations.json`);
        }
        return response.json();
      })
      .then((data: RecommendedBookType[]) => {
        setRecommendedBooks(data);
        setIsLoading(false);
      })
      .catch(err => {
        // JSON 파싱 오류 또는 네트워크 오류 발생 시
        console.error('추천 도서 데이터를 불러오는 중 오류 발생:', err);
        setError(`추천 도서를 불러오는 데 실패했습니다: ${err.message}`);
        setIsLoading(false);
      });
  }, []); // 컴포넌트가 처음 마운트될 때 한 번만 실행

  // ---
  // 로딩, 에러, 데이터 없음 상태에 대한 조건부 렌더링
  // ---
  if (isLoading) {
    return (
      <section className="todays-recommendation">
        <div className="section-header">
          <h3>오늘의 추천</h3>
          <span className="more-text">오늘 가장 많이 읽은 책이에요</span> {/* 이 텍스트는 링크가 아니므로 onClick 없음 */}
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
    // LibraryPage.css의 section 공통 스타일 (예: .todays-recommendation) 적용
    <section className="todays-recommendation">
      <div className="section-header">
        <h3>오늘의 추천</h3>
        {/* "오늘 가장 많이 읽은 책이에요" 텍스트는 현재 링크가 아니므로 onClick 제거 */}
        <span className="more-text">오늘 가장 많이 읽은 책이에요</span>
      </div>
      {/* LibraryPage.css의 .recommendation-list와 .horizontal-scroll-container 클래스 적용 */}
      <div className="recommendation-list horizontal-scroll-container">
        {recommendedBooks.length > 0 ? (
          recommendedBooks.map((book) => (
            <SingleRecommendedBookItem
              key={book.id}
              id={book.id} // SingleRecommendedBookItem에 id 전달 (클릭 이벤트에 사용)
              coverUrl={book.coverUrl}
              title={book.title}
              author={book.author}
            />
          ))
        ) : (
          // 추천 도서가 없을 때 표시할 메시지
          <p className="no-cards-message">추천 도서가 없습니다.</p>
        )}
      </div>
    </section>
  );
};

export default TodaysRecommendationSection;