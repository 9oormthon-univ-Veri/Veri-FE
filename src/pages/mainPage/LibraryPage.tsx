// src/pages/LibraryPage.tsx

import { useState, useEffect } from 'react';
import './LibraryPage.css';
import MyReadingCardSection from '../../components/LibraryPage/MyReadingCard';
import MyBookshelfSection from '../../components/LibraryPage/MyBookshelf';
import TodaysRecommendationSection from '../../components/LibraryPage/TodaysRecommendation';

interface UserData {
  id: string;
  name: string;
  booksRead: number;
  readingCards: number;
  profileImageUrl: string | undefined;
}

import { getMemberProfile } from '../../api/memberApi';
import { getPopularBooks, type GetPopularBooksQueryParams, type PopularBookItem } from '../../api/bookApi';

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

        // 2. 인기 책을 가져오는 API 호출로 대체합니다.
        const popularBooksParams: GetPopularBooksQueryParams = {
          page: 1,
          size: 1,
        };
        const popularResponse = await getPopularBooks(popularBooksParams);

        if (popularResponse.isSuccess && popularResponse.result && popularResponse.result.books.length > 0) {
          // ✨ 수정: PopularBookItem이 undefined가 아님을 확인
          const firstPopularBook: PopularBookItem | undefined = popularResponse.result.books[0]; 
          
          if (firstPopularBook) { // ✨ undefined 체크
            setBookImageUrl(firstPopularBook.image); 
          } else {
            console.warn('첫 번째 인기 도서가 존재하지 않습니다. 기본 이미지를 사용합니다.');
          }
        } else {
          console.warn('인기 도서를 가져오지 못했거나 결과가 없습니다. 기본 이미지를 사용합니다.');
        }

      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('데이터를 불러오는 데 실패했습니다: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);


  if (isLoading) {
    return <div className="loading-page-container">데이터를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="loading-page-container" style={{ color: 'red' }}>{error}</div>;
  }

  if (!userData) {
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
          <img
            src={bookImageSrc}
            className="hero-book-sample"
            alt="책 샘플 이미지"
          />
        </div>
      </section>

      <MyReadingCardSection />
      <MyBookshelfSection />
      <TodaysRecommendationSection />
    </div>
  );
}

export default LibraryPage;