// src/pages/ReadingCardPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReadingCardPage.css';
import ReadingCardItem from '../../components/ReadingCardPage/ReadingCardItem';
import ReadingCardGridItem from '../../components/ReadingCardPage/ReadingCardGridItem';
// getMyCards, getCardDetailById, MyCardItem 타입 및 GetMyCardsQueryParams 타입을 임포트합니다.
import { getMyCards, getCardDetailById, type MyCardItem, type GetMyCardsQueryParams } from '../../api/cardApi';

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
    const [readingCards, setReadingCards] = useState<ReadingCardItemType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // sortOrder는 이제 API의 'sort' 쿼리 파라미터 값과 일치하도록 변경합니다.
    // API 스펙에 따르면 'newest'가 기본값이므로 그렇게 설정합니다.
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest'); // API의 sort 파라미터와 일치하도록

    const [activeTab, setActiveTab] = useState<'image' | 'text'>('image'); // 초기값은 '이미지' 탭

    // API 호출 로직을 useCallback으로 감싸서 sortOrder 변경 시 재사용되도록 합니다.
    const fetchCards = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // 1. 독서 카드 목록을 가져옵니다.
            const queryParams: GetMyCardsQueryParams = {
                page: 1, // 필요에 따라 페이지네이션 구현 시 동적으로 변경
                size: 20, // 한 페이지에 가져올 카드 수 (적절히 조절)
                sort: sortOrder, // 현재 선택된 정렬 순서를 API에 전달
            };
            const response = await getMyCards(queryParams); // API 호출

            if (response.isSuccess) {
                if (response.result && Array.isArray(response.result.cards)) {
                    const detailedCardsPromises = response.result.cards.map(async (card: MyCardItem) => {
                        // FIX: card.cardId가 undefined일 경우를 처리합니다.
                        if (card.cardId === undefined) {
                            console.warn(`Card item with undefined cardId skipped:`, card);
                            // 유효하지 않은 cardId를 가진 카드는 건너뛰거나, 기본값을 반환할 수 있습니다.
                            // 여기서는 상세 정보를 가져오지 않고 기본 형태를 반환합니다.
                            return {
                                id: String(Date.now()) + Math.random(), // 고유한 임시 ID 생성
                                title: card.content.length > 30 ? card.content.substring(0, 30) + '...' : card.content || "제목 없음 (ID 없음)",
                                contentPreview: card.content.length > 100 ? card.content.substring(0, 100) + '...' : card.content,
                                date: card.created,
                                thumbnailUrl: card.image,
                            };
                        }

                        try {
                            // card.cardId가 number임을 TypeScript에 명시 (undefined 체크 후)
                            const detailResponse = await getCardDetailById(card.cardId as number);
                            if (detailResponse.isSuccess && detailResponse.result) {
                                return {
                                    id: String(card.cardId),
                                    // detailResponse.result.book이 null일 수 있으므로 안전하게 접근
                                    title: detailResponse.result.book?.title, // 이제 ReadingCardItemType의 title이 undefined를 허용합니다.
                                    contentPreview: card.content.length > 100 ? card.content.substring(0, 100) + '...' : card.content,
                                    date: card.created, // 현재 API에 생성 날짜 필드 없음
                                    thumbnailUrl: card.image,
                                };
                            } else {
                                console.warn(`Failed to fetch detail for card ID ${card.cardId}:`, detailResponse.message);
                                return {
                                    id: String(card.cardId),
                                    // 폴백 제목도 string | undefined 타입에 할당 가능
                                    title: card.content.length > 30 ? card.content.substring(0, 30) + '...' : card.content || "제목 없음", // 폴백 제목
                                    contentPreview: card.content.length > 100 ? card.content.substring(0, 100) + '...' : card.content,
                                    date: card.created,
                                    thumbnailUrl: card.image,
                                };
                            }
                        } catch (detailErr) {
                            console.error(`Error fetching detail for card ID ${card.cardId}:`, detailErr);
                            return {
                                id: String(card.cardId),
                                // 에러 발생 시 폴백 제목도 string | undefined 타입에 할당 가능
                                title: card.content.length > 30 ? card.content.substring(0, 30) + '...' : card.content || "제목 없음", // 에러 발생 시 폴백 제목
                                contentPreview: card.content.length > 100 ? card.content.substring(0, 100) + '...' : card.content,
                                date: card.created,
                                thumbnailUrl: card.image,
                            };
                        }
                    });

                    // Promise.allSettled를 사용하여 모든 Promise가 완료되도록 보장 (실패한 Promise도 처리)
                    const results = await Promise.allSettled(detailedCardsPromises);
                    const mappedCards = results
                        .filter(result => result.status === 'fulfilled' && result.value !== undefined)
                        .map(result => (result as PromiseFulfilledResult<ReadingCardItemType>).value);

                    setReadingCards(mappedCards);

                } else {
                    console.warn("API는 성공을 반환했지만, 카드 데이터(result.cards)가 없거나 형식이 잘못되었습니다:", response);
                    setReadingCards([]); // 빈 배열로 설정하여 오류 없이 렌더링
                    setError("독서 카드를 불러왔으나, 표시할 내용이 없습니다.");
                }
            } else {
                setError(response.message || "독서 카드를 가져오는데 실패했습니다.");
            }
        } catch (err: any) {
            console.error('독서 카드 데이터를 불러오는 중 오류 발생:', err);
            setError(`독서 카드를 불러오는 데 실패했습니다: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [sortOrder]); // sortOrder가 변경될 때마다 fetchCards 함수가 재생성됩니다.

    // useEffect 훅에서 fetchCards를 호출하고, fetchCards가 변경될 때마다 다시 호출되도록 설정
    useEffect(() => {
        fetchCards();
    }, [fetchCards]); // fetchCards 자체가 sortOrder에 의존하므로 여기에 fetchCards를 넣습니다.

    // 정렬 로직은 이제 API에 sort 파라미터를 넘기므로, 프론트엔드에서 직접 정렬할 필요가 없습니다.
    const handleSortClick = useCallback(() => {
        // sortOrder 상태를 변경하여 useEffect가 fetchCards를 다시 호출하게 합니다.
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
