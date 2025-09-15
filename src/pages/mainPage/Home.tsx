import { useState, useEffect } from 'react';
import './Home.css';
import MyReadingCardSection from '../../components/HomePage/MyReadingCard';
import TodaysRecommendationSection from '../../components/HomePage/TodaysRecommendation';
import { useNavigate } from 'react-router-dom';
import { getMemberProfile } from '../../api/memberApi';
import { getAllBooks, type GetAllBooksQueryParams } from '../../api/bookApi';
import { SkeletonHeroSection } from '../../components/SkeletonUI';

// 아이콘 import
import unionIcon from '../../assets/icons/TopBar/union_fill.svg';
import profileIcon from '../../assets/icons/TopBar/profile.svg';

// 이미지 import
import sampleBookBackground from '../../assets/images/profileSample/sample_book_background.png';
import sampleBook from '../../assets/images/profileSample/sample_book.png';
import sampleUser from '../../assets/images/profileSample/sample_user.png';

interface UserData {
  email: string;
  nickname: string;
  image: string;
  numOfReadBook: number;
  numOfCard: number;
}

function LibraryPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [bookImageUrl, setBookImageUrl] = useState<string | null>(null);
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userResponse = await getMemberProfile();
        if (userResponse.isSuccess && userResponse.result) {
          setUserData({
            email: userResponse.result.email,
            nickname: userResponse.result.nickname,
            image: userResponse.result.image,
            numOfReadBook: userResponse.result.numOfReadBook,
            numOfCard: userResponse.result.numOfCard,
          });
        } else {
          setError(userResponse.message || "사용자 프로필을 가져오는데 실패했습니다.");
        }
      } catch (err: any) {
        console.error('사용자 프로필 로딩 오류:', err);
        setError('사용자 프로필을 불러오는 데 실패했습니다: ' + err.message);
      } finally {
        setIsUserDataLoading(false);
      }
    };

    const fetchRecentBook = async () => {
      try {
        const recentBooksParams: GetAllBooksQueryParams = {
          page: 1,
          size: 1,
          sort: 'newest',
        };
        const recentBooksResponse = await getAllBooks(recentBooksParams);

        if (recentBooksResponse.isSuccess &&
          recentBooksResponse.result?.memberBooks.length > 0) {
          const mostRecentBook = recentBooksResponse.result.memberBooks[0];
          if (mostRecentBook) {
            setBookImageUrl(mostRecentBook.imageUrl);
          }
        }
      } catch (err: any) {
        console.error('최근 책 데이터 로딩 오류:', err);
        // 책 데이터는 실패해도 사용자에게 오류를 보여주지 않음
      }
    };

    // 병렬로 데이터 fetch
    fetchUserProfile();
    fetchRecentBook();
  }, []);

  const handleProfileClick = () => navigate('/my-page');
  const handleSearchClick = () => navigate('/book-search');

  // 에러 상태 처리
  if (error) {
    return <div className="loading-page-container"><p style={{ color: 'red' }}>{error}</p></div>;
  }

  // 사용자 데이터 로딩 중이거나 데이터 없음 상태 처리
  if (isUserDataLoading || !userData) {
    return (
      <div className="page-container">
        <SkeletonHeroSection />
        <MyReadingCardSection />
        <TodaysRecommendationSection />
        <div className='main-page-margin' />
      </div>
    );
  }

  // 이미지 경로 설정
  const heroBackgroundImageSrc = bookImageUrl || sampleBookBackground;
  const heroBookSampleImageSrc = bookImageUrl || sampleBook;
  const hasValidProfileImage = userData.image &&
    userData.image.trim() !== '' &&
    userData.image !== 'https://example.com/image.jpg';

  return (
    <div className="page-container">
      <div className="library-hero-section">
        <img
          src={heroBackgroundImageSrc}
          className="hero-background"
          alt="Hero background"
        />
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
              <span className="mgc_search_2_fill"></span>
            </button>
            <button
              type="button"
              className="notification-button"
              aria-label="알림"
            >
              <span className="mgc_notification_fill"></span>
            </button>
            <button
              type="button"
              className="my-page-button"
              aria-label="프로필 보기"
              onClick={handleProfileClick}
            >
              <img src={profileIcon} alt="프로필" />
            </button>
          </div>
        </header>

        <div className="hero-content">
          <button
            className="profile-circle"
            onClick={handleProfileClick}
            aria-label="프로필 보기"
          >
            {hasValidProfileImage ? (
              <img src={userData.image} className="profile-image" alt="프로필 이미지" />
            ) : (
              <div
                className="profile-placeholder"
                style={{ backgroundImage: `url(${sampleUser})` }}
              />
            )}
          </button>
          <div className="welcome-text">
            <h2>반가워요, {userData.nickname}님!</h2>
            <p>오늘도 책 잘 기록해 봐요...</p>
          </div>
          <img
            src={heroBookSampleImageSrc}
            className="hero-book-sample"
            alt="Hero book sample"
          />
        </div>
      </div>

      <MyReadingCardSection />
      {/* <MyBookshelfSection /> */}
      <TodaysRecommendationSection />

      <div className='main-page-margin'>
      </div>
    </div>
  );
}

export default LibraryPage;