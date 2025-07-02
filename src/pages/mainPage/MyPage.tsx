// src/pages/MyPage.tsx
import React, { useEffect, useState } from 'react';
import './MyPage.css';
import { getMemberProfile, type GetMemberProfileResponse, type MemberProfile } from '../../api/memberApi';

// ✨ UserData 인터페이스를 API 응답 스펙 (MemberProfile)과 일치시킵니다.
//    'id' 필드는 API 응답에 직접 없으므로, 필요하다면 다른 방식으로 처리하거나 제거합니다.
interface UserData {
    email: string;
    nickname: string; // name 대신 nickname
    numOfReadBook: number; // booksRead 대신 numOfReadBook
    numOfCard: number; // readingCards 대신 numOfCard
    profileImageUrl: string | null; // image 대신 profileImageUrl (컴포넌트에서 사용하는 이름)
}

const MyPage: React.FC = () => {
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
                    // ✨ API 응답의 result 객체를 직접 사용하되, 컴포넌트 UserData에 맞춰 매핑합니다.
                    const apiResult: MemberProfile = response.result;
                    setUserData({
                        // API에 memberId가 직접 없으므로, 필요하다면 이메일 등을 ID로 대체하거나,
                        // 백엔드에 memberId를 응답에 포함시켜달라고 요청해야 합니다.
                        // 현재는 UserData에서 id 필드를 제거하거나 다른 방식으로 사용해야 합니다.
                        // 편의상 이메일을 id로 사용하거나, id 필드를 UserData에서 제거하는 것을 고려하세요.
                        // 예: id: apiResult.email,
                        email: apiResult.email,
                        nickname: apiResult.nickname, // name -> nickname
                        numOfReadBook: apiResult.numOfReadBook, // booksRead -> numOfReadBook
                        numOfCard: apiResult.numOfCard, // readingCards -> numOfCard
                        profileImageUrl: apiResult.image || null, // image -> profileImageUrl (컴포넌트에서 사용하는 이름)
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

    if (isLoading) {
        return <div className="loading-page-container">사용자 데이터를 불러오는 중...</div>;
    }

    if (error) {
        return <div className="loading-page-container" style={{ color: 'red' }}>{error}</div>;
    }

    if (!userData) {
        return <div className="loading-page-container">사용자 데이터를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="page-container">
            <header className="hero-header">
                <div className="color-main-icon" />
                <div className="header-icons">
                    <div className="color-notificationl-icon"></div>
                    <div className="color-search-icon"></div>
                </div>
            </header>

            <div className="header-margin"></div>

            <div className="my-page-profile-section" onClick={handleProfileClick}>
                <div className="profile-avatar">
                    {userData.profileImageUrl ? (
                        <img src={userData.profileImageUrl} className="avatar-image" alt="프로필 이미지" />
                    ) : (
                        <div className="avatar-placeholder"></div>
                    )}
                </div>
                <div className="profile-info">
                    <p className="profile-name">{userData.nickname}</p> {/* name -> nickname */}
                </div>
                <img src="/icons/right_line.svg" alt="더 보기" className="profile-arrow" />
            </div>

            <div className="my-page-stats-cards">
                <div className="stat-card">
                    <p className="stat-value">{userData.numOfReadBook}</p> {/* booksRead -> numOfReadBook */}
                    <p className="stat-label">내가 읽은 책</p>
                </div>
                <div className="stat-card">
                    <p className="stat-value">{userData.numOfCard}</p> {/* readingCards -> numOfCard */}
                    <p className="stat-label">나의 독서카드</p>
                </div>
            </div>

            <div className="my-page-news-section">
                <h3 className="section-title">소식</h3>
                <div className="news-item" onClick={handleNoticeClick}>
                    <img src="/icons/schedule_fill.svg" className="news-icon" alt="공지사항 아이콘" />
                    <span className="news-label">공지사항</span>
                    <img src="/icons/right_line.svg" className="news-arrow" alt="이동" />
                </div>
                <div className="news-item" onClick={handleEventClick}>
                    <img src="/icons/sale_fill.svg" className="news-icon" alt="이벤트 아이콘" />
                    <span className="news-label">이벤트</span>
                    <img src="/icons/right_line.svg" className="news-arrow" alt="이동" />
                </div>
            </div>
        </div>
    );
};

export default MyPage;