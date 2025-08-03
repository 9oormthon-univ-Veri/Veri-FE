import { useState, useEffect } from 'react';
import './LibraryPage.css';
import MyReadingCardSection from '../../components/LibraryPage/MyReadingCard';
import MyBookshelfSection from '../../components/LibraryPage/MyBookshelf';
import TodaysRecommendationSection from '../../components/LibraryPage/TodaysRecommendation';
import { useNavigate } from 'react-router-dom';
import { getMemberProfile } from '../../api/memberApi';
import { getAllBooks, type GetAllBooksQueryParams } from '../../api/bookApi';

// 이미지 경로
const IMAGES = {
  APP_LOGO: '/src/assets/icons/TopBar/union.svg',
  NOTIFICATION: '/src/assets/icons/TopBar/notificationl.svg',
  SEARCH: '/src/assets/icons/TopBar/search.svg',
  SAMPLE_BOOK_BACKGROUND: '/src/assets/images/profileSample/sample_book_background.png',
  SAMPLE_BOOK: '/src/assets/images/profileSample/sample_book.png',
  SAMPLE_USER: '/src/assets/images/profileSample/sample_user.png'
} as const;

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
    return <div className="loading-page-container">데이터를 불러오는 중...</div>;
  }

  // 에러 상태 처리
  if (error) {
    return <div className="loading-page-container" style={{ color: 'red' }}>{error}</div>;
  }

  // 데이터 없음 상태 처리
  if (!userData) {
    return <div className="loading-page-container">사용자 데이터를 찾을 수 없습니다.</div>;
  }

  // 이미지 경로 설정
  const heroBackgroundImageSrc = bookImageUrl || IMAGES.SAMPLE_BOOK_BACKGROUND;
  const heroBookSampleImageSrc = bookImageUrl || IMAGES.SAMPLE_BOOK;
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
          <img src={IMAGES.APP_LOGO} className="icon" alt="앱 로고" />
          <div className="header-icons">
            <img src={IMAGES.NOTIFICATION} alt="알림" />
            <button 
              type="button" 
              className="search-button" 
              aria-label="검색" 
              onClick={handleSearchClick}
            >
              <img src={IMAGES.SEARCH} alt="" aria-hidden="true" />
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
                style={{ backgroundImage: `url(${IMAGES.SAMPLE_USER})` }}
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
      <MyBookshelfSection />
      <TodaysRecommendationSection />
    </div>
  );
}

export default LibraryPage;