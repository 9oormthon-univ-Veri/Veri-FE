import { useState, useEffect } from 'react';
import './LibraryPage.css';
import MyReadingCardSection from '../../components/LibraryPage/MyReadingCard';
import MyBookshelfSection from '../../components/LibraryPage/MyBookshelf';
import TodaysRecommendationSection from '../../components/LibraryPage/TodaysRecommendation';

import { useNavigate } from 'react-router-dom';
import { getMemberProfile } from '../../api/memberApi';
// getAllBooks와 Book 인터페이스를 사용합니다. getPopularBooks는 더 이상 필요 없습니다.
import { getAllBooks, type Book, type GetAllBooksQueryParams } from '../../api/bookApi';

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
      setIsLoading(true); // 데이터 로딩 시작
      setError(null);    // 에러 초기화

      try {
        // 1. 사용자 프로필 API 호출
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

        // 2. 가장 최근에 읽은 책을 가져오는 API 호출 (getAllBooks 사용)
        // page: 1, size: 1, sort: 'newest'를 통해 가장 최근에 시작한 책 1개를 요청합니다.
        const recentBooksParams: GetAllBooksQueryParams = {
          page: 1, // API 명세에 따라 페이지는 1부터 시작합니다.
          size: 1, // 가장 최근 책 1개만 가져옵니다.
          sort: 'newest', // 'newest' 정렬을 사용하여 가장 최근에 시작한 책을 가져옵니다.
        };
        const recentBooksResponse = await getAllBooks(recentBooksParams);

        if (recentBooksResponse.isSuccess && recentBooksResponse.result && recentBooksResponse.result.memberBooks.length > 0) {
          // 'newest' 정렬을 통해 가져온 첫 번째 책이 가장 최근에 시작한 책입니다.
          const mostRecentBook: Book | undefined = recentBooksResponse.result.memberBooks[0];

          if (mostRecentBook) {
            setBookImageUrl(mostRecentBook.imageUrl); // Book 인터페이스의 imageUrl 필드 사용
          } else {
            console.warn('가장 최근 읽은 도서가 존재하지 않습니다. 기본 이미지를 사용합니다.');
          }
        } else {
          console.warn('사용자가 읽은 도서를 가져오지 못했거나 결과가 없습니다. 기본 이미지를 사용합니다.');
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

  const handleProfileClick = () => {
    navigate('/my-page');
  };

  const handleSearchClick = () => {
    navigate('/book-search');
  };

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

  // hero-background와 hero-book-sample에 사용할 이미지 경로를 따로 정의합니다.
  const heroBackgroundImageSrc = bookImageUrl || '/images/sample_book_background.png'; // 배경 이미지
  const heroBookSampleImageSrc = bookImageUrl || '/images/sample_book.png';       // 중앙 책 이미지

  return (
    <div className="page-container">
      <div className="library-hero-section">
        <img
          src={heroBackgroundImageSrc}
          className="hero-background"
          alt="Hero background"
        />
        <header className="hero-header">
          <img src="/icons/TopBar/union.svg" className="icon" alt="앱 로고" />
          <div className="header-icons">
            <img src="/icons/TopBar/notificationl.svg" alt="알림" />
            <button type="button" className="search-button" aria-label="검색" onClick={handleSearchClick}>
              <img src="/icons/TopBar/search.svg" alt="" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="hero-content">
          <button className="profile-circle" onClick={handleProfileClick} aria-label="프로필 보기">
            {userData.image && userData.image.trim() !== '' && userData.image !== 'https://example.com/image.jpg' ? (
              <img src={userData.image} className="profile-image" alt="프로필 이미지" />
            ) : (
              <div className="profile-placeholder" style={{ backgroundImage: 'url(/images/sample_user.png)' }}></div>
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

      {/* 다른 컴포넌트 섹션들 */}
      <MyReadingCardSection />
      <MyBookshelfSection />
      <TodaysRecommendationSection />
    </div>
  );
}

export default LibraryPage;