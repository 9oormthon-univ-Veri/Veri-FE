// src/components/ReadingCardPage/ReadingCardGridItem.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ReadingCardGridItem.css'; // CSS 파일 임포트 유지
import { type ReadingCardItemType } from '../../pages/MainPage/ReadingCardPage'; // ReadingCardPage에서 정의된 인터페이스 임포트

// 각 독서카드를 이미지 갤러리 형태로 표시하는 컴포넌트
const ReadingCardGridItem: React.FC<ReadingCardItemType> = ({ id, title, thumbnailUrl }) => {
    const navigate = useNavigate();

    // 클릭 시 독서 카드 상세 페이지로 이동
    const handleClick = () => {
        navigate(`/reading-card-detail/${id}`);
    };

    return (
        <div className="reading-card-grid-item" onClick={handleClick}>
            <div className="grid-image-wrapper">
                <img
                    src={thumbnailUrl || 'https://via.placeholder.com/150x200?text=No+Image'} // 폴백 이미지 추가
                    alt={title}
                    onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/150x200?text=No+Image";
                    }}
                />
            </div>
        </div>
    );
};

export default ReadingCardGridItem;
