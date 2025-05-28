// src/pages/LibraryPage/MyReadingCard.tsx
import React, { useEffect, useState } from 'react';

// 개별 독서카드 아이템의 타입
interface ReadingCardItemType {
  id: string;
  thumbnailUrl: string;
  text: string;
}

// 개별 독서카드 아이템을 렌더링하는 내부 컴포넌트
const SingleReadingCard: React.FC<ReadingCardItemType> = ({ thumbnailUrl, text }) => {
  return (
    <div className="reading-card-item">
      <div className="card-thumbnail">
        <img src={thumbnailUrl || 'https://via.placeholder.com/60x80?text=No+Image'} alt="카드 썸네일" />
      </div>
      <p className="card-text">{text}</p>
    </div>
  );
};

// '나의 독서카드' 섹션 전체를 담당하는 컴포넌트
const MyReadingCardSection: React.FC = () => {
  const [readingCards, setReadingCards] = useState<ReadingCardItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // public/datas/readingCards.json 경로로 fetch 요청
    // MyBookshelf.tsx와 동일한 패턴으로 fetch를 사용합니다.
    fetch('/datas/readingCards.json') 
      .then(response => {
        if (!response.ok) {
          // 네트워크 응답이 200 OK가 아니면 에러 발생 (예: 404 Not Found)
          // 에러 메시지에 URL을 포함시켜 디버깅에 도움을 줍니다.
          throw new Error('Network response was not ok: ' + response.statusText + '. Requested URL: /datas/readingCards.json');
        }
        return response.json(); // 응답을 JSON으로 파싱 시도
      })
      .then((data: ReadingCardItemType[]) => {
        setReadingCards(data);
        setIsLoading(false);
      })
      .catch(err => {
        // JSON 파싱 오류 또는 네트워크 오류 발생 시
        console.error('독서 카드를 불러오는 중 오류 발생:', err);
        setError('독서 카드를 불러오는 데 실패했습니다: ' + err.message);
        setIsLoading(false);
      });
  }, []); // 빈 배열은 컴포넌트가 처음 마운트될 때 한 번만 실행됨을 의미합니다.

  if (isLoading) {
    return <p>독서 카드를 불러오는 중...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <section className="my-reading-cards">
      <div className="section-header">
        <h3>나의 독서카드</h3>
        <span className="more-link">책갈피 보러가기 &gt;</span>
      </div>
      {/* 여기에 horizontal-scroll-container 클래스 추가 */}
      <div className="card-list horizontal-scroll-container">
        {readingCards.length > 0 ? (
          readingCards.map((card) => (
            <SingleReadingCard
              key={card.id}
              id={card.id}
              thumbnailUrl={card.thumbnailUrl}
              text={card.text}
            />
          ))
        ) : (
          <p>등록된 독서 카드가 없습니다.</p>
        )}
      </div>
    </section>
  );
};

export default MyReadingCardSection;