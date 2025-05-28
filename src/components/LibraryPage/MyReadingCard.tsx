// src/pages/LibraryPage/MyReadingCard.tsx
import React, { useEffect, useState } from 'react';

// src/pages/LibraryPage/MyReadingCard.tsx
// 개별 독서카드 아이템의 타입
interface ReadingCardItemType {
  id: string;
  thumbnailUrl: string; // 책 표지 썸네일
  bookTitle: string;    // ✨ 추가: 책 제목
  author: string;       // ✨ 추가: 저자
  readingDate: string;  // ✨ 추가: 독서 날짜 (예: "YYYY.MM.DD")
  contentPreview: string; // ✨ 변경: 'text' 대신 'contentPreview'로 구체화 (독서 내용 미리보기)
}

// 개별 독서카드 아이템을 렌더링하는 내부 컴포넌트
const SingleReadingCard: React.FC<ReadingCardItemType> = ({ thumbnailUrl, bookTitle, author, readingDate, contentPreview }) => {
  return (
    <div className="reading-card-item">
      <div className="card-thumbnail">
        {/* thumbnailUrl이 없을 경우를 대비한 폴백 이미지 */}
        <img src={thumbnailUrl || 'https://via.placeholder.com/60x80?text=No+Image'} alt={bookTitle || '카드 썸네일'} />
      </div>
      <div className="card-info"> {/* 정보 표시를 위한 새로운 div 추가 */}
        <h4 className="card-book-title">{bookTitle}</h4> {/* 책 제목 */}
        <p className="card-author">{author}</p>         {/* 저자 */}
        <p className="card-preview">{contentPreview}</p> {/* 독서 내용 미리보기 */}
        <span className="card-date">{readingDate}</span> {/* 독서 날짜 */}
      </div>
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
      <div className="card-list horizontal-scroll-container">
        {readingCards.length > 0 ? (
          readingCards.map((card) => (
            <SingleReadingCard
              key={card.id}
              id={card.id}
              thumbnailUrl={card.thumbnailUrl}
              bookTitle={card.bookTitle}
              author={card.author}
              readingDate={card.readingDate}
              contentPreview={card.contentPreview}
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