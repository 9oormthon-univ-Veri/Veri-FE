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
const SingleReadingCard: React.FC<ReadingCardItemType> = ({ id, coverUrl, title, contentPreview }) => {
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
};

// '나의 독서카드' 섹션 전체를 담당하는 컴포넌트
const MyReadingCardSection: React.FC = () => {
  const navigate = useNavigate();
  const [readingCards, setReadingCards] = useState<ReadingCardItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // getMyCards에 쿼리 파라미터를 전달합니다.
        const queryParams: GetMyCardsQueryParams = {
          page: 1,
          size: 5,
          sort: 'newest',
        };
        const response = await getMyCards(queryParams);

        if (response.isSuccess) {
          if (response.result && Array.isArray(response.result.cards)) {
            // ✨ response.result.cards는 MyCardItem[] 타입이므로, 이에 맞춰 매핑합니다.
            const mappedCards: ReadingCardItemType[] = response.result.cards.map((card: MyCardItem) => ({
              id: String(card.cardId),
              coverUrl: card.image, // MyCardItem의 'image' 필드를 'coverUrl'로 사용
              title: "책 제목 정보 없음", // MyCardItem에 책 제목 정보가 없으므로 임시 처리
              readingDate: "날짜 정보 없음", // MyCardItem에 날짜 정보가 없으므로 임시 처리
              contentPreview: card.content.length > 50 ? card.content.substring(0, 50) + '...' : card.content,
            }));
            setReadingCards(mappedCards);
          } else {
            console.warn("API는 성공을 반환했지만, 카드 데이터(result.cards)가 없거나 형식이 잘못되었습니다:", response);
            setReadingCards([]);
            setError("독서 카드를 불러왔으나, 표시할 내용이 없습니다.");
          }
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
  }, []); // 의존성 배열은 빈 채로 유지하여 컴포넌트 마운트 시 한 번만 실행

  // 로딩, 에러, 데이터 없음 상태 처리
  if (isLoading) {
    return (
      <section className={styles.myReadingCards}>
        <div className={styles.sectionHeader}>
          <p>나의 독서카드</p>
          <span className={styles.moreLink} onClick={() => navigate('/reading-card')}> {/* 책갈피 페이지 대신 독서카드 메인 페이지로 이동 */}
            독서카드 보러가기 &gt;
          </span>
        </div>
        <div className={styles.horizontalScrollContainer}>
          <p className={styles.loadingMessage}>독서 카드를 불러오는 중...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.myReadingCards}>
        <div className={styles.sectionHeader}>
          <p>나의 독서카드</p>
          <span className={styles.moreLink} onClick={() => navigate('/reading-card')}> {/* 책갈피 페이지 대신 독서카드 메인 페이지로 이동 */}
            독서카드 보러가기 &gt;
          </span>
        </div>
        <div className={styles.horizontalScrollContainer}>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.myReadingCards}>
      <div className={styles.sectionHeader}>
        <p>나의 독서카드</p>
        <span className={styles.moreLink} onClick={() => navigate('/reading-card')}> {/* 책갈피 페이지 대신 독서카드 메인 페이지로 이동 */}
          독서카드 보러가기 &gt;
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
