import html2canvas from 'html2canvas';
import React, { useRef } from 'react';
import { MdClose } from 'react-icons/md';
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
            <header className="detail-header">
                <button className="header-left-arrow" onClick={() => navigate(-1)}>
                    <MdClose size={24} color="#333" />
                </button>
                <h3>나의 독서카드</h3>
                <div className="dummy-box" />
            </header>

            <div className="header-margin"></div>

            <p className="completion-message">독서카드 생성이 완료되었어요!</p>

            <div className="action-icons">
                <button className="share-icon-btn" onClick={handleShare} aria-label="사진 공유">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M16 3C17.3261 3 18.5979 3.52678 19.5355 4.46447C20.4732 5.40215 21 6.67392 21 8V16C21 17.3261 20.4732 18.5979 19.5355 19.5355C18.5979 20.4732 17.3261 21 16 21H8C6.67392 21 5.40215 20.4732 4.46447 19.5355C3.52678 18.5979 3 17.3261 3 16V8C3 6.67392 3.52678 5.40215 4.46447 4.46447C5.40215 3.52678 6.67392 3 8 3H16ZM12 8C10.9391 8 9.92172 8.42143 9.17157 9.17157C8.42143 9.92172 8 10.9391 8 12C8 13.0609 8.42143 14.0783 9.17157 14.8284C9.92172 15.5786 10.9391 16 12 16C13.0609 16 14.0783 15.5786 14.8284 14.8284C15.5786 14.0783 16 13.0609 16 12C16 10.9391 15.5786 9.92172 14.8284 9.17157C14.0783 8.42143 13.0609 8 12 8ZM12 10C12.5304 10 13.0391 10.2107 13.4142 10.5858C13.7893 10.9609 14 11.4696 14 12C14 12.5304 13.7893 13.0391 13.4142 13.4142C13.0391 13.7893 12.5304 14 12 14C11.4696 14 10.9609 13.7893 10.5858 13.4142C10.2107 13.0391 10 12.5304 10 12C10 11.4696 10.2107 10.9609 10.5858 10.5858C10.9609 10.2107 11.4696 10 12 10ZM16.5 6.5C16.2348 6.5 15.9804 6.60536 15.7929 6.79289C15.6054 6.98043 15.5 7.23478 15.5 7.5C15.5 7.76522 15.6054 8.01957 15.7929 8.20711C15.9804 8.39464 16.2348 8.5 16.5 8.5C16.7652 8.5 17.0196 8.39464 17.2071 8.20711C17.3946 8.01957 17.5 7.76522 17.5 7.5C17.5 7.23478 17.3946 6.98043 17.2071 6.79289C17.0196 6.60536 16.7652 6.5 16.5 6.5Z" fill="#9BA2B1" />
                    </svg>
                </button>

                <button className="download-icon-btn" onClick={handleDownload} aria-label="다운로드">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M5 18.5C4.60218 18.5 4.22064 18.658 3.93934 18.9393C3.65804 19.2206 3.5 19.6022 3.5 20C3.5 20.3978 3.65804 20.7794 3.93934 21.0607C4.22064 21.342 4.60218 21.5 5 21.5H19C19.3978 21.5 19.7794 21.342 20.0607 21.0607C20.342 20.7794 20.5 20.3978 20.5 20C20.5 19.6022 20.342 19.2206 20.0607 18.9393C19.7794 18.658 19.3978 18.5 19 18.5H5ZM17.303 10.944C17.0217 10.6628 16.6402 10.5048 16.2425 10.5048C15.8448 10.5048 15.4633 10.6628 15.182 10.944L13.5 12.625V4C13.5 3.60218 13.342 3.22064 13.0607 2.93934C12.7794 2.65804 12.3978 2.5 12 2.5C11.6022 2.5 11.2206 2.65804 10.9393 2.93934C10.658 3.22064 10.5 3.60218 10.5 4V12.626L8.818 10.944C8.67873 10.8047 8.51339 10.6941 8.3314 10.6187C8.14942 10.5433 7.95435 10.5044 7.75735 10.5044C7.56035 10.5043 7.36527 10.5431 7.18325 10.6184C7.00123 10.6938 6.83583 10.8042 6.6965 10.9435C6.41511 11.2248 6.25697 11.6063 6.25687 12.0041C6.25683 12.2011 6.29558 12.3962 6.37093 12.5782C6.44627 12.7603 6.55673 12.9257 6.696 13.065L10.939 17.308C11.2203 17.5892 11.6018 17.7472 11.9995 17.7472C12.3972 17.7472 12.7787 17.5892 13.06 17.308L17.303 13.065C17.5842 12.7837 17.7422 12.4022 17.7422 12.0045C17.7422 11.6068 17.5842 11.2253 17.303 10.944Z" fill="#9BA2B1" />
                    </svg>
                </button>
            </div>

            <div className="card-preview-complete" ref={cardRef}>
                <div className="card-preview-complete-card">
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
