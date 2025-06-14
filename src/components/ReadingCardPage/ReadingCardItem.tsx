// src/components/ReadingCardPage/ReadingCardItem.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ReadingCardItem.css';

export interface ReadingCardItemType {
    id: string;
    title: string;
    //author: string; // 현재 사용되지 않으므로 주석 처리 또는 제거
    contentPreview: string;
    date: string;
    thumbnailUrl: string; // thumbnailUrl은 이제 필수 prop
}

// 각 독서카드를 표시하는 컴포넌트
const ReadingCardItem: React.FC<ReadingCardItemType> = ({ id, title, contentPreview, date, thumbnailUrl }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/reading-card-detail/${id}`);
    };

    // 날짜 포맷팅 (예: "2023. 12. 01.")
    const formattedDate = new Date(date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\./g, '. ').trim(); // 마침표 뒤에 공백 추가 후 양쪽 공백 제거

    return (
        <div className="reading-card-page-item" onClick={handleClick}>
            {/* 이미지 컨테이너: thumbnailUrl이 필수로 들어오므로 항상 렌더링 */}
            <div className="card-image-container">
                <img src={thumbnailUrl} alt={title} />
            </div>
            {/* 텍스트 컨테이너 */}
            <div className="card-content">
                <p className="card-preview">{contentPreview}</p>
                <div className="card-book-info">
                    <p className="card-book-title">{title}</p>
                    <span className="card-date">{formattedDate}</span> {/* 포맷팅된 날짜 사용 */}
                </div>
            </div>
        </div>
    );
};

export default ReadingCardItem;