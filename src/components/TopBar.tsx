import React from 'react';
import { useNavigate } from 'react-router-dom';
import searchFillIcon from '../assets/icons/TopBar/search_fill.svg';
import profileIcon from '../assets/icons/TopBar/profile.svg';
import unionIcon from '../assets/icons/TopBar/union_fill.svg';
import notificationIcon from '../assets/icons/TopBar/notificationl_fill.svg';

interface TopBarProps {
  showProfile?: boolean;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  showProfile = true,
  onSearchClick,
  onNotificationClick,
  onProfileClick
}) => {
  const navigate = useNavigate();

  const handleSearchClick = () => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      navigate('/book-search');
    }
  };

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    }
    // 기본 알림 기능은 아직 없음
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      navigate('/my-page');
    }
  };

  return (
    <header className="hero-header">
      <button 
        type="button" 
        className="main-icon" 
        onClick={() => navigate('/')}
        aria-label="홈으로 이동"
      >
        <img src={unionIcon} alt="홈" />
      </button>
      <div className="header-icons">
        <button 
          type="button" 
          className="search-button" 
          aria-label="검색" 
          onClick={handleSearchClick}
        >
          <img src={searchFillIcon} alt="" aria-hidden="true" />
        </button>
        <button 
          type="button" 
          className="notification-button" 
          aria-label="알림"
          onClick={handleNotificationClick}
        >
          <img src={notificationIcon} alt="알림" />
        </button>
        {showProfile && (
          <button
            type="button"
            className="my-page-button"
            aria-label="프로필 보기"
            onClick={handleProfileClick}
          >
            <img src={profileIcon} alt="프로필" />
          </button>
        )}
      </div>
    </header>
  );
};

export default TopBar;
