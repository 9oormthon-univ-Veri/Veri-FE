// src/pages/LibraryPage.tsx
import { useState, useEffect } from 'react'; // useState와 useEffect를 임포트합니다.
import './LibraryPage.css'; // LibraryPage 전체 스타일
import MyReadingCardSection from '../components/LibraryPage/MyReadingCard';
import MyBookshelfSection from '../components/LibraryPage/MyBookshelf';
import TodaysRecommendationSection from '../components/LibraryPage/TodaysRecommendation';

function LibraryPage() {
  // 1. 사용자 이름을 관리할 상태(state)를 정의합니다.
  // 초기값은 비워두거나, '게스트' 등으로 설정할 수 있습니다.
  const [userName, setUserName] = useState(''); // 초기값은 빈 문자열

  // 2. 컴포넌트가 마운트될 때 (처음 로드될 때) 사용자 이름을 가져오는 로직을 추가합니다.
  // 실제 앱에서는 로그인된 사용자 정보를 API 호출 등으로 가져올 것입니다.
  useEffect(() => {
    // 여기에 실제 사용자 이름을 가져오는 비동기 로직을 작성합니다.
    // 예: API 호출
    // fetch('/api/user-profile')
    //   .then(response => response.json())
    //   .then(data => setUserName(data.name))
    //   .catch(error => console.error('사용자 정보를 가져오는 데 실패했습니다:', error));

    // 예시로 '사용자'라는 이름을 설정합니다.
    const fetchedUserName = '사용자'; // 실제로는 로그인된 사용자의 이름이 들어갈 자리입니다.
    setUserName(fetchedUserName);
  }, []); // 빈 배열은 컴포넌트가 처음 렌더링될 때 한 번만 실행됨을 의미합니다.


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
          {/* 3. userName 상태를 사용하여 동적으로 이름을 표시합니다. */}
          <h2>반가워요, {userName}님!</h2>
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
      <TodaysRecommendationSection />

    </div>
  );
}

export default LibraryPage;