// src/components/LibraryPage/MyReadingCard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 🌟 MyReadingCard.module.css 임포트 🌟
import styles from './MyReadingCard.module.css'; 

// ---
// 개별 독서카드 아이템의 타입 정의
// ---
interface ReadingCardItemType {
  id: string;
  coverUrl: string; // 책 표지 썸네일 URL
  title: string;    // 책 제목 (alt 텍스트에 사용)
  author: string;   // 저자
  readingDate: string; // 독서 날짜
  contentPreview: string; // 독서 내용 미리보기
}

// ---
// 개별 독서카드 아이템을 렌더링하는 내부 컴포넌트
// ---
const SingleReadingCard: React.FC<ReadingCardItemType> = ({ id, coverUrl, title, contentPreview }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/reading-card-detail/${id}`);
  };

  return (
    // 🌟 .readingCardItem 클래스 적용 🌟
    <div className={styles.readingCardItem} onClick={handleCardClick}>
      {/* 🌟 .cardThumbnail 클래스 적용 🌟 */}
      <div className={styles.cardThumbnail}>
        <img
          src={coverUrl || 'https://via.placeholder.com/100x150?text=No+Image'}
          alt={title || '책 표지'} // alt 텍스트에 title 사용
        />
      </div>
      {/* 🌟 .cardText 클래스 적용 🌟 */}
      <p className={styles.cardText}>{contentPreview}</p>
    </div>
  );
};

// '나의 독서카드' 섹션 전체를 담당하는 컴포넌트
const MyReadingCardSection: React.FC = () => {
  const navigate = useNavigate();
  const [readingCards, setReadingCards] = useState<ReadingCardItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/datas/readingCards.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}. Requested URL: /datas/readingCards.json`);
        }
        return response.json();
      })
      .then((data: ReadingCardItemType[]) => {
        setReadingCards(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('독서 카드를 불러오는 중 오류 발생:', err);
        setError(`독서 카드를 불러오는 데 실패했습니다: ${err.message}`);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      // 🌟 .myReadingCards 클래스 적용 🌟
      <section className={styles.myReadingCards}>
        {/* 🌟 .sectionHeader 및 .moreLink 클래스 적용 🌟 */}
        <div className={styles.sectionHeader}>
          <h3>나의 독서카드</h3>
          <span className={styles.moreLink} onClick={() => navigate('/reading-card-list')}>
            책갈피 보러가기 &gt;
          </span>
        </div>
        {/* 🌟 .horizontalScrollContainer 및 .cardList (optional) 클래스 적용 🌟 */}
        <div className={`${styles.horizontalScrollContainer}`}>
          <p className={styles.loadingMessage}>독서 카드를 불러오는 중...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.myReadingCards}>
        <div className={styles.sectionHeader}>
          <h3>나의 독서카드</h3>
          <span className={styles.moreLink} onClick={() => navigate('/reading-card-list')}>
            책갈피 보러가기 &gt;
          </span>
        </div>
        <div className={`${styles.horizontalScrollContainer}`}>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.myReadingCards}>
      <div className={styles.sectionHeader}>
        <h3>나의 독서카드</h3>
        <span className={styles.moreLink} onClick={() => navigate('/reading-card-list')}>
          책갈피 보러가기 &gt;
        </span>
      </div>
      <div className={styles.horizontalScrollContainer}>
        {readingCards.length > 0 ? (
          readingCards.map((card) => (
            <SingleReadingCard
              key={card.id}
              id={card.id}
              coverUrl={card.coverUrl}
              title={card.title} // title prop 전달
              author={card.author}
              readingDate={card.readingDate}
              contentPreview={card.contentPreview}
            />
          ))
        ) : (
          <p className={styles.noCardsMessage}>등록된 독서 카드가 없습니다.</p>
        )}
      </div>
    </section>
  );
};

export default MyReadingCardSection;