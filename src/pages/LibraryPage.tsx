// src/pages/LibraryPage.tsx
import React from 'react';
import './LibraryPage.css'; // LibraryPage 전체 스타일
import MyReadingCardSection from './LibraryPage/MyReadingCard'; // 수정된 이름으로 임포트
import MyBookshelfSection from './LibraryPage/MyBookshelf'; // 수정된 이름으로 임포트

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

      {/* 오늘의 추천 섹션 (이 부분도 필요하다면 비슷한 방식으로 분리할 수 있습니다) */}
      <section className="todays-recommendation">
        <div className="section-header">
          <h3>오늘의 추천</h3>
          <span className="more-text">오늘 가장 많이 읽은 책이에요</span>
        </div>
        <div className="recommendation-list">
          {/* 추천 책 아이템 반복 */}
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="recommended-book-item">
              <div className="book-cover-thumbnail"></div> {/* 책 표지 썸네일 */}
              <p className="book-title">내게 남은 스물...</p>
              <p className="book-author">슈테판 페퍼(지은...)</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default LibraryPage;