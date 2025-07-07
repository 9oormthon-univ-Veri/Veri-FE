// src/pages/ReadingCardPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReadingCardPage.css';
import ReadingCardItem from '../../components/ReadingCardPage/ReadingCardItem';
import ReadingCardGridItem from '../../components/ReadingCardPage/ReadingCardGridItem';
// getMyCards, getCardDetailById, MyCardItem 타입 및 GetMyCardsQueryParams 타입을 임포트합니다.
import { getMyCards, getCardDetailById, type MyCardItem, type GetMyCardsQueryParams } from '../../api/cardApi';
import { useTabDataStore } from '../../store/tabDataStore';

// ReadingCardItemType 정의를 API 응답과 사용법에 맞게 업데이트
// title은 이제 getCardDetailById를 통해 가져올 책 제목을 반영합니다.
export interface ReadingCardItemType {
    id: string; // MyCardItem.cardId
    title: string | undefined; // FIX: title 타입을 string | undefined로 변경하여 API 응답의 유연성을 반영
    contentPreview: string; // MyCardItem.content (trimmed)
    date: string; // MyCardItem 또는 Card 상세 정보에 생성 날짜 필드가 없으므로, "날짜 정보 없음" 또는 임시 값 사용
    thumbnailUrl: string; // MyCardItem.image
}

function ReadingCardPage() {
    const navigate = useNavigate();
    const { readingCardData, setReadingCardData } = useTabDataStore();
    const [isLoading, setIsLoading] = useState(!readingCardData);
    const [error, setError] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');

    const fetchCards = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const queryParams: GetMyCardsQueryParams = {
                page: 1,
                size: 20,
                sort: sortOrder,
            };
            const response = await getMyCards(queryParams);
            if (response.isSuccess) {
                if (response.result && Array.isArray(response.result.cards)) {
                    const detailedCardsPromises = (response.result.cards as MyCardItem[]).map(async (card: MyCardItem) => {
                        if (card.cardId === undefined) {
                            return {
                                id: String(Date.now()) + Math.random(),
                                title: card.content.length > 30 ? card.content.substring(0, 30) + '...' : card.content || "제목 없음 (ID 없음)",
                                contentPreview: card.content.length > 100 ? card.content.substring(0, 100) + '...' : card.content,
                                date: card.created,
                                thumbnailUrl: card.image,
                            };
                        }
                        try {
                            const detailResponse = await getCardDetailById(card.cardId as number);
                            if (detailResponse.isSuccess && detailResponse.result) {
                                return {
                                    id: String(card.cardId),
                                    title: detailResponse.result.book?.title,
                                    contentPreview: card.content.length > 100 ? card.content.substring(0, 100) + '...' : card.content,
                                    date: card.created,
                                    thumbnailUrl: card.image,
                                };
                            } else {
                                return {
                                    id: String(card.cardId),
                                    title: card.content.length > 30 ? card.content.substring(0, 30) + '...' : card.content || "제목 없음",
                                    contentPreview: card.content.length > 100 ? card.content.substring(0, 100) + '...' : card.content,
                                    date: card.created,
                                    thumbnailUrl: card.image,
                                };
                            }
                        } catch {
                            return {
                                id: String(card.cardId),
                                title: card.content.length > 30 ? card.content.substring(0, 30) + '...' : card.content || "제목 없음",
                                contentPreview: card.content.length > 100 ? card.content.substring(0, 100) + '...' : card.content,
                                date: card.created,
                                thumbnailUrl: card.image,
                            };
                        }
                    });
                    const results = await Promise.allSettled(detailedCardsPromises);
                    const mappedCards = results
                        .filter((result): result is PromiseFulfilledResult<ReadingCardItemType> => result.status === 'fulfilled' && result.value !== undefined)
                        .map((result) => result.value);
                    setReadingCardData(mappedCards);
                } else {
                    setReadingCardData([]);
                    setError("독서 카드를 불러왔으나, 표시할 내용이 없습니다.");
                }
            } else {
                setError(response.message || "독서 카드를 가져오는데 실패했습니다.");
            }
        } catch (err: any) {
            setError(`독서 카드를 불러오는 데 실패했습니다: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [sortOrder, setReadingCardData]);

    useEffect(() => {
        if (readingCardData) {
            setIsLoading(false);
            return;
        }
        fetchCards();
    }, [fetchCards, readingCardData]);

    const handleSortClick = useCallback(() => {
        setSortOrder(prevOrder => (prevOrder === 'newest' ? 'oldest' : 'newest'));
    }, []);

    const handleTabClick = useCallback((tab: 'image' | 'text') => {
        setActiveTab(tab);
    }, []);

    const handleCreateCardClick = () => {
        navigate('/make-card');
    };

    const handleSearchClick = () => {
        navigate('/book-search');
    };

    if (isLoading) {
        return <div className="loading-page-container">독서 카드를 불러오는 중...</div>;
    }
    if (error) {
        return <div className="loading-page-container" style={{ color: 'red' }}>{error}</div>;
    }
    const readingCards = readingCardData || [];

    return (
        <div className="page-container">
            <div className="reading-card-hero-section">
                <header className="hero-header">
                    <div className="color-main-icon" />
                    <div className="header-icons">
                        <div className="color-notificationl-icon"></div>
                        <button type="button" className="search-button" aria-label="검색" onClick={handleSearchClick}>
                            <img src="/icons/TopBar/search_fill.svg" alt="" aria-hidden="true" />
                        </button>
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
                        {/* API의 sort 파라미터 값에 맞춰 텍스트를 표시합니다. */}
                        {sortOrder === 'newest' ? '최신순' : '오래된순'} &gt;
                    </span>
                </div>

                {activeTab === 'image' && (
                    <div className="reading-card-grid-view">
                        {readingCards.length > 0 ? (
                            readingCards.map((card) => (
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
                        {readingCards.length > 0 ? (
                            readingCards.map((card) => (
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
            </div>
            <div className="reading-create-button-container">
                <button className="create-button" onClick={handleCreateCardClick}>+ 카드 만들기</button>
            </div>
        </div>
    );
}

export default ReadingCardPage;

