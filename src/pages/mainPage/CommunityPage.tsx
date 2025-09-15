// src/pages/CommunityPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import { SkeletonList, SkeletonCard } from '../../components/SkeletonUI';
import './CommunityPage.css';

// 목업 데이터
const mockReadingCards = [
  { id: 1, image: '/src/assets/images/cardSample/color.jpg' },
  { id: 2, image: '/src/assets/images/cardSample/forest.jpg' },
  { id: 3, image: '/src/assets/images/cardSample/river.jpg' },
  { id: 4, image: '/src/assets/images/cardSample/sea.jpg' },
  { id: 5, image: '/src/assets/images/cardSample/sky.jpg' },
  { id: 6, image: '/src/assets/images/cardSample/color.jpg' }
];

const mockRecommendations = [
  {
    id: 1,
    author: '김현아',
    authorDescription: '📚 내가 남은 스물다섯 번의 개월',
    image: '/src/assets/images/cardSample/forest.jpg',
    likes: 125,
    comments: 19,
    content: '행정자부의 절은 국무위원 중에서 국무총리의 제청으로 대통령이 임명한다. 모든 국민은 법 앞에 평등하다. 누구든지 성별, 종교...',
    date: '2025.08.16'
  },
  {
    id: 2,
    author: '김현아',
    authorDescription: '📚 내가 남은 스물다섯 번의 개월',
    image: '/src/assets/images/cardSample/river.jpg',
    likes: 125,
    comments: 19,
    content: '행정자부의 절은 국무위원 중에서 국무총리의 제청으로 대통령이 임명한다. 모든 국민은 법 앞에 평등하다. 누구든지 성별, 종교...',
    date: '2025.08.16'
  }
];

function CommunityPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 임시 로딩 시뮬레이션
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleProfileClick = () => {
    navigate('/my-page');
  };

  const handleMoreCardsClick = () => {
    navigate('/reading-card');
  };

  const handlePostClick = (postId: number) => {
    navigate(`/community/post/${postId}`);
  };

  return (
    <div className="page-container">
      <TopBar onProfileClick={handleProfileClick} />
      
      <div className="header-margin"></div>
      
      <div className="community-content">
        {/* 독서카드 섹션 */}
        <div className="reading-cards-section">
          <h2 className="section-title">독서카드</h2>
          
          {isLoading ? (
            <div className="cards-loading">
              <SkeletonList count={6}>
                <SkeletonCard />
              </SkeletonList>
            </div>
          ) : (
            <>
              <div className="reading-cards-grid">
                {mockReadingCards.map((card) => (
                  <div key={card.id} className="reading-card-item">
                    <div 
                      className="reading-card-image"
                      style={{ backgroundImage: `url(${card.image})` }}
                    />
                  </div>
                ))}
              </div>
              
              <button className="more-cards-button" onClick={handleMoreCardsClick}>
                독서카드 더 보러가기
              </button>
            </>
          )}
        </div>

        {/* 이달의 추천 섹션 */}
        <div className="recommendations-section">
          <div className="recommendations-header">
            <h2 className="section-title">이달의 추천</h2>
            <p className="section-subtitle">다른 회원들의 글을 만나보세요</p>
          </div>

          {isLoading ? (
            <div className="recommendations-loading">
              <SkeletonList count={2}>
                <SkeletonCard />
              </SkeletonList>
            </div>
          ) : (
                         <div className="recommendations-list">
               {mockRecommendations.map((recommendation) => (
                 <div 
                   key={recommendation.id} 
                   className="recommendation-item"
                   onClick={() => handlePostClick(recommendation.id)}
                 >
                  <div className="recommendation-header">
                    <div className="author-info">
                      <div className="author-avatar">
                        <img src="/src/assets/images/profileSample/sample_user.png" alt="프로필" />
                      </div>
                      <div className="author-details">
                        <div className="author-name">{recommendation.author}</div>
                        <div className="author-description">{recommendation.authorDescription}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="recommendation-image">
                    <img src={recommendation.image} alt="추천 이미지" />
                  </div>
                  
                  <div className="recommendation-actions">
                    <div className="action-buttons">
                      <button className="action-button">
                        <span className="heart-icon">♡</span>
                        <span>{recommendation.likes}</span>
                      </button>
                      <button className="action-button">
                        <span className="comment-icon">💬</span>
                        <span>{recommendation.comments}</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="recommendation-content">
                    <p>{recommendation.content}</p>
                    <div className="recommendation-date">{recommendation.date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className='main-page-margin'></div>
    </div>
  );
}

export default CommunityPage;