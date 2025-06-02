// src/components/ReadingCardItem.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ReadingCardItem.css'; // ReadingCardItem 전용 CSS 파일이 있다면 임포트 (없다면 이 줄은 삭제)

// 독서카드 데이터 타입
// 이 인터페이스는 ReadingCardPage.tsx와 ReadingCardItem.tsx 모두에서 사용되므로,
// 다음과 같은 방법 중 하나를 선택하여 관리하는 것이 좋습니다:
// 1. 여기서 export 하고 ReadingCardPage.tsx에서 import하여 사용 (현재 예시)
// 2. 별도의 types/index.ts 또는 types/readingCard.ts 파일에 정의하고 양쪽에서 import
export interface ReadingCardItemType {
    id: string;
    bookTitle: string;
    author: string;
    contentPreview: string;
    date: string; // "YYYY-MM-DD" 형식이라고 가정
    thumbnailUrl: string;
}

// 각 독서카드를 표시하는 컴포넌트
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

export default ReadingCardItem;