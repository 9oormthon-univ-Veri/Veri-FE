import html2canvas from 'html2canvas';
import React, { useRef, useEffect, useState, useCallback } from 'react'; // useCallback 추가
import { MdClose } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import './CardCustomizationCompletePage.css';
import { createCard } from '../../api/cardApi'; // uploadImageAndGetUrl 임포트 경로 확인
import { getBookById, type GetBookByIdResponse } from '../../api/bookApi'; // getBookById 및 GetBookByIdResponse 임포트

const CardCustomizationCompletePage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const image = location.state?.image as string | undefined; // 카드 배경 이미지 (Public URL)
    const extractedText = location.state?.extractedText as string | undefined; // 카드에 들어갈 텍스트
    const memberBookId = location.state?.bookId as number | undefined; // 이 값이 memberBookId로 사용됩니다.
    const selectedFont = location.state?.font as string | undefined; // 선택된 폰트

    const cardRef = useRef<HTMLDivElement>(null); // html2canvas로 캡처할 카드 요소의 ref
    const hasSaved = useRef(false); // ✨ 저장 함수가 이미 호출되었는지 추적하는 useRef

    // 저장 과정의 로딩 및 에러 상태를 관리합니다.
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [bookTitle, setBookTitle] = useState<string>('책 제목 불러오는 중...'); // ✨ 책 제목 상태 추가

    // ✨ 책 제목을 불러오는 useEffect
    useEffect(() => {
        const fetchBookTitle = async () => {
            if (memberBookId !== undefined) {
                try {
                    const response: GetBookByIdResponse = await getBookById(memberBookId);
                    if (response.isSuccess && response.result) {
                        setBookTitle(response.result.title);
                    } else {
                        console.error('Failed to fetch book title:', response.message);
                        setBookTitle('책 제목 불러오기 실패');
                    }
                } catch (err) {
                    console.error('Error fetching book title:', err);
                    setBookTitle('책 제목 불러오기 실패');
                }
            } else {
                setBookTitle('책 ID 없음');
            }
        };

        fetchBookTitle();
    }, [memberBookId]);


    // 카드 다운로드 처리 함수
    const handleDownload = async () => {
        if (isSaving) return; // 저장 중에는 다운로드 비활성화
        if (cardRef.current) {
            try {
                const canvas = await html2canvas(cardRef.current, { useCORS: true });
                const dataUrl = canvas.toDataURL('image/png');

                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `독서카드_${bookTitle || 'unknown'}.png`; // 파일 이름에 책 제목 사용
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (err: any) {
                console.error('독서카드 다운로드 실패:', err);
                alert(`독서카드 다운로드에 실패했습니다: ${err.message}`);
            }
        }
    };

    // 카드 공유 처리 함수
    const handleShare = async () => {
        if (isSaving) return; // 저장 중에는 공유 비활성화
        if (cardRef.current) {
            try {
                const canvas = await html2canvas(cardRef.current, { useCORS: true });
                canvas.toBlob(async (blob) => {
                    if (!blob) {
                        console.error('Blob 생성에 실패했습니다.');
                        alert('독서카드 공유에 실패했습니다.');
                        return;
                    }

                    const file = new File([blob], `독서카드_${bookTitle || 'unknown'}.png`, { type: 'image/png' });

                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        try {
                            await navigator.share({
                                title: `나의 독서카드: ${bookTitle || '제목없음'}`, // 공유 제목에 책 제목 사용
                                text: '나만의 독서카드를 공유해요!',
                                files: [file],
                            });
                            console.log('독서카드 공유 성공');
                        } catch (error: any) {
                            console.error('공유 실패:', error);
                            if (error.name !== 'AbortError') { // 사용자가 공유를 취소한 경우가 아니라면 에러 메시지 표시
                                alert(`독서카드 공유에 실패했습니다: ${error.message}`);
                            }
                        }
                    } else {
                        alert('현재 브라우저에서 공유를 지원하지 않거나 파일 공유가 불가능합니다.');
                    }
                }, 'image/png');
            } catch (err: any) {
                console.error('독서카드 공유 준비 실패:', err);
                alert(`독서카드 공유 준비에 실패했습니다: ${err.message}`);
            }
        }
    };

    // 카드를 저장하는 비동기 함수 (이미지 업로드 후 카드 생성 API 호출)
    const handleSave = useCallback(async () => {
        // ✨ hasSaved.current가 true이면 이미 저장 중이거나 저장이 완료된 것이므로 함수 종료
        if (hasSaved.current || isSaving || !extractedText || memberBookId === undefined) {
            if (!hasSaved.current && !isSaving) { // 처음 저장 시도 시에만 에러 로깅
                console.error('카드를 저장하는 데 필요한 정보가 부족합니다. (텍스트 또는 책 ID)');
                setSaveError('카드 저장에 필요한 정보가 부족합니다.');
            }
            return;
        }

        // image (원본 배경 이미지 URL)가 없으면 저장 불가
        if (!image) {
            console.error('카드를 저장하는 데 필요한 이미지 URL이 없습니다.');
            setSaveError('카드 저장에 필요한 이미지 URL이 없습니다.');
            return;
        }

        hasSaved.current = true; // ✨ 저장 시작 플래그 설정
        setIsSaving(true); // 저장 시작
        setSaveError(null); // 에러 초기화

        try {
            // 1. createCard API를 호출하여 카드의 메타데이터를 저장합니다.
            //    이때 imageUrl은 원본 배경 이미지 URL(image)을 직접 사용합니다.
            const response = await createCard({
                memberBookId: memberBookId,
                content: extractedText,
                imageUrl: image, // ✨ 원본 배경 이미지 URL을 직접 사용
            });

            console.log('카드가 성공적으로 저장되었어요! 카드 ID:', response.result.cardId);
            alert('독서카드가 성공적으로 생성 및 저장되었습니다!'); // 사용자에게 저장 완료 알림

        } catch (saveError: any) {
            console.error('카드 메타데이터 저장 중 오류:', saveError);
            setSaveError(`카드 저장 실패: ${saveError.message || '알 수 없는 오류'}`);
        } finally {
            setIsSaving(false); // 저장 완료 (성공 또는 실패)
        }
    }, [isSaving, extractedText, memberBookId, image]); // image를 의존성 배열에 추가

    // useEffect 훅을 사용하여 컴포넌트가 마운트될 때 handleSave를 자동으로 호출합니다.
    useEffect(() => {
        // 이미지, 추출된 텍스트, 책 ID가 모두 존재하고 아직 저장되지 않았을 때만 저장을 시도합니다.
        if (image && extractedText && memberBookId !== undefined && !hasSaved.current) {
            handleSave();
        } else if (!image || !extractedText || memberBookId === undefined) {
            // 필수 데이터가 없으면 사용자에게 메시지를 남기고 카드 생성 페이지로 돌려보냅니다.
            console.error('자동 저장을 위한 필수 데이터가 누락되었습니다. 카드 생성 페이지로 리디렉션합니다.');
            navigate('/make-card');
        }
    }, [image, extractedText, memberBookId, navigate, handleSave]); // handleSave를 의존성 배열에 추가

    // 이미지, 추출된 텍스트 또는 책 ID가 없을 경우 로딩 상태를 보여주거나 리디렉션합니다.
    if (!image || !extractedText || memberBookId === undefined) {
        return <div className="complete-page-container">카드 정보를 불러오는 중...</div>;
    }

    // 저장 중일 때 로딩 UI 표시
    if (isSaving) {
        return (
            <div className="page-container loading-state">
                <p>독서카드를 저장 중입니다...</p>
                {saveError && <p style={{ color: 'red' }}>오류: {saveError}</p>}
            </div>
        );
    }

    // 저장 실패 시 에러 메시지 표시
    if (saveError) {
        return (
            <div className="page-container error-state">
                <p style={{ color: 'red' }}>카드 저장에 실패했습니다.</p>
                <p style={{ color: 'red' }}>오류: {saveError}</p>
                <button onClick={() => navigate('/make-card')} style={{ marginTop: '20px' }}>다시 시도하기</button>
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="detail-header">
                <button className="header-left-arrow" onClick={() => navigate('/reading-card')}>
                    <MdClose size={24} color="#333" />
                </button>
                <h3>나의 독서카드</h3>
                <div className="dummy-box" />
            </header>

            <div className="header-margin"></div>
            {/* ✨ customization-complete-page-wrapper div 다시 추가 */}
            <div className="customization-complete-page-wapper">
                <p className="completion-message">독서카드 생성이 완료되었어요!</p>

                <div className="action-icons">
                    <button className="share-icon-btn" onClick={handleShare} aria-label="사진 공유">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M16 3C17.3261 3 18.5979 3.52678 19.5355 4.46447C20.4732 5.40215 21 6.67392 21 8V16C21 17.3261 20.4732 18.5979 19.5355 19.5355C18.5979 20.4732 17.3261 21 16 21H8C6.67392 21 5.40215 20.4732 4.46447 19.5355C3.52678 18.5979 3 17.3261 3 16V8C3 6.67392 3.52678 5.40215 4.46447 4.46447C5.40215 3.52678 6.67392 3 8 3H16ZM12 8C10.9391 8 9.92172 8.42143 9.17157 9.17157C8.42143 9.92172 8 10.9391 8 12C8 13.0609 8.42143 14.0783 9.17157 14.8284C9.92172 15.5786 10.9391 16 12 16C13.0609 16 14.0783 15.5786 14.8284 14.8284C15.5786 14.0783 16 13.0609 16 12C16 10.9391 15.5786 9.92172 14.8284 9.17157C14.0783 8.42143 13.0609 8 12 8ZM12 10C12.5304 10 13.0391 10.2107 13.4142 10.5858C13.7893 10.9609 14 11.4696 14 12C14 12.5304 13.7893 13.0391 13.4142 13.4142C13.0391 13.7893 12.5304 14 12 14C11.4696 14 10.9609 13.7893 10.5858 13.4142C10.2107 13.0391 10 12.5304 10 12C10 11.4696 10.2107 10.9609 10.5858 10.5858C10.9609 10.2107 11.4696 10 12 10ZM16.5 6.5C16.2348 6.5 15.9804 6.60536 15.7929 6.79289C15.6054 6.98043 15.5 7.23478 15.5 7.5C15.5 7.76522 15.6054 8.01957 15.7929 8.20711C15.9804 8.39464 16.2348 8.5 16.5 8.5C16.7652 8.5 17.0196 8.39464 17.2071 8.20711C17.3946 8.01957 17.5 7.76522 17.5 7.5C17.5 7.23478 17.3946 6.98043 17.2071 6.79289C17.0196 6.60536 16.7652 6.5 16.5 6.5Z" fill="#9BA2B1" />
                        </svg>
                    </button>

                    <button className="download-icon-btn" onClick={handleDownload} aria-label="다운로드">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M5 18.5C4.60218 18.5 4.22064 18.658 3.93934 18.9393C3.65804 19.2206 3.5 19.6022 3.5 20C3.5 20.3978 3.65804 20.7794 3.93934 21.0607C4.22064 21.342 4.60218 21.5 5 21.5H19C19.3978 21.5 19.7794 21.342 20.0607 21.0607C20.342 20.7794 20.5 20.3978 20.5 20C20.5 19.6022 20.342 19.2206 20.0607 18.9393C19.7794 18.658 19.3978 18.5 19 18.5H5ZM17.303 10.944C17.0217 10.6628 16.6402 10.5048 16.2425 10.5048C15.8448 10.5048 15.4633 10.6628 15.182 10.944L13.5 12.625V4C13.5 3.60218 13.342 3.22064 13.0607 2.93934C12.7794 2.65804 12.3978 2.5 12 2.5C11.6022 2.5 11.2206 2.65804 10.9393 2.93934C10.658 3.22064 10.5 3.60218 10.5 4V12.626L8.818 10.944C8.67873 10.8047 8.51339 10.6941 8.33140 10.6187C8.14942 10.5433 7.95435 10.5044 7.75735 10.5044C7.56035 10.5043 7.36527 10.5431 7.18325 10.6184C7.00123 10.6938 6.83583 10.8042 6.69650 10.9435C6.41511 11.2248 6.25697 11.6063 6.25687 12.0041C6.25683 12.2011 6.29558 12.3962 6.37093 12.5782C6.44627 12.7603 6.55673 12.9257 6.69600 13.065L10.9390 17.308C11.2203 17.5892 11.6018 17.7472 11.9995 17.7472C12.3972 17.7472 12.7787 17.5892 13.0600 17.308L17.3030 13.065C17.5842 12.7837 17.7422 12.4022 17.7422 12.0045C17.7422 11.6068 17.5842 11.2253 17.3030 10.944Z" fill="#9BA2B1" />
                        </svg>
                    </button>
                </div>

                <div className="card-preview-complete" ref={cardRef}>
                    <div className="card-preview-complete-card">
                        <img src={image} alt="완성된 카드" className="card-image" 
                             onError={(e) => {
                                 e.currentTarget.src = 'https://placehold.co/350x500/cccccc/333333?text=Image+Load+Failed';
                                 e.currentTarget.alt = '이미지 로드 실패';
                                 console.error('Failed to load image for display:', image);
                             }}
                        />
                        <div className="card-overlay-text" style={{ fontFamily: selectedFont }}>
                            {extractedText}
                        </div>
                    </div>

                    <div className="card-summary-text">
                        <strong style={{ fontFamily: selectedFont }}>{bookTitle}</strong>
                        <p className="summary-body" style={{ fontFamily: selectedFont }}>
                            {extractedText.length > 80 ? extractedText.slice(0, 80) + '...' : extractedText}
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CardCustomizationCompletePage;
