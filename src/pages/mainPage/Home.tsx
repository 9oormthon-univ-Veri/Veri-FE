import { useState, useEffect } from 'react';
import './Home.css';
import MyReadingCardSection from '../../components/HomePage/MyReadingCard';
import TodaysRecommendationSection from '../../components/HomePage/TodaysRecommendation';
import { useNavigate } from 'react-router-dom';
import { getMemberProfile } from '../../api/memberApi';
import { getAllBooks, type GetAllBooksQueryParams } from '../../api/bookApi';

// 아이콘 import
import appLogoIcon from '../../assets/icons/TopBar/union.svg';
import notificationIcon from '../../assets/icons/TopBar/notificationl.svg';
import searchIcon from '../../assets/icons/TopBar/search.svg';

// 이미지 import
import sampleBookBackground from '../../assets/images/profileSample/sample_book_background.png';
import sampleBook from '../../assets/images/profileSample/sample_book.png';
import sampleUser from '../../assets/images/profileSample/sample_user.png';
import profileIcon from '../../assets/icons/TopBar/profile.svg';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 사용자 프로필 조회
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

        // 가장 최근에 읽은 책 조회
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
        console.error('데이터를 불러오는 중 오류 발생:', err);
        setError('데이터를 불러오는 데 실패했습니다: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleProfileClick = () => navigate('/my-page');
  const handleSearchClick = () => navigate('/book-search');

  // 로딩 상태 처리
  if (isLoading) {
    return <div className="loading-page-container">
      <div className="loading-spinner"></div>
    </div>;
  }

  // 에러 상태 처리
  if (error) {
    return <div className="loading-page-container"><p style={{ color: 'red' }}>{error}</p></div>;
  }

  // 데이터 없음 상태 처리
  if (!userData) {
    return <div className="loading-page-container"><p>사용자 데이터를 찾을 수 없습니다.</p></div>;
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
            <img src={appLogoIcon} alt="앱 로고" />
          </button>
          <div className="header-icons">
            <button
              type="button"
              className="search-button"
              aria-label="검색"
              onClick={handleSearchClick}
            >
              <img src={searchIcon} alt="" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="notification-button"
              aria-label="알림"
            >
              <img src={notificationIcon} alt="알림" />
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