import { useState, useEffect } from 'react';
import './LibraryPage.css';
import MyReadingCardSection from '../../components/LibraryPage/MyReadingCard';
import MyBookshelfSection from '../../components/LibraryPage/MyBookshelf';
import TodaysRecommendationSection from '../../components/LibraryPage/TodaysRecommendation';

import { useNavigate } from 'react-router-dom';
import { getMemberProfile } from '../../api/memberApi';
import { getPopularBooks, type GetPopularBooksQueryParams, type PopularBookItem } from '../../api/bookApi';
import { useTabDataStore } from '../../store/tabDataStore';
import { getMyCards } from '../../api/cardApi';
import { getAllBooks } from '../../api/bookApi';

function LibraryPage() {
  const navigate = useNavigate();
  const { libraryData, setLibraryData } = useTabDataStore();
  const [isLoading, setIsLoading] = useState(libraryData ? false : true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (libraryData) {
      setIsLoading(false);
      return;
    }
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. 사용자 프로필
        const userResponse = await getMemberProfile();
        let userData = null;
        if (userResponse.isSuccess && userResponse.result) {
          userData = {
            email: userResponse.result.email,
            nickname: userResponse.result.nickname,
            image: userResponse.result.image,
            numOfReadBook: userResponse.result.numOfReadBook,
            numOfCard: userResponse.result.numOfCard,
          };
        } else {
          setError(userResponse.message || "사용자 프로필을 가져오는데 실패했습니다.");
        }
        // 2. 인기 책
        const popularBooksParams: GetPopularBooksQueryParams = {
          page: 1,
          size: 5,
        };
        const popularResponse = await getPopularBooks(popularBooksParams);
        let bookImageUrl = null;
        let popularBooks = null;
        if (popularResponse.isSuccess && popularResponse.result && popularResponse.result.books.length > 0) {
          const firstPopularBook: PopularBookItem | undefined = popularResponse.result.books[0];
          if (firstPopularBook) {
            bookImageUrl = firstPopularBook.image;
          }
          popularBooks = popularResponse.result.books;
        }
        // 3. 내 카드
        const myCardsResponse = await getMyCards({ page: 1, size: 5, sort: 'newest' });
        let myCards = null;
        if (myCardsResponse.isSuccess && myCardsResponse.result && Array.isArray(myCardsResponse.result.cards)) {
          myCards = myCardsResponse.result.cards;
        }
        // 4. 내 책
        const myBooksResponse = await getAllBooks({ page: 1, size: 5 });
        let myBooks = null;
        if (myBooksResponse.isSuccess && myBooksResponse.result && Array.isArray(myBooksResponse.result.memberBooks)) {
          myBooks = myBooksResponse.result.memberBooks;
        }
        setLibraryData({ userData, bookImageUrl, myCards, myBooks, popularBooks });
      } catch (err: any) {
        setError('데이터를 불러오는 데 실패했습니다: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [libraryData, setLibraryData]);

  const handleProfileClick = () => {
    navigate('/my-page');
  };

  const handleSearchClick = () => {
    navigate('/book-search');
  };

  if (isLoading) {
    return <div className="loading-page-container">데이터를 불러오는 중...</div>;
  }
  if (error) {
    return <div className="loading-page-container" style={{ color: 'red' }}>{error}</div>;
  }
  if (!libraryData || !libraryData.userData) {
    return <div className="loading-page-container">사용자 데이터를 찾을 수 없습니다.</div>;
  }
  const userData = libraryData.userData;
  const heroBackgroundImageSrc = libraryData.bookImageUrl || '/images/sample_book_background.png';
  const heroBookSampleImageSrc = libraryData.bookImageUrl || '/images/sample_book.png';

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

      <MyReadingCardSection cards={libraryData?.myCards || []} />
      <MyBookshelfSection books={libraryData?.myBooks || []} />
      <TodaysRecommendationSection books={libraryData?.popularBooks || []} />
    </div>
  );
}

export default LibraryPage;