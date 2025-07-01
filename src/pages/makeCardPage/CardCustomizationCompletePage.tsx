import html2canvas from 'html2canvas';
import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CardCustomizationCompletePage.css';

const CardCustomizationCompletePage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const image = location.state?.image as string | undefined;
    const extractedText = location.state?.extractedText as string | undefined;

    const cardRef = useRef<HTMLDivElement>(null); // 캡처 대상 참조

    const handleDownload = async () => {
        if (cardRef.current) {
            const canvas = await html2canvas(cardRef.current);
            const dataUrl = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = '독서카드.png';
            link.click();
        }
    };

    const handleShare = async () => {
        if (cardRef.current) {
            const canvas = await html2canvas(cardRef.current);
            canvas.toBlob((blob) => {
                if (navigator.canShare && blob && navigator.canShare({ files: [new File([blob], 'card.png', { type: 'image/png' })] })) {
                    const file = new File([blob], 'card.png', { type: 'image/png' });

                    navigator.share({
                        title: '나의 독서카드',
                        text: '나만의 독서카드를 공유해요!',
                        files: [file],
                    }).catch((error) => console.error('공유 실패:', error));
                } else {
                    alert('현재 브라우저에서 공유를 지원하지 않아요.');
                }
            }, 'image/png');
        }
    };

    if (!image || !extractedText) {
        navigate('/make-card');
        return null;
    }

    return (
        <div className="complete-page-container">
            <header className="complete-header">
                <button className="cancel-btn" onClick={() => navigate('/')}>취소</button>
                <h2 className="page-title">나의 독서카드</h2>
                <div className="spacer" /> {/* 오른쪽은 비워두기 */}
            </header>

            <p className="completion-message">독서카드 생성이 완료되었어요!</p>

            <div className="action-icons">
                <button className="icon-btn" onClick={handleShare}>📷</button>
                <button className="icon-btn" onClick={handleDownload}>⬇️</button>
            </div>

            <div className="card-preview" ref={cardRef}>
                <div className="card-preview-complete">
                    <img src={image} alt="완성된 카드" className="card-image" />
                    <div className="card-overlay-text">{extractedText}</div>
                </div>

                <div className="card-summary-text">
                    <strong>아무도 지켜보지 않지만 모두가 공연을 한다</strong>
                    <p className="summary-body">
                        {extractedText.length > 80 ? extractedText.slice(0, 80) + '...' : extractedText}
                    </p>
                </div>
            </div>

        </div>
    );
};

export default CardCustomizationCompletePage;
