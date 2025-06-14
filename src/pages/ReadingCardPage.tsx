// src/pages/ReadingCardPage.tsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import './ReadingCardPage.css';
import ReadingCardItem, { type ReadingCardItemType } from '../components/ReadingCardPage/ReadingCardItem';

// ReadingCardPage는 이제 activeTab을 prop으로 받지 않습니다.
// interface ReadingCardPageProps {
//     activeTab: 'image' | 'text';
// }

function ReadingCardPage(/* { activeTab }: ReadingCardPageProps */) { // prop 제거
    const [readingCards, setReadingCards] = useState<ReadingCardItemType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

    // ★★★ activeTab 상태를 ReadingCardPage 내부에 정의 ★★★
    const [activeTab, setActiveTab] = useState<'image' | 'text'>('image'); // 초기값은 '이미지' 탭

    useEffect(() => {
        fetch('/datas/readingCards.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data: ReadingCardItemType[]) => {
                setReadingCards(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('독서 카드 데이터를 불러오는 중 오류 발생:', err);
                setError('독서 카드 데이터를 불러오는 데 실패했습니다.');
                setIsLoading(false);
            });
    }, []);

    const sortedReadingCards = useMemo(() => {
        const sorted = [...readingCards].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            if (sortOrder === 'latest') {
                return dateB.getTime() - dateA.getTime();
            } else { // 'oldest'
                return dateA.getTime() - dateB.getTime();
            }
        });
        return sorted;
    }, [readingCards, sortOrder]);

    const handleSortClick = useCallback(() => {
        setSortOrder(prevOrder => (prevOrder === 'latest' ? 'oldest' : 'latest'));
    }, []);

    // ★★★ 탭 변경 핸들러를 ReadingCardPage 내부에 정의 ★★★
    const handleTabClick = useCallback((tab: 'image' | 'text') => {
        setActiveTab(tab);
    }, []);

    if (isLoading) {
        return <div className="reading-card-page-container loading-state">독서 카드를 불러오는 중...</div>;
    }

    if (error) {
        return <div className="reading-card-page-container error-state" style={{ color: 'red' }}>{error}</div>;
    }

    return (
        <div className="reading-card-page-container">
            <header className="hero-header">
                <img src="/icons/union.png" className="icon"/>
                <div className="header-icons">
                    <img src="/icons/bell-icon.svg" className="icon"/>
                    <img src="/icons/search-icon.svg" className="icon"/>
                </div>
            </header>

            {/* 탭 내비게이션 (이 컴포넌트 내부에서 직접 렌더링하고 상태 제어) */}
            <nav className="tab-navigation">
                <button
                    className={`tab-button ${activeTab === 'image' ? 'active' : ''}`}
                    onClick={() => handleTabClick('image')} // ★★★ 내부 핸들러 호출 ★★★
                >
                    이미지
                </button>
                <button
                    className={`tab-button ${activeTab === 'text' ? 'active' : ''}`}
                    onClick={() => handleTabClick('text')} // ★★★ 내부 핸들러 호출 ★★★
                >
                    텍스트
                </button>
            </nav>

            <div className="sort-options">
                <span className="sort-button" onClick={handleSortClick}>
                    {sortOrder === 'latest' ? '최신순' : '오래된순'} &gt;
                </span>
            </div>

            {/* activeTab에 따라 다른 뷰 컨테이너 렌더링 */}
            {activeTab === 'image' && (
                <div className="reading-card-grid-view"> {/* 이미지 갤러리 뷰 */}
                    {sortedReadingCards.length > 0 ? (
                        sortedReadingCards.map((card) => (
                            <ReadingCardItem
                                key={card.id}
                                id={card.id}
                                title={card.title}
                                contentPreview={card.contentPreview}
                                date={card.date}
                                thumbnailUrl={card.thumbnailUrl}
                            />
                        ))
                    ) : (
                        <p className="no-cards-message">등록된 독서 카드가 없습니다.</p>
                    )}
                </div>
            )}

            {activeTab === 'text' && (
                <div className="reading-card-list"> {/* 텍스트 리스트 뷰 */}
                    {sortedReadingCards.length > 0 ? (
                        sortedReadingCards.map((card) => (
                            <ReadingCardItem
                                key={card.id}
                                id={card.id}
                                title={card.title}
                                contentPreview={card.contentPreview}
                                date={card.date}
                                thumbnailUrl={card.thumbnailUrl}
                            />
                        ))
                    ) : (
                        <p className="no-cards-message">등록된 독서 카드가 없습니다.</p>
                    )}
                </div>
            )}

            {/* "카드 만들기" 버튼 */}
            <button className="create-card-button">+ 카드 만들기</button>

            {/* 하단 내비게이션 바는 이 컴포넌트 외부에 있다고 가정 */}
        </div>
    );
}

export default ReadingCardPage;