// src/pages/ReadingCardPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBackIosNew } from 'react-icons/md';
import { BsThreeDotsVertical } from 'react-icons/bs'; // 더보기 (정렬 옵션 등)
import { FiSearch } from 'react-icons/fi'; // 검색 아이콘
import './ReadingCardPage.css';

// 독서카드 데이터 타입 (MyReadingCard.tsx와 유사하게 정의)
interface ReadingCardItemType {
  id: string;
  bookTitle: string; // 책 제목
  author: string; // 저자
  contentPreview: string; // 독서 내용 미리보기
  date: string; // 날짜
  thumbnailUrl: string; // 썸네일 (선택 사항 - string 또는 undefined)
}

// 각 독서카드를 표시하는 컴포넌트 (SingleReadingCard와 유사)
// props 타입에서 thumbnailUrl을 'string | undefined'로 명시
const ReadingCardItem: React.FC<ReadingCardItemType> = ({ id, bookTitle, author, contentPreview, date, thumbnailUrl }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // 상세 페이지로 이동 (예: 독서카드 상세 페이지 또는 관련 책 상세 페이지)
    // 여기서는 독서카드 상세 페이지로 이동한다고 가정
    navigate(`/reading-card-detail/${id}`);
  };

  return (
    <div className="reading-card-item" onClick={handleClick}>
      {thumbnailUrl && ( // thumbnailUrl이 있을 때만 이미지 렌더링
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

  useEffect(() => {
    fetch('/datas/readingCards.json') // 독서카드 데이터를 불러올 JSON 파일 경로
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
          {/* 정렬 옵션은 BsThreeDotsVertical 클릭 시 드롭다운 등으로 구현 가능 */}
          <BsThreeDotsVertical size={24} color="#333" className="icon-more" />
        </div>
      </header>

      <div className="sort-options">
        <span className="sort-button">최신순 &gt;</span> {/* 이미지에 "최신순" 버튼 있음 */}
      </div>

      <div className="reading-card-list">
        {readingCards.length > 0 ? (
          readingCards.map((card) => (
            <ReadingCardItem
              key={card.id}
              id={card.id}
              bookTitle={card.bookTitle}
              author={card.author}
              contentPreview={card.contentPreview}
              date={card.date}
              thumbnailUrl={card.thumbnailUrl} // 여기서도 'undefined'가 전달될 수 있으므로 그대로 둡니다.
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