// src/pages/CommunityPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import { SkeletonList, SkeletonCard } from '../../components/SkeletonUI';
import './CommunityPage.css';

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

  return (
    <div className="page-container">
      <TopBar onProfileClick={handleProfileClick} />
      
      <div className="header-margin"></div>
      
      <div className="community-content">
        <div className="community-section">
          <h2 className="section-title">커뮤니티</h2>
          
          {isLoading ? (
            <div className="community-loading">
              <SkeletonList count={5}>
                <SkeletonCard />
              </SkeletonList>
            </div>
          ) : (
            <div className="community-placeholder">
              <div className="placeholder-content">
                <h3>독서 커뮤니티</h3>
                <p>다른 사용자들과 독서 경험을 공유하고<br/>새로운 책을 발견해보세요!</p>
                <div className="coming-soon">
                  <span>곧 출시 예정</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='main-page-margin'></div>
    </div>
  );
}

export default CommunityPage;