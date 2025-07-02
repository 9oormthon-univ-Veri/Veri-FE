// src/pages/LibraryPage.tsx

import { useState, useEffect } from 'react';
import './LibraryPage.css';
import MyReadingCardSection from '../../components/LibraryPage/MyReadingCard';
import MyBookshelfSection from '../../components/LibraryPage/MyBookshelf';
import TodaysRecommendationSection from '../../components/LibraryPage/TodaysRecommendation';

// ✨ memberApi에서 getMemberProfile을 임포트합니다.
import { getMemberProfile } from '../../api/memberApi';
import { getPopularBooks, type GetPopularBooksQueryParams, type PopularBookItem } from '../../api/bookApi';

// ✨ UserData 인터페이스를 API 응답 스펙 (memberApi.ts의 MemberProfile)에 맞춰 재정의합니다.
interface UserData {
  email: string;
  nickname: string;
  image: string;
  numOfReadBook: number;
  numOfCard: number;        
}

function LibraryPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [bookImageUrl, setBookImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true); // 데이터 로딩 시작
      setError(null);     // 에러 초기화

      try {
        // 1. 사용자 프로필 API 호출
        const userResponse = await getMemberProfile();
        
        // ✨ userResponse.result가 존재하고 isSuccess가 true인 경우에만 userData를 설정합니다.
        if (userResponse.isSuccess && userResponse.result) {
          setUserData({
            email: userResponse.result.email,
            nickname: userResponse.result.nickname,         // 'name' 대신 'nickname' 사용
            image: userResponse.result.image,               // 'profileImageUrl' 대신 'image' 사용
            numOfReadBook: userResponse.result.numOfReadBook, // 'booksRead' 대신 'numOfReadBook' 사용
            numOfCard: userResponse.result.numOfCard,       // 'readingCards' 대신 'numOfCard' 사용
          });
        } else {
          // API 실패 메시지를 사용자에게 표시
          setError(userResponse.message || "사용자 프로필을 가져오는데 실패했습니다.");
        }

        // 2. 인기 책을 가져오는 API 호출
        const popularBooksParams: GetPopularBooksQueryParams = {
          page: 1,
          size: 1,
        };
        const popularResponse = await getPopularBooks(popularBooksParams);

        if (popularResponse.isSuccess && popularResponse.result && popularResponse.result.books.length > 0) {
          const firstPopularBook: PopularBookItem | undefined = popularResponse.result.books[0]; 
          
          if (firstPopularBook) {
            setBookImageUrl(firstPopularBook.image); 
          } else {
            console.warn('첫 번째 인기 도서가 존재하지 않습니다. 기본 이미지를 사용합니다.');
          }
        } else {
          console.warn('인기 도서를 가져오지 못했거나 결과가 없습니다. 기본 이미지를 사용합니다.');
        }

      } catch (err: any) {
        console.error('데이터를 불러오는 중 오류 발생:', err);
        setError('데이터를 불러오는 데 실패했습니다: ' + err.message);
      } finally {
        setIsLoading(false); // 데이터 로딩 완료
      }
    };

    fetchAllData();
  }, []); // 의존성 배열은 빈 채로 유지하여 컴포넌트 마운트 시 한 번만 실행

  // 로딩, 에러, 데이터 없음 상태 처리
  if (isLoading) {
    return <div className="loading-page-container">데이터를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="loading-page-container" style={{ color: 'red' }}>{error}</div>;
  }

  if (!userData) {
    // isLoading이 false이고 userData가 여전히 null이면 데이터 로딩 실패로 간주
    return <div className="loading-page-container">사용자 데이터를 찾을 수 없습니다.</div>;
  }
  
  const bookImageSrc = bookImageUrl || '/images/your-default-book-image.png';

  return (
    <div className="page-container">
      <section className="library-hero-section">
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
          <div className="profile-circle">
            {/* ✨ profileImageUrl 대신 image 필드 사용 */}
            {userData.image ? (
              <img src={userData.image} className="profile-image" alt="프로필 이미지" />
            ) : (
              // 이미지가 없을 때 기본 프로필 이미지 또는 플레이스홀더를 표시
              <div className="profile-placeholder" style={{ backgroundImage: 'url(/icons/default-profile.png)' }}></div>
            )}
          </div>
          <div className="welcome-text">
            {/* ✨ name 대신 nickname 필드 사용 */}
            <h2>반가워요, {userData.nickname}님!</h2>
            <p>오늘도 책 잘 기록해 봐요...</p>
          </div>
          <img
            src={bookImageSrc}
            className="hero-book-sample"
            alt="책 샘플 이미지"
          />
        </div>
      </section>

      {/* 다른 컴포넌트 섹션들 */}
      <MyReadingCardSection />
      <MyBookshelfSection />
      <TodaysRecommendationSection />
    </div>
  );
}

export default LibraryPage;