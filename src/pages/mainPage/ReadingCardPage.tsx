// src/pages/ReadingCardPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReadingCardPage.css';
import ReadingCardItem from '../../components/ReadingCardPage/ReadingCardItem';
import ReadingCardGridItem from '../../components/ReadingCardPage/ReadingCardGridItem';
// ✨ getMyCards와 함께 GetMyCardsQueryParams 타입을 임포트합니다.
import { getMyCards, type Card, type GetMyCardsQueryParams } from '../../api/cardApi';

// ReadingCardItemType 정의를 API 응답과 사용법에 맞게 업데이트
// ✨ title과 date는 현재 API 스펙에 직접 없으므로, 임시 처리 필요
export interface ReadingCardItemType {
    id: string; // cardId
    title: string; // ✨ 새 스펙에 없음: "제목 없음" 또는 별도 처리 필요
    contentPreview: string; // card.content (trimmed)
    date: string; // ✨ 새 스펙에 없음: "날짜 정보 없음" 또는 별도 처리 필요
    thumbnailUrl: string; // ✨ card.image (imageUrl 대신)
}

function ReadingCardPage() {
    const navigate = useNavigate();
    const [readingCards, setReadingCards] = useState<ReadingCardItemType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // ✨ sortOrder는 이제 API의 'sort' 쿼리 파라미터 값과 일치하도록 변경합니다.
    //    API 스펙에서 'newest', 'oldest' 등의 값이 명시되어 있다면 그에 따릅니다.
    //    현재 스펙에 따르면 'newest'가 기본값이므로 그렇게 설정합니다.
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest'); // API의 sort 파라미터와 일치하도록

    const [activeTab, setActiveTab] = useState<'image' | 'text'>('image'); // 초기값은 '이미지' 탭

    // ✨ API 호출 로직을 useCallback으로 감싸서 sortOrder 변경 시 재사용되도록 합니다.
    const fetchCards = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // ✨ getMyCards에 쿼리 파라미터 객체를 전달합니다.
            const queryParams: GetMyCardsQueryParams = {
                page: 1, // 필요에 따라 페이지네이션 구현 시 동적으로 변경
                size: 20, // 한 페이지에 가져올 카드 수 (적절히 조절)
                sort: sortOrder, // 현재 선택된 정렬 순서를 API에 전달
            };
            const response = await getMyCards(queryParams); // API 호출

            if (response.isSuccess) {
                // response.result와 result.cards의 존재 여부를 안전하게 확인합니다.
                if (response.result && Array.isArray(response.result.cards)) {
                    const mappedCards: ReadingCardItemType[] = response.result.cards.map((card: Card) => ({
                        id: String(card.cardId),
                        // ✨ title: 백엔드 API에서 책 제목을 직접 제공하지 않으므로 임시 처리
                        //    이 부분은 백엔드와 협의하여 스펙을 맞추는 것이 가장 좋습니다.
                        title: "제목 없음", // 또는 카드 내용에서 추출하는 로직 구현
                        contentPreview: card.content.length > 100 ? card.content.substring(0, 100) + '...' : card.content,
                        // ✨ date: 백엔드 API에서 createdAt 필드가 제거되었으므로 임시 처리
                        //    날짜 정보가 필요하다면 백엔드에 요청해야 합니다.
                        date: "날짜 정보 없음", // 또는 `new Date().toISOString()` 등 임시 값
                        // ✨ thumbnailUrl: card.imageUrl 대신 card.image 필드 사용
                        thumbnailUrl: card.image,
                    }));
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

    // useEffect 훅에서 fetchCards를 호출하고, sortOrder가 변경될 때마다 다시 호출되도록 설정
    useEffect(() => {
        fetchCards();
    }, [fetchCards]); // fetchCards 자체가 sortOrder에 의존하므로 여기에 fetchCards를 넣습니다.

    // ✨ 정렬 로직은 이제 API에 sort 파라미터를 넘기므로, 프론트엔드에서 직접 정렬할 필요가 없습니다.
    //    sortedReadingCards useMemo는 더 이상 필요 없으며, readingCards를 직접 사용합니다.
    //    만약 API가 정렬을 지원하지 않거나 클라이언트 정렬이 필요한 경우에만 useMemo를 사용합니다.
    //    현재는 sortOrder 상태를 변경하여 API를 다시 호출하는 방식이므로 제거합니다.
    /*
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
    }, [readingCards, sortOrder]); // 이 useMemo는 이제 필요 없음
    */

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
                        {/* API의 sort 파라미터 값에 맞춰 텍스트를 표시합니다. */}
                        {sortOrder === 'newest' ? '최신순' : '오래된순'} &gt;
                    </span>
                </div>

                {activeTab === 'image' && (
                    <div className="reading-card-grid-view">
                        {readingCards.length > 0 ? ( // ✨ sortedReadingCards 대신 readingCards 사용
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
                        {readingCards.length > 0 ? ( // ✨ sortedReadingCards 대신 readingCards 사용
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