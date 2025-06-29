// src/pages/ReadingCardPage.tsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReadingCardPage.css'; // CSS 파일 임포트 유지
import ReadingCardItem from '../../components/ReadingCardPage/ReadingCardItem';
import ReadingCardGridItem from '../../components/ReadingCardPage/ReadingCardGridItem'; // 경로 확인
import { getMyCards, type Card } from '../../api/cardApi';

// ReadingCardItemType 정의를 API 응답과 사용법에 맞게 업데이트
export interface ReadingCardItemType {
    id: string; // cardId
    title: string; // card.book.title
    contentPreview: string; // card.content (trimmed)
    date: string; // card.createdAt (raw string for sorting, then formatted for display)
    thumbnailUrl: string; // card.imageUrl (card's own image)
}

function ReadingCardPage() {
    const navigate = useNavigate();
    const [readingCards, setReadingCards] = useState<ReadingCardItemType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

    const [activeTab, setActiveTab] = useState<'image' | 'text'>('image'); // 초기값은 '이미지' 탭

    useEffect(() => {
        const fetchCards = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await getMyCards(); // API 호출

                if (response.isSuccess) {
                    const mappedCards: ReadingCardItemType[] = response.result.cards.map((card: Card) => ({
                        id: String(card.cardId),
                        title: card.book.title,
                        contentPreview: card.content.length > 100 ? card.content.substring(0, 100) + '...' : card.content, // 미리보기 길이 제한
                        date: card.createdAt, // API의 createdAt을 date로 사용
                        thumbnailUrl: card.imageUrl, // 카드의 이미지 URL
                    }));
                    setReadingCards(mappedCards);
                } else {
                    setError(response.message || "독서 카드를 가져오는데 실패했습니다.");
                }
            } catch (err: any) {
                console.error('독서 카드 데이터를 불러오는 중 오류 발생:', err);
                setError(`독서 카드를 불러오는 데 실패했습니다: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCards();
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

    const handleTabClick = useCallback((tab: 'image' | 'text') => {
        setActiveTab(tab);
    }, []);

    const handleCreateCardClick = () => {
        navigate('/make-card');
    };

    if (isLoading) {
        return <div className="loading-page-container">독서 카드를 불러오는 중...</div>;
    }

    if (error) {
        return <div className="loading-page-container" style={{ color: 'red' }}>{error}</div>;
    }

    return (
        <div className="page-container">
            <div className="reading-card-hero-section">
                <header className="hero-header">
                    <div className="color-main-icon" />
                    <div className="header-icons">
                        <div className="color-notificationl-icon"></div>
                        <div className="color-search-icon"></div>
                    </div>
                </header>
                <div className="header-margin">
                </div>
                <nav className="tab-navigation">
                    <button
                        className={`tab-button ${activeTab === 'image' ? 'active' : ''}`}
                        onClick={() => handleTabClick('image')}
                    >
                        이미지
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'text' ? 'active' : ''}`}
                        onClick={() => handleTabClick('text')}
                    >
                        텍스트
                    </button>
                </nav>

                <div className="sort-options">
                    <span className="sort-button" onClick={handleSortClick}>
                        {sortOrder === 'latest' ? '최신순' : '오래된순'} &gt;
                    </span>
                </div>

                {activeTab === 'image' && (
                    <div className="reading-card-grid-view">
                        {sortedReadingCards.length > 0 ? (
                            sortedReadingCards.map((card) => (
                                <ReadingCardGridItem
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
                    <div className="reading-card-text-view">
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

                <button className="create-card-button" onClick={handleCreateCardClick}>+ 카드 만들기</button>
            </div>
        </div>
    );
}

export default ReadingCardPage;