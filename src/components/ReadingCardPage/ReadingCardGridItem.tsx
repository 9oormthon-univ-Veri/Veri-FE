// src/components/ReadingCardPage/ReadingCardGridItem.tsx
// 이 컴포넌트는 '이미지' 탭 (그리드 뷰) 에서 사용됩니다.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ReadingCardGridItem.css'; // 새로운 CSS 파일 임포트
import { type ReadingCardItemType } from './ReadingCardItem'; // 기존 인터페이스 재사용

// 각 독서카드를 이미지 갤러리 형태로 표시하는 컴포넌트
const ReadingCardGridItem: React.FC<ReadingCardItemType> = ({ id, title, thumbnailUrl }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/reading-card-detail/${id}`);
    };

    return (
        <div className="reading-card-grid-item" onClick={handleClick}>
            <div className="grid-image-wrapper">
                <img src={thumbnailUrl} alt={title} />
            </div>
        </div>
    );
};

export default ReadingCardGridItem;