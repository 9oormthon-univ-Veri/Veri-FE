// src/components/LibraryPage/MyReadingCard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './MyReadingCard.module.css';
import { getMyCards, type Card } from '../../api/cardApi'; // API 임포트

// 개별 독서카드 아이템의 타입 정의
interface ReadingCardItemType {
  id: string; // cardId 사용
  coverUrl: string; // 책 표지 썸네일 URL (book.coverUrl)
  title: string;    // 책 제목 (book.title)
  readingDate: string; // 독서 날짜 (createdAt)
  contentPreview: string; // 독서 내용 미리보기 (content)
}

// 개별 독서카드 아이템을 렌더링하는 내부 컴포넌트
const SingleReadingCard: React.FC<ReadingCardItemType> = ({ id, coverUrl, title, contentPreview }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/reading-card-detail/${id}`);
  };

  return (
    <div className={styles.readingCardItem} onClick={handleCardClick}>
      <div className={styles.cardThumbnail}>
        <img
          src={coverUrl || 'https://via.placeholder.com/100x150?text=No+Image'}
          alt={title || '책 표지'}
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/100x150?text=No+Image";
          }}
        />
      </div>
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

  // accessToken 변수 제거

  useEffect(() => {
    const fetchCards = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getMyCards(); // accessToken 인자 제거
        if (response.isSuccess) {
          const mappedCards: ReadingCardItemType[] = response.result.cards.map((card: Card) => ({
            id: String(card.cardId),
            coverUrl: card.book.coverUrl,
            title: card.book.title,
            readingDate: new Date(card.createdAt).toLocaleDateString('ko-KR'),
            contentPreview: card.content.length > 50 ? card.content.substring(0, 50) + '...' : card.content,
          }));
          setReadingCards(mappedCards);
        } else {
          setError(response.message || "독서 카드를 가져오는데 실패했습니다.");
        }
      } catch (err: any) {
        console.error('독서 카드를 불러오는 중 오류 발생:', err);
        setError(`독서 카드를 불러오는 데 실패했습니다: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, []); // 의존성 배열에서 accessToken 제거

  if (isLoading) {
    return (
      <section className={styles.myReadingCards}>
        <div className={styles.sectionHeader}>
          <h3>나의 독서카드</h3>
          <span className={styles.moreLink} onClick={() => navigate('/reading-card-list')}>
            책갈피 보러가기 &gt;
          </span>
        </div>
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
              title={card.title}
              // author 필드 제거
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