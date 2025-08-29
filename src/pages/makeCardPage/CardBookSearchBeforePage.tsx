import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CardBookSearchBeforePage.css';

const CardBookSearchBeforePage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const image = location.state?.image as string | undefined;
    const extractedText = location.state?.extractedText as string | undefined;
    const selectedFont = location.state?.font as string | undefined;
    const textPosition = location.state?.textPosition as { x: number; y: number } | undefined;

    const handleBookRegistration = () => {
        navigate('/card-book-search', {
            state: {
                image,
                extractedText,
                font: selectedFont,
                textPosition,
            },
        });
    };

    if (!image || !extractedText) {
        return (
            <div className="page-container">
                <p>필수 정보를 불러오는 중입니다...</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="book-search-before-wrapper">
                <div className="completion-section">
                    <h1 className="completion-title">독서카드 이미지 저장 완료!</h1>
                    <p className="completion-subtitle">독서카드에 맞는 책을 선택해야해요</p>
                </div>

                <div className="card-preview-complete-card">
                        <img 
                            src={image} 
                            alt="완성된 카드" 
                            className="card-image"
                            onError={(e) => {
                                e.currentTarget.src = 'https://placehold.co/350x500/cccccc/333333?text=Image+Load+Failed';
                                e.currentTarget.alt = '이미지 로드 실패';
                                console.error('Failed to load image for display:', image);
                            }}
                        />
                        <div 
                            className="card-overlay-text" 
                            style={{ 
                                fontFamily: selectedFont,
                                left: textPosition ? `${textPosition.x}px` : '16px',
                                top: textPosition ? `${textPosition.y}px` : '100px'
                            }}
                        >
                            {extractedText}
                        </div>
                    </div>

                <div className="action-section">
                    <button className="book-registration-button" onClick={handleBookRegistration}>
                        책 등록하러 가기 
                        <span className="mgc_right_fill"></span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CardBookSearchBeforePage;
