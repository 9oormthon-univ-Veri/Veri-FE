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

    // 예시로 '사용자'라는 이름을 설정합니다.
    const fetchedUserName = '사용자'; // 실제로는 로그인된 사용자의 이름이 들어갈 자리입니다.
    setUserName(fetchedUserName);
  }, []); // 빈 배열은 컴포넌트가 처음 렌더링될 때 한 번만 실행됨을 의미합니다.


  return (
    <div className="library-page-container">
      <section className="library-hero-section">
        <img
          src="/images/your-background.png" // 배경 이미지
          className="hero-background"
        />

        <header className="hero-header">
          <img src="/icons/bell-icon.svg" className="icon" />
          <div className="header-icons">
            <img src="/icons/bell-icon.svg" className="icon" />
            <img src="/icons/search-icon.svg" className="icon" />
          </div>
        </header>


        <div className="hero-content">
          <div className="profile-circle"></div>
          <div className="welcome-text">
            <h2>반가워요, {userName}님!</h2>
            <p>오늘도 책 잘 기록해 봐요...</p>
          </div>
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