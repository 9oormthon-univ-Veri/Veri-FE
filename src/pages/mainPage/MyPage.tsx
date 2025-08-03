// src/pages/MyPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';
import { getMemberProfile, type GetMemberProfileResponse, type MemberProfile } from '../../api/memberApi';

// 아이콘 import
import searchFillIcon from '../../assets/icons/TopBar/search_fill.svg';
import rightLineIcon from '../../assets/icons/right_line.svg';
import scheduleFillIcon from '../../assets/icons/schedule_fill.svg';
import saleFillIcon from '../../assets/icons/sale_fill.svg';

// 이미지 import
import sampleUser from '../../assets/images/profileSample/sample_user.png';

interface UserData {
  email: string;
  nickname: string;
  numOfReadBook: number;
  numOfCard: number;
  profileImageUrl: string | null;
}

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response: GetMemberProfileResponse = await getMemberProfile();

        if (response.isSuccess && response.result) {
          const apiResult: MemberProfile = response.result;
          setUserData({
            email: apiResult.email,
            nickname: apiResult.nickname,
            numOfReadBook: apiResult.numOfReadBook,
            numOfCard: apiResult.numOfCard,
            profileImageUrl: apiResult.image && 
                            apiResult.image.trim() !== '' && 
                            apiResult.image !== 'https://example.com/image.jpg'
              ? apiResult.image
              : null,
          });
        } else {
          setError(response.message || '사용자 데이터를 불러오는 데 실패했습니다.');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('사용자 데이터를 불러오는 중 네트워크 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileClick = () => {
    console.log('프로필 상세 페이지로 이동');
  };

  const handleNoticeClick = () => {
    console.log('공지사항 페이지로 이동');
  };

  const handleEventClick = () => {
    console.log('이벤트 페이지로 이동');
  };

  const handleSearchClick = () => navigate('/book-search');

  // 로딩 상태 처리
  if (isLoading) {
    return <div className="loading-page-container">사용자 데이터를 불러오는 중...</div>;
  }

  // 에러 상태 처리
  if (error) {
    return <div className="loading-page-container" style={{ color: 'red' }}>{error}</div>;
  }

  // 데이터 없음 상태 처리
  if (!userData) {
    return <div className="loading-page-container">사용자 데이터를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="page-container">
      <header className="hero-header">
        <button 
          type="button" 
          className="color-main-icon" 
          onClick={() => navigate('/library')}
          aria-label="홈으로 이동"
        />
        <div className="header-icons">
          <div className="color-notificationl-icon" />
          <button 
            type="button" 
            className="search-button" 
            aria-label="검색" 
            onClick={handleSearchClick}
          >
            <img src={searchFillIcon} alt="" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="header-margin" />

      <div className="my-page-profile-section" onClick={handleProfileClick}>
        <div className="profile-avatar">
          {userData.profileImageUrl ? (
            <img src={userData.profileImageUrl} className="avatar-image" alt="프로필" />
          ) : (
            <div
              className="avatar-placeholder"
              style={{ backgroundImage: `url(${sampleUser})` }}
            />
          )}
        </div>
        <div className="profile-info">
          <p className="profile-name">{userData.nickname}</p>
        </div>
        <img src={rightLineIcon} alt="더 보기" className="profile-arrow" />
      </div>

      <div className="my-page-stats-cards">
        <div className="stat-card">
          <p className="stat-value">{userData.numOfReadBook}</p>
          <p className="stat-label">내가 읽은 책</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{userData.numOfCard}</p>
          <p className="stat-label">나의 독서카드</p>
        </div>
      </div>

      <div className="my-page-news-section">
        <h3 className="section-title">소식</h3>
        <div className="news-item" onClick={handleNoticeClick}>
          <img src={scheduleFillIcon} className="news-icon" alt="공지사항 아이콘" />
          <span className="news-label">공지사항</span>
          <img src={rightLineIcon} className="news-arrow" alt="이동" />
        </div>
        <div className="news-item" onClick={handleEventClick}>
          <img src={saleFillIcon} className="news-icon" alt="이벤트 아이콘" />
          <span className="news-label">이벤트</span>
          <img src={rightLineIcon} className="news-arrow" alt="이동" />
        </div>
      </div>
    </div>
  );
};

export default MyPage;