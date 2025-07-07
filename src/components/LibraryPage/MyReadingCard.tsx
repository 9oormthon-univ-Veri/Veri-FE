// src/components/LibraryPage/MyReadingCard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './MyReadingCard.module.css';
// cardApi에서 MyCardItem 타입과 getMyCards, GetMyCardsQueryParams 타입을 임포트합니다.
import { getMyCards, type MyCardItem, type GetMyCardsQueryParams } from '../../api/cardApi';

// 개별 독서카드 아이템의 타입 정의
interface ReadingCardItemType {
  id: string; // cardId 사용
  coverUrl: string;       // MyCardItem.image 필드 사용
  title: string;          // API에 직접 없음: 임시 값 또는 '알 수 없음'으로 처리
  readingDate: string;    // API에 직접 없음: 임시 값 또는 '날짜 정보 없음'으로 처리
  contentPreview: string; // 독서 내용 미리보기 (content)
}

// 개별 독서카드 아이템을 렌더링하는 내부 컴포넌트
const SingleReadingCard: React.FC<ReadingCardItemType> = React.memo(({ id, coverUrl, title, contentPreview }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // ✨ 독서 카드 상세 페이지로 이동 시 카드 ID를 전달합니다.
    // ReadingCardDetailPage의 라우트가 /reading-card-detail/:id 이므로 이에 맞춰 수정합니다.
    navigate(`/reading-card-detail/${id}`); 
  };

  return (
    <div className={styles.readingCardItem} onClick={handleCardClick}>
      <div className={styles.cardThumbnail}>
        <img
          src={coverUrl || 'https://via.placeholder.com/100x150?text=No+Image'}
          alt={title || '독서 카드 이미지'}
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/100x150?text=No+Image";
          }}
        />
      </div>
      {/* title과 readingDate는 현재 API에서 직접 제공되지 않아 표시하지 않거나,
          필요하다면 별도 로직으로 보완해야 합니다. 여기서는 contentPreview만 표시합니다. */}
      {/* <p className={styles.cardTitle}>{title}</p> */}
      {/* <p className={styles.cardDate}>{readingDate}</p> */}
      <p className={styles.cardText}>{contentPreview}</p>
    </div>
  );
});

interface MyReadingCardSectionProps {
  cards: any[];
}

const MyReadingCardSection: React.FC<MyReadingCardSectionProps> = React.memo(({ cards }) => {
  const navigate = useNavigate();
  // API 호출 및 useState 제거
  if (!cards) {
    return null;
  }
  if (cards.length === 0) {
    return (
      <section className={styles.myReadingCards}>
        <div className={styles.sectionHeader}>
          <h3>나의 독서카드</h3>
          <span className={styles.moreLink} onClick={() => navigate('/reading-card')}>
            독서카드 보러가기 &gt;
          </span>
        </div>
        <div className={styles.horizontalScrollContainer}>
          <p className={styles.noCardsMessage}>등록된 독서 카드가 없습니다.</p>
        </div>
      </section>
    );
  }
  return (
    <section className={styles.myReadingCards}>
      <div className={styles.sectionHeader}>
        <h3>나의 독서카드</h3>
        <span className={styles.moreLink} onClick={() => navigate('/reading-card')}>
          독서카드 보러가기 &gt;
        </span>
      </div>
      <div className={styles.horizontalScrollContainer}>
        {cards.map((card: any) => (
          <SingleReadingCard
            key={card.cardId}
            id={String(card.cardId)}
            coverUrl={card.image}
            title={"책 제목 정보 없음"}
            readingDate={"날짜 정보 없음"}
            contentPreview={card.content.length > 50 ? card.content.substring(0, 50) + '...' : card.content}
          />
        ))}
      </div>
    </section>
  );
});

export default MyReadingCardSection;
