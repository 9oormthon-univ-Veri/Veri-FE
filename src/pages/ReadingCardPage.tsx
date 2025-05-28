// src/pages/ReadingCardPage.tsx
import React, { useEffect, useState, useMemo, useCallback } from 'react'; // useMemo, useCallback 추가
import { useNavigate } from 'react-router-dom';
import { MdArrowBackIosNew } from 'react-icons/md';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FiSearch } from 'react-icons/fi';
import './ReadingCardPage.css';

// 독서카드 데이터 타입
interface ReadingCardItemType {
  id: string;
  bookTitle: string;
  author: string;
  contentPreview: string;
  date: string; // "YYYY-MM-DD" 형식이라고 가정
  thumbnailUrl: string;
}

// 각 독서카드를 표시하는 컴포넌트 (변경 없음)
const ReadingCardItem: React.FC<ReadingCardItemType> = ({ id, bookTitle, author, contentPreview, date, thumbnailUrl }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/reading-card-detail/${id}`);
  };

  return (
    <div className="reading-card-item" onClick={handleClick}>
      {thumbnailUrl && (
        <div className="card-image-container">
          <img src={thumbnailUrl} alt={bookTitle} />
        </div>
      )}
      <div className="card-content">
        <h4 className="card-book-title">{bookTitle}</h4>
        <p className="card-author">{author}</p>
        <p className="card-preview">{contentPreview}</p>
        <span className="card-date">{date}</span>
      </div>
    </div>
  );
};

function ReadingCardPage() {
  const navigate = useNavigate();
  const [readingCards, setReadingCards] = useState<ReadingCardItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 1. 정렬 기준 상태 추가: 'latest' (최신순), 'oldest' (오래된순) 등
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

  // 2. 정렬된 카드 목록을 계산하는 useMemo 훅
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

  // 3. 정렬 버튼 클릭 핸들러 (useCallback으로 최적화)
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
      <header className="reading-card-header">
        <div className="header-left-arrow" onClick={() => navigate(-1)}>
          <MdArrowBackIosNew size={24} color="#333" />
        </div>
        <h3>독서카드</h3>
        <div className="header-right-icons">
          <FiSearch size={24} color="#333" className="icon-search" />
          <BsThreeDotsVertical size={24} color="#333" className="icon-more" />
        </div>
      </header>

      <div className="sort-options">
        {/* 4. 버튼에 클릭 핸들러 연결 및 텍스트 동적 변경 */}
        <span className="sort-button" onClick={handleSortClick}>
          {sortOrder === 'latest' ? '최신순' : '오래된순'} &gt;
        </span>
      </div>

      <div className="reading-card-list">
        {sortedReadingCards.length > 0 ? ( // 정렬된 카드 목록 사용
          sortedReadingCards.map((card) => (
            <ReadingCardItem
              key={card.id}
              id={card.id}
              bookTitle={card.bookTitle}
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