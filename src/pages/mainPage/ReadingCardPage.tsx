// src/pages/mainPage/ReadingCardPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReadingCardPage.css';
import ReadingCardItem from '../../components/ReadingCardPage/ReadingCardItem';
import ReadingCardGridItem from '../../components/ReadingCardPage/ReadingCardGridItem';
import { getMyCards, getCardDetailById, type MyCardItem, type GetMyCardsQueryParams } from '../../api/cardApi';
import TopBar from '../../components/TopBar';
import { SkeletonList, SkeletonReadingCard, SkeletonReadingCardGrid } from '../../components/SkeletonUI';

// 독서 카드 아이템 타입 정의
export interface ReadingCardItemType {
    id: string;
    title: string | undefined;
    contentPreview: string;
    date: string;
    thumbnailUrl: string;
}

function ReadingCardPage() {
    const navigate = useNavigate();
    const [readingCards, setReadingCards] = useState<ReadingCardItemType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');

    // 독서 카드 데이터 가져오기 (최적화된 버전)
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

            if (response.isSuccess && response.result?.cards) {
                // 기본 카드 정보로 먼저 state 업데이트 (빠른 렌더링)
                const basicCards = response.result.cards.map((card: MyCardItem) => ({
                    id: card.cardId ? String(card.cardId) : `temp-${Date.now()}-${Math.random()}`,
                    title: card.content.length > 30 ? `${card.content.substring(0, 30)}...` : card.content || "제목 없음",
                    contentPreview: card.content.length > 100 ? `${card.content.substring(0, 100)}...` : card.content,
                    date: card.created,
                    thumbnailUrl: card.image,
                }));
                
                setReadingCards(basicCards);
                setIsLoading(false); // 기본 데이터 로딩 완료

                // 백그라운드에서 상세 정보 가져오기 (배치 처리)
                const cardDetailPromises = response.result.cards
                    .filter(card => card.cardId)
                    .map(async (card: MyCardItem, index: number) => {
                        try {
                            const detailResponse = await getCardDetailById(card.cardId!);
                            if (detailResponse.isSuccess && detailResponse.result?.book?.title) {
                                return {
                                    index,
                                    cardId: card.cardId!,
                                    bookTitle: detailResponse.result.book.title
                                };
                            }
                        } catch (detailErr) {
                            console.error(`카드 상세 정보 가져오기 실패 (ID: ${card.cardId}):`, detailErr);
                        }
                        return null;
                    });

                // 상세 정보를 배치로 처리
                const detailResults = await Promise.allSettled(cardDetailPromises);
                
                // 성공한 상세 정보들로 카드 업데이트
                setReadingCards(prevCards => {
                    const updatedCards = [...prevCards];
                    detailResults.forEach((result, idx) => {
                        if (result.status === 'fulfilled' && result.value) {
                            const detail = result.value;
                            const cardIndex = response.result.cards.findIndex(card => card.cardId === detail.cardId);
                            if (cardIndex !== -1 && updatedCards[cardIndex]) {
                                updatedCards[cardIndex] = {
                                    ...updatedCards[cardIndex],
                                    title: detail.bookTitle
                                };
                            }
                        }
                    });
                    return updatedCards;
                });
            } else {
                setReadingCards([]);
                if (!response.result?.cards || response.result.cards.length === 0) {
                    // 빈 배열은 오류가 아님
                } else {
                    setError("독서 카드를 불러왔으나, 표시할 내용이 없습니다.");
                }
            }
        } catch (err: any) {
            console.error('독서 카드 데이터 로딩 오류:', err);
            setError(`독서 카드를 불러오는 데 실패했습니다: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [sortOrder]);

    useEffect(() => {
        fetchCards();
    }, [fetchCards]);

    // 이벤트 핸들러들
    const handleSortClick = useCallback(() => {
        setSortOrder(prevOrder => prevOrder === 'newest' ? 'oldest' : 'newest');
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

    const handleProfileClick = () => {
        navigate('/my-page');
    };

    // 에러 상태 처리
    if (error) {
        return <div className="loading-page-container" style={{ color: 'red' }}>{error}</div>;
    }

    return (
        <div className="page-container">
            <div className="reading-card-hero-section">
                <TopBar 
                    onSearchClick={handleSearchClick}
                    onProfileClick={handleProfileClick}
                />
                
                <div className="header-margin" />
                
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
                    <span 
                        className="sort-button" 
                        onClick={handleSortClick}
                    >
                        {sortOrder === 'newest' ? '최신순' : '오래된순'}
                        <span className={sortOrder === 'newest' ? 'mgc_down_fill' : 'mgc_up_fill'}></span>
                    </span>
                </div>

                {/* 이미지 뷰 */}
                {activeTab === 'image' && (
                    <div className="reading-card-grid-view">
                        {isLoading ? (
                            <SkeletonList count={8}>
                                <SkeletonReadingCardGrid />
                            </SkeletonList>
                        ) : readingCards.length > 0 ? (
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

                {/* 텍스트 뷰 */}
                {activeTab === 'text' && (
                    <div className="reading-card-text-view">
                        {isLoading ? (
                            <SkeletonList count={5}>
                                <SkeletonReadingCard />
                            </SkeletonList>
                        ) : readingCards.length > 0 ? (
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

            <div className='main-page-margin'>
            </div>
            
            <div className="create-button-container">
                <button className="create-button" onClick={handleCreateCardClick}>
                    + 등록하기
                </button>
            </div>
        </div>
    );
}

export default ReadingCardPage;
