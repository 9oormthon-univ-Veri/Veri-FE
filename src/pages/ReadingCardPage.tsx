// src/pages/ReadingCardPage.tsx
import { useEffect, useState, useMemo, useCallback } from 'react'; // useMemo, useCallback 유지
import './ReadingCardPage.css'; // 페이지 전체적인 CSS
import ReadingCardItem, { type ReadingCardItemType } from '../components/ReadingCardPage/ReadingCardItem';

// 독서카드 데이터 타입은 이제 ReadingCardItem.tsx에서 import하여 사용합니다.
// 만약 이 타입이 여러 곳에서 쓰인다면 별도의 types 폴더에 정의하는 것이 가장 좋습니다.
// 여기서는 ReadingCardItem.tsx에서 export 된 타입을 바로 사용합니다.

function ReadingCardPage() {
    const [readingCards, setReadingCards] = useState<ReadingCardItemType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // 1. 정렬 기준 상태 추가: 'latest' (최신순), 'oldest' (오래된순)
    const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

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

    // 2. 정렬된 카드 목록을 계산하는 useMemo 훅 (유지)
    const sortedReadingCards = useMemo(() => {
        // 원본 배열을 복사하여 정렬합니다. (원본 배열 변경 방지)
        const sorted = [...readingCards].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            if (sortOrder === 'latest') {
                return dateB.getTime() - dateA.getTime(); // 최신순 (내림차순)
            } else { // 'oldest'
                return dateA.getTime() - dateB.getTime(); // 오래된순 (오름차순)
            }
        });
        return sorted;
    }, [readingCards, sortOrder]); // readingCards나 sortOrder가 변경될 때만 재계산

    // 3. 정렬 버튼 클릭 핸들러 (useCallback으로 최적화) (유지)
    const handleSortClick = useCallback(() => {
        // 현재 'latest'이면 'oldest'로, 'oldest'이면 'latest'로 토글
        setSortOrder(prevOrder => (prevOrder === 'latest' ? 'oldest' : 'latest'));
    }, []); // 의존성 배열이 비어있으므로 컴포넌트 마운트 시 한 번만 생성

    if (isLoading) {
        return <div className="reading-card-page-container loading-state">독서 카드를 불러오는 중...</div>;
    }

    if (error) {
        return <div className="reading-card-page-container error-state" style={{ color: 'red' }}>{error}</div>;
    }

    return (
        <div className="reading-card-page-container">
            <header className="hero-header">
            <img src="/icons/bell-icon.svg" className="icon"/>
                <div className="header-icons">
                    <img src="/icons/bell-icon.svg" className="icon"/>
                    <img src="/icons/search-icon.svg" className="icon"/>
                </div>
            </header>

            <div className="sort-options">
                <span className="sort-button" onClick={handleSortClick}>
                    {sortOrder === 'latest' ? '최신순' : '오래된순'} &gt;
                </span>
            </div>

            <div className="reading-card-list">
                {sortedReadingCards.length > 0 ? ( // 정렬된 카드 목록 사용
                    sortedReadingCards.map((card) => (
                        <ReadingCardItem // 분리된 컴포넌트 사용
                            key={card.id}
                            id={card.id}
                            title={card.title}
                            author={card.author}
                            contentPreview={card.contentPreview}
                            date={card.date}
                            thumbnailUrl={card.thumbnailUrl}
                        />
                    ))
                ) : (
                    <p className="no-cards-message">등록된 독서 카드가 없습니다.</p>
                )}
            </div>
        </div>
    );
}

export default ReadingCardPage;