// src/components/ReadingCardItem.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ReadingCardItem.css';

export interface ReadingCardItemType {
    id: string;
    title: string;
    //author: string;
    contentPreview: string;
    date: string;
    thumbnailUrl: string;
}

// 각 독서카드를 표시하는 컴포넌트
const ReadingCardItem: React.FC<ReadingCardItemType> = ({ id, title, contentPreview, date, thumbnailUrl }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/reading-card-detail/${id}`);
    };

    return (
        <div className="reading-card-page-item" onClick={handleClick}>
            <div className="card-image-container">
                <img src={thumbnailUrl} alt={title} />
            </div>
            <div className="card-content">
                <p className="card-preview">{contentPreview}</p>
                <div className="card-book-info">
                    <p className="card-book-title">{title}</p>
                    <span className="card-date">{date}</span>
                </div>
            </div>
        </div>
    );
};

export default ReadingCardItem;