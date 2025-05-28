// src/components/BookDetail/ReadingCardSection.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReadingCardPreview from '../ReadingCard/ReadingCardPreview'; // ✨ 독서카드 미리보기 컴포넌트 임포트
import { MdArrowForwardIos } from 'react-icons/md'; // 오른쪽 화살표 아이콘
import { FaCamera } from 'react-icons/fa'; // 카메라 아이콘 (버튼 내부에 사용)
import './ReadingCardSection.css';

// 독서카드 데이터 타입 (ReadingCards.tsx 또는 BookshelfItem.tsx에서 정의될 것으로 예상)
interface ReadingCardItem {
  id: string;
  bookId: string;
  quote: string; // 인용구 (미리보기용)
  createdAt: string; // 생성 날짜 (미리보기용)
  // 기타 독서카드 상세 정보
}

interface ReadingCardSectionProps {
  bookId: string; // 특정 책의 독서카드를 불러오기 위함
}

const ReadingCardSection: React.FC<ReadingCardSectionProps> = ({ bookId }) => {
  const navigate = useNavigate();
  const [readingCards, setReadingCards] = useState<ReadingCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 실제 독서카드 데이터를 불러오는 로직 (bookId에 따라 필터링)
    // 여기서는 임시로 Mock 데이터를 사용합니다.
    fetch('/datas/readingCards.json') // ✨ 독서카드 Mock 데이터 파일 경로 (생성 필요)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: ReadingCardItem[]) => {
        // 현재 책 ID에 해당하는 독서카드만 필터링
        const filteredCards = data.filter(card => card.bookId === bookId);
        // 미리보기로 보여줄 3개 정도만 선택 (최신순 등 정렬 로직 추가 가능)
        setReadingCards(filteredCards.slice(0, 3));
        setIsLoading(false);
      })
      .catch(err => {
        console.error('독서카드를 불러오는 중 오류 발생:', err);
        setError('독서카드를 불러오는 데 실패했습니다.');
        setIsLoading(false);
      });
  }, [bookId]);


  const handleSeeAllCards = () => {
    navigate(`/book-detail/${bookId}/reading-cards`); // 해당 책의 모든 독서카드 목록 페이지로 이동
  };

  const handleCreateCard = () => {
    navigate(`/create-reading-card/${bookId}`); // 새로운 독서카드 생성 페이지로 이동
  };

  return (
    <div className="reading-card-section">
      <div className="section-header">
        <h4 className="section-title">나의 독서카드</h4>
        <div className="see-all-cards" onClick={handleSeeAllCards}>
          <span>전체보기</span>
          <MdArrowForwardIos size={14} color="#888" />
        </div>
      </div>

      <div className="reading-cards-preview-list">
        {isLoading ? (
          <p className="loading-message">독서카드 불러오는 중...</p>
        ) : error ? (
          <p className="error-message" style={{ color: 'red' }}>{error}</p>
        ) : readingCards.length > 0 ? (
          readingCards.map(card => (
            <ReadingCardPreview key={card.id} card={card} onClick={() => navigate(`/reading-card/${card.id}`)} />
          ))
        ) : (
          <p className="no-cards-message">작성된 독서카드가 없습니다.</p>
        )}
      </div>

      <div className="create-card-button-container">
        <button className="create-card-button" onClick={handleCreateCard}>
          <FaCamera size={18} />
          <span>독서카드 만들기</span>
        </button>
      </div>
    </div>
  );
};

export default ReadingCardSection;