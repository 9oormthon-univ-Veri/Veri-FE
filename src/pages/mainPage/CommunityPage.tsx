// src/pages/CameraPage.tsx
import { useNavigate } from 'react-router-dom';

const ICON_PATHS = {
  SEARCH: '/src/assets/icons/TopBar/search_fill.svg'
} as const;

function CommunityPage() {
  const navigate = useNavigate();

  return <div className="page-container">
    <header className="hero-header">
      <button
        type="button"
        className="color-main-icon"
        onClick={() => navigate('/library')}
        aria-label="홈으로 이동"
      />
      <div className="header-icons">
        <div className="color-notificationl-icon" />
        <button
          type="button"
          className="search-button"
          aria-label="검색"
        >
          <img src={ICON_PATHS.SEARCH} alt="" aria-hidden="true" />
        </button>
      </div>
    </header>
  </div>
}

export default CommunityPage;