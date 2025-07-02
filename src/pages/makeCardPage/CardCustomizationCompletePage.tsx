// src/pages/CardCustomizationCompletePage.tsx
import html2canvas from 'html2canvas';
import React, { useRef, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import './CardCustomizationCompletePage.css';
import { createCard } from '../../api/cardApi';
// ✨ imageApi에서 uploadImage 함수를 임포트합니다.
import { uploadImage } from '../../api/imageApi';

const CardCustomizationCompletePage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const image = location.state?.image as string | undefined; // 카드 배경 이미지 (Base64 또는 URL)
    const extractedText = location.state?.extractedText as string | undefined; // 카드에 들어갈 텍스트
    // bookId를 location.state에서 가져옵니다. 이 값이 memberBookId로 사용됩니다.
    const memberBookId = location.state?.bookId as number | undefined;
    const selectedFont = location.state?.font as string | undefined; // 선택된 폰트

    const cardRef = useRef<HTMLDivElement>(null); // html2canvas로 캡처할 카드 요소의 ref

    // 카드 다운로드 처리 함수
    const handleDownload = async () => {
        if (cardRef.current) {
            const canvas = await html2canvas(cardRef.current);
            const dataUrl = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = '독서카드.png'; // 다운로드될 파일 이름
            link.click(); // 다운로드 실행
        }
    };

    // 카드 공유 처리 함수
    const handleShare = async () => {
        if (cardRef.current) {
            const canvas = await html2canvas(cardRef.current);
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Blob 생성에 실패했습니다.');
                    return;
                }

                // navigator.canShare 및 navigator.share API를 사용하여 공유 기능 구현
                if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'card.png', { type: 'image/png' })] })) {
                    const file = new File([blob], 'card.png', { type: 'image/png' });

                    navigator.share({
                        title: '나의 독서카드',
                        text: '나만의 독서카드를 공유해요!',
                        files: [file],
                    }).catch((error) => console.error('공유 실패:', error));
                } else {
                    // alert 대신 console.log로 메시지 출력 (UI에 커스텀 모달이 있다면 대체)
                    console.log('현재 브라우저에서 공유를 지원하지 않거나 파일 공유가 불가능합니다.');
                }
            }, 'image/png');
        }
    };

    // 카드를 저장하는 비동기 함수 (이미지 업로드 후 카드 생성 API 호출)
    const handleSave = async () => {
        // 필수 정보가 없는 경우 에러 로깅 및 함수 종료
        if (!cardRef.current || !extractedText || memberBookId === undefined) {
            console.error('카드를 저장하는 데 필요한 정보가 부족합니다. (이미지, 텍스트 또는 책 ID)');
            return;
        }

        // 1. HTML 요소를 Canvas로 렌더링하고 Blob으로 변환
        const canvas = await html2canvas(cardRef.current);
        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((b) => resolve(b), 'image/png');
        });

        if (!blob) {
            console.error('캔버스에서 이미지 Blob 생성에 실패했습니다.');
            return;
        }

        // 2. Blob을 File 객체로 변환 (업로드를 위해)
        const cardImageFile = new File([blob], `reading_card_${Date.now()}.png`, { type: 'image/png' });

        let uploadedImageUrl: string;
        try {
            // 3. imageApi의 uploadImage 함수를 사용하여 이미지를 서버에 업로드
            // 이 함수는 Presigned URL을 받아와 실제 PUT 업로드를 수행하고 최종 Public URL을 반환합니다.
            uploadedImageUrl = await uploadImage(cardImageFile);
            console.log('생성된 카드 이미지가 성공적으로 업로드되었습니다. URL:', uploadedImageUrl);
        } catch (uploadError) {
            console.error('카드 이미지 업로드 실패:', uploadError);
            // alert 대신 console.log로 메시지 출력 (UI에 커스텀 모달이 있다면 대체)
            console.log('카드 이미지 업로드에 실패했습니다. 다시 시도해주세요.');
            return; // 업로드 실패 시 카드 저장 중단
        }

        try {
            // 4. createCard API를 호출하여 카드를 저장합니다.
            const response = await createCard({
                memberBookId: memberBookId, // memberBookId 사용
                content: extractedText,
                imageUrl: uploadedImageUrl, // 업로드된 이미지의 Public URL 사용
            });

            console.log('카드가 성공적으로 저장되었어요! 카드 ID:', response.result.cardId);
            // 카드 상세 페이지로 이동 (예시 경로)
            navigate(`/reading-card-detail/${response.result.cardId}`);
        } catch (saveError) {
            // alert 대신 console.log로 메시지 출력 (UI에 커스텀 모달이 있다면 대체)
            console.log('카드 저장에 실패했습니다. 다시 시도해주세요.');
            console.error('카드 저장 중 오류:', saveError);
        }
    };

    // ⭐️ useEffect 훅을 사용하여 컴포넌트가 마운트될 때 handleSave를 자동으로 호출합니다.
    useEffect(() => {
        // 이미지, 추출된 텍스트, 책 ID가 모두 존재할 때만 저장을 시도합니다.
        if (image && extractedText && memberBookId !== undefined) {
            handleSave();
        } else {
            // 필수 데이터가 없으면 사용자에게 메시지를 남기고 카드 생성 페이지로 돌려보냅니다.
            console.error('자동 저장을 위한 필수 데이터가 누락되었습니다. 카드 생성 페이지로 리디렉션합니다.');
            navigate('/make-card');
        }
    }, [image, extractedText, memberBookId, navigate]); // 의존성 배열에 변수들을 추가하여 필요할 때만 실행되게 합니다.

    // 이미지, 추출된 텍스트 또는 책 ID가 없을 경우 로딩 상태를 보여주거나 리디렉션합니다.
    if (!image || !extractedText || memberBookId === undefined) {
        // 필요한 데이터가 없으므로 잠시 로딩 메시지를 표시할 수 있습니다.
        // useEffect가 이미 navigate를 호출할 것이므로 이 부분은 빠르게 지나갈 것입니다.
        return <div className="complete-page-container">카드 정보를 불러오는 중...</div>;
    }

    return (
        <div className="complete-page-container">
            <header className="detail-header">
                <button className="header-left-arrow" onClick={() => navigate('/reading-card')}>
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
                {/* 자동 저장 기능으로 인해 별도의 '저장하기' 버튼은 필요 없습니다. */}
            </div>

            <div className="card-preview-complete" ref={cardRef}>
                <div className="card-preview-complete-card">
                    {/* 이미지 URL이 Base64일 수도 있고, 일반 URL일 수도 있으므로 그대로 사용 */}
                    <img src={image} alt="완성된 카드" className="card-image" />
                    <div className="card-overlay-text" style={{ fontFamily: selectedFont }}>
                        {extractedText}
                    </div>
                </div>

                <div className="card-summary-text">
                    {/* 이 부분은 카드 내용 요약이므로, extractedText를 기반으로 동적으로 생성하는 것이 좋습니다. */}
                    {/* 현재는 하드코딩된 텍스트와 extractedText의 일부를 사용하고 있습니다. */}
                    <strong style={{ fontFamily: selectedFont }}>아무도 지켜보지 않지만 모두가 공연을 한다</strong>
                    <p className="summary-body" style={{ fontFamily: selectedFont }}>
                        {extractedText.length > 80 ? extractedText.slice(0, 80) + '...' : extractedText}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CardCustomizationCompletePage;