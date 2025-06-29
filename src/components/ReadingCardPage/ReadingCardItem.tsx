// src/components/ReadingCardPage/ReadingCardItem.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ReadingCardItem.css'; // CSS 파일 임포트 유지
import { type ReadingCardItemType } from '../../pages/MainPage/ReadingCardPage'; // ReadingCardPage에서 정의된 인터페이스 임포트

// 각 독서카드를 표시하는 컴포넌트
const ReadingCardItem: React.FC<ReadingCardItemType> = ({ id, title, contentPreview, date, thumbnailUrl }) => {
    const navigate = useNavigate();

    // 클릭 시 독서 카드 상세 페이지로 이동
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
            <div className="card-image-container">
                <img
                    src={thumbnailUrl || 'https://via.placeholder.com/100x150?text=No+Image'} // 폴백 이미지 추가
                    alt={title}
                    onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/100x150?text=No+Image";
                    }}
                />
            </div>
            <div className="card-content">
                <p className="card-preview">{contentPreview}</p>
                <div className="card-book-info">
                    <p className="card-book-title">{title}</p>
                    <span className="card-date">{formattedDate}</span>
                </div>
            </div>
        </div>
    );
};

export default ReadingCardItem;
