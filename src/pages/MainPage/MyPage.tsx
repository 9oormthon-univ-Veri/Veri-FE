// src/pages/MyPage.tsx
import React, { useEffect, useState } from 'react';
import './MyPage.css';

// 사용자 데이터 인터페이스 정의 (users.json 구조에 맞춤)
interface UserData {
    id: string;
    name: string;
    booksRead: number;
    readingCards: number;
    profileImageUrl?: string; // 프로필 이미지는 선택 사항일 수 있음
}

const MyPage: React.FC = () => {
    const [userData, setUserData] = useState<UserData | null>(null); // 사용자 데이터 상태
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState<string | null>(null); // 에러 상태

    useEffect(() => {
        fetch('/datas/users.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('사용자 데이터를 불러오는 데 실패했습니다.');
                }
                return response.json();
            })
            .then((data: UserData[]) => {
                if (data && data.length > 0) {
                    setUserData(data[0] as UserData); // data[0]를 UserData 타입으로 단언
                } else {
                    // 데이터가 없거나 비어있는 경우
                    setError('사용자 데이터를 찾을 수 없습니다. JSON 파일이 비어있거나 올바르지 않습니다.');
                    setUserData(null); // 에러 발생 시 userData를 null로 설정
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Error fetching user data:', err);
                setError('사용자 데이터를 불러올 수 없습니다.');
                setUserData(null); // 에러 발생 시 userData를 null로 설정
                setIsLoading(false);
            });
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
        // isLoading도 아니고 error도 아닌데 userData가 null인 경우 (예: 데이터는 성공적으로 불러왔지만 비어있을 때)
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

            <div className="header-margin">
            </div>

            <div className="my-page-profile-section" onClick={handleProfileClick}>
                <div className="profile-avatar">
                    {userData.profileImageUrl ? (
                        <img src={userData.profileImageUrl} className="avatar-image" />
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