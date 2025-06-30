// src/pages/LibraryPage.tsx
import { useState, useEffect } from 'react';
import './LibraryPage.css'; // LibraryPage 전체 스타일
import MyReadingCardSection from '../../components/LibraryPage/MyReadingCard';
import MyBookshelfSection from '../../components/LibraryPage/MyBookshelf';
import TodaysRecommendationSection from '../../components/LibraryPage/TodaysRecommendation';

// API 응답에 맞춘 사용자 데이터 인터페이스 (MyPage.tsx와 동일)
interface UserData {
  id: string;
  name: string;
  booksRead: number;
  readingCards: number;
  profileImageUrl: string | undefined;
}

// 💡 필요한 API 함수들을 임포트합니다.
import { getMemberProfile } from '../../api/memberApi';
import { getRandomBook } from '../../api/bookApi'; // 💡 getRandomBook 함수 임포트

function LibraryPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [bookImageUrl, setBookImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      const fetchAllData = async () => {
          try {
              // 1. 사용자 프로필 API 호출
              const userResponse = await getMemberProfile();
              if (userResponse.isSuccess && userResponse.result) {
                  setUserData({
                      id: userResponse.result.memberId.toString(),
                      name: userResponse.result.name,
                      booksRead: userResponse.result.booksRead,
                      readingCards: userResponse.result.readingCards,
                      profileImageUrl: userResponse.result.profileImageUrl,
                  });
              } else {
                  setError(userResponse.message);
              }

              // 💡 2. 랜덤 책을 가져오는 API 호출
              const randomBook = await getRandomBook(); 
              // getRandomBook 함수는 Promise<Book>을 반환하므로, 바로 imageUrl에 접근할 수 있습니다.
              setBookImageUrl(randomBook.imageUrl); 
              
          } catch (err: any) { // 타입 추론이 안될 때 any 사용
              console.error('Error fetching data:', err);
              setError('데이터를 불러오는 데 실패했습니다: ' + err.message);
          } finally {
              setIsLoading(false);
          }
      };

      fetchAllData();
  }, []);


  // 로딩 및 에러 상태 처리
  if (isLoading) {
      return <div className="loading-page-container">데이터를 불러오는 중...</div>;
  }

  if (error) {
      return <div className="loading-page-container" style={{ color: 'red' }}>{error}</div>;
  }

  if (!userData) {
      return <div className="loading-page-container">사용자 데이터를 찾을 수 없습니다.</div>;
  }
  
  // 💡 bookImageUrl이 없을 경우를 대비해 기본 이미지를 설정합니다.
  const bookImageSrc = bookImageUrl || '/images/your-default-book-image.png';

  return (
      <div className="page-container">
          <section className="library-hero-section">
              {/* 배경 이미지: 책 샘플 이미지를 블러 처리한 버전 */}
              <img
                  src={bookImageSrc}
                  className="hero-background"
                  alt="Hero background"
              />
              <header className="hero-header">
                  <img src="/icons/TopBar/union.svg" className="icon" alt="앱 로고" />
                  <div className="header-icons">
                      <img src="/icons/TopBar/notificationl.svg" alt="알림" />
                      <img src="/icons/TopBar/search.svg" alt="검색" />
                  </div>
              </header>

              <div className="hero-content">
                  {/* 프로필 이미지와 이름을 userData 상태에서 가져와 표시합니다. */}
                  <div className="profile-circle">
                      {userData.profileImageUrl ? (
                          <img src={userData.profileImageUrl} className="profile-image" alt="프로필 이미지" />
                      ) : (
                          <div className="profile-placeholder"></div>
                      )}
                  </div>
                  <div className="welcome-text">
                      <h2>반가워요, {userData.name}님!</h2>
                      <p>오늘도 책 잘 기록해 봐요...</p>
                  </div>
                  {/* 책 샘플 이미지 */}
                  <img
                      src={bookImageSrc}
                      className="hero-book-sample"
                      alt="책 샘플 이미지"
                  />
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