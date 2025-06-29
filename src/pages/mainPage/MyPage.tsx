// src/pages/MyPage.tsx
import React, { useEffect, useState } from 'react';
import './MyPage.css';
import { getMemberProfile } from '../../api/memberApi';

// 💡 사용자 데이터 인터페이스를 API 응답 타입에 맞춰 변경
interface UserData {
    id: string;
    name: string;
    booksRead: number;
    readingCards: number;
    // 💡 '?' 대신 ' | undefined'로 명시하여 API 응답과 타입을 일치시킵니다.
    profileImageUrl: string | undefined;
}

const MyPage: React.FC = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await getMemberProfile();

                if (response.isSuccess && response.result) {
                    // API 응답 데이터를 컴포넌트 상태에 맞게 변환하여 저장
                    setUserData({
                        id: response.result.memberId.toString(),
                        name: response.result.name,
                        booksRead: response.result.booksRead,
                        readingCards: response.result.readingCards,
                        // API 응답에서 받은 값을 그대로 할당합니다.
                        profileImageUrl: response.result.profileImageUrl,
                    });
                } else {
                    setError(response.message);
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('사용자 데이터를 불러오는 데 실패했습니다.');
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

    // 로딩 및 에러 상태 처리
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
                    <p className="profile-name">{userData.name}</p>
                </div>
                <img src="/icons/right_line.svg" alt="더 보기" className="profile-arrow" />
            </div>

            <div className="my-page-stats-cards">
                <div className="stat-card">
                    <p className="stat-value">{userData.booksRead}</p>
                    <p className="stat-label">내가 읽은 책</p>
                </div>
                <div className="stat-card">
                    <p className="stat-value">{userData.readingCards}</p>
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