// src/components/ReadingCard/ReadingCardPreview.tsx
import React from 'react';
import './ReadingCardPreview.css';

interface ReadingCardPreviewProps {
  card: {
    id: string;
    bookId: string;
    quote: string; // 예시로 인용구만 표시
  };
  onClick: () => void;
}

const ReadingCardPreview: React.FC<ReadingCardPreviewProps> = ({ card, onClick }) => {
  return (
    <div className="reading-card-preview" onClick={onClick}>
      {/* 카드 미리보기 내용 (예: 인용구 일부, 하이라이트 등) */}
      <p>{card.quote.substring(0, 50)}...</p> {/* 예시: 인용구 50자만 표시 */}
    </div>
  );
};

export default ReadingCardPreview;