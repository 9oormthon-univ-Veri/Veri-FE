// src/pages/LibraryPage.tsx
import './LibraryPage.css'; // LibraryPage 전체 스타일
import MyReadingCardSection from '../components/LibraryPage/MyReadingCard';
import MyBookshelfSection from '../components/LibraryPage/MyBookshelf';
import TodaysRecommendationSection from '../components/LibraryPage/TodaysRecommendation'; // 새로 임포트

function LibraryPage() {
  return (
    <div className="library-page-container">
      {/* 상단 헤더: 로고, 종 아이콘, 돋보기 아이콘 */}
      <header className="library-header">
        <div className="header-left">
          <span className="logo">로고</span> {/* 실제로는 이미지 또는 SVG 로고 */}
        </div>
        <div className="header-right">
          {/* 아이콘 경로 수정 필요 */}
          {/* 이미지 경로는 public 폴더 기준으로 설정해주세요. 예: /icons/bell-icon.svg */}
          <img src="/path/to/bell-icon.svg" alt="알림" className="icon" />
          <img src="/path/to/search-icon.svg" alt="검색" className="icon" />
        </div>
      </header>

      {/* 환영 메시지 섹션 */}
      <section className="welcome-section">
        <div className="profile-circle"></div> {/* 프로필 이미지 또는 아바타 */}
        <div className="welcome-text">
          <h2>반가워요, 하영님!</h2>
          <p>오늘도 책 잘 기록해 봐요...</p>
        </div>
        <div className="main-book-cover">
          {/* 큰 책 표지 이미지 (이미지 예시) */}
          <img src="https://via.placeholder.com/150x200?text=Your+Book" alt="메인 책 표지" />
        </div>
      </section>

      {/* 나의 독서카드 섹션 - 분리된 컴포넌트 사용 */}
      <MyReadingCardSection />

      {/* 나의 책장 섹션 - 분리된 컴포넌트 사용 */}
      <MyBookshelfSection />

      {/* 오늘의 추천 섹션 - 분리된 컴포넌트 사용 */}
      <TodaysRecommendationSection /> {/* 새로 추가된 컴포넌트 */}

    </div>
  );
}

export default LibraryPage;