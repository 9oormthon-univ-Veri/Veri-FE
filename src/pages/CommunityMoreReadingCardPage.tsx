// src/pages/mainPage/CommunityMoreReadingCard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCards } from '../api/communityApi';
import type { Card, GetCardsQueryParams } from '../api/communityApi';
import './CommunityMoreReadingCardPage.css';

function CommunityMoreReadingCardPage() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 카드 데이터 로드
  const loadCards = async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true);
      }
      setError(null);
      
      const params: GetCardsQueryParams = {
        page: page,
        size: 12, // 2x2 그리드로 3페이지씩 표시
        sort: 'newest'
      };
      
      const response = await getCards(params);
      
      if (response.isSuccess && response.result) {
        const newCards = response.result.cards;
        
        if (reset) {
          setCards(newCards);
        } else {
          setCards(prevCards => [...prevCards, ...newCards]);
        }
        
        setHasMore(page < response.result.totalPages);
        setCurrentPage(page);
      } else {
        throw new Error(response.message || '독서카드를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('독서카드 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCards(1, true);
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleCardClick = (cardId: number) => {
    // 독서카드 상세 페이지로 이동 (실제 구현 시 해당 페이지로 연결)
    navigate(`/reading-card-detail/${cardId}`);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadCards(currentPage + 1, false);
    }
  };

  const handleRefresh = () => {
    loadCards(1, true);
  };

  // 날짜 포맷팅 함수
  // const formatDate = (dateString: string) => {
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString('ko-KR', {
  //     year: 'numeric',
  //     month: '2-digit',
  //     day: '2-digit'
  //   }).replace(/\./g, '.').replace(/\s/g, '');
  // };

  if (isLoading && cards.length === 0) {
    return (
      <div className="page-container">
        {/* 헤더 */}
        <header className="detail-header">
          <button className="header-left-arrow" onClick={handleBack}>
            <span className="mgc_left_fill"></span>
          </button>
          <h3>독서카드</h3>
          <div className="header-right-wrapper"></div>
        </header>

        <div className="header-margin"></div>

        <div className="reading-cards-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>독서카드를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        {/* 헤더 */}
        <header className="detail-header">
          <button className="header-left-arrow" onClick={handleBack}>
            <span className="mgc_left_fill"></span>
          </button>
          <h3>독서카드</h3>
          <div className="header-right-wrapper"></div>
        </header>

        <div className="header-margin"></div>

        <div className="reading-cards-page">
          <div className="error-container">
            <p>{error}</p>
            <button onClick={handleRefresh} className="retry-button">
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* 헤더 */}
      <header className="detail-header">
        <button className="header-left-arrow" onClick={handleBack}>
          <span className="mgc_left_fill"></span>
        </button>
        <h3>독서카드</h3>
        <div className="header-right-wrapper"></div>
      </header>

      <div className="header-margin"></div>

      <div className="reading-cards-page">
        {/* 독서카드 그리드 */}
        <div className="reading-cards-grid">
          {cards.map((card) => (
            <div 
              key={card.cardId} 
              className="reading-card-item"
              onClick={() => handleCardClick(card.cardId)}
            >
              {/* 카드 이미지 */}
              <div className="card-image">
                <img 
                  src={card.image} 
                  alt="독서카드 이미지"
                  onError={(e) => {
                    e.currentTarget.src = '/images/cardSample/forest.jpg';
                  }}
                />
              </div>

              {/* 카드 정보 */}
              <div className="card-info">
                {/* 사용자 정보 */}
                <div className="card-user">
                  <div className="user-avatar">
                    <img 
                      src={card.member.profileImageUrl} 
                      alt={card.member.nickname}
                      onError={(e) => {
                        e.currentTarget.src = '/images/profileSample/sample_user.png';
                      }}
                    />
                  </div>
                  <div className="user-name">{card.member.nickname}</div>
                </div>

                {/* 인용구 */}
                <div className="card-quote">
                  {card.content.length > 50 
                    ? card.content.substring(0, 50) + '...' 
                    : card.content
                  }
                </div>

                {/* 책 정보 */}
                <div className="card-book">
                  <span className="book-icon">📖</span>
                  <span className="book-title">{card.bookTitle}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 더 보기 버튼 */}
        {hasMore && (
          <div className="load-more-container">
            <button 
              className="load-more-button"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? '불러오는 중...' : '더 보기'}
            </button>
          </div>
        )}

        {/* 게시글이 없는 경우 */}
        {!isLoading && cards.length === 0 && !error && (
          <div className="no-cards">
            <p>아직 독서카드가 없습니다.</p>
            <p>첫 번째 독서카드를 만들어보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommunityMoreReadingCardPage;
