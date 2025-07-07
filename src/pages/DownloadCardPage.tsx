// src/pages/DownloadCardPage/DownloadCardPage.tsx
import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { MdArrowBackIosNew } from 'react-icons/md';
import { FiDownload, FiShare2 } from 'react-icons/fi'; // FiShare2 아이콘 추가

import { getCardDetailById, type Card } from '../api/cardApi';
import './DownloadCardPage.css';

// Define a type for the state passed via react-router-dom's navigate
interface LocationState {
    cardDetail?: Card;
    cardId?: number;
    action?: 'download' | 'share'; // action 속성 추가
}

function DownloadCardPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [cardDetail, setCardDetail] = useState<Card | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const cardContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadCardData = async () => {
            setIsLoading(true);
            setError(null);

            const state = location.state as LocationState;

            if (state?.cardDetail) {
                setCardDetail(state.cardDetail);
                setIsLoading(false);
                console.log("DownloadCardPage: 카드 상세 정보가 state로부터 수신되었습니다.");

                // action이 'share'이면 카드 상세 정보 로드 후 공유를 트리거합니다.
                if (state.action === 'share') {
                    // 렌더링이 완료될 시간을 주기 위해 약간의 지연을 줍니다.
                    setTimeout(() => {
                        handleShare();
                    }, 100);
                }

            } else if (state?.cardId) {
                console.log("DownloadCardPage: 카드 ID가 state로부터 수신되어 상세 정보를 가져옵니다...");
                try {
                    const response = await getCardDetailById(state.cardId);

                    if (response.isSuccess && response.result) {
                        setCardDetail({
                            cardId: response.result.id,
                            content: response.result.content,
                            imageUrl: response.result.imageUrl,
                            createdAt: response.result.createdAt,
                            book: response.result.book ? {
                                id: response.result.book.id,
                                title: response.result.book.title,
                                coverImageUrl: response.result.book.coverImageUrl,
                                author: response.result.book.author,
                            } : null,
                        });
                        // action이 'share'이면 카드 상세 정보 로드 후 공유를 트리거합니다.
                        if (state.action === 'share') {
                            setTimeout(() => {
                                handleShare();
                            }, 100);
                        }
                    } else {
                        setError(response.message || "독서 카드 상세 정보를 가져오는데 실패했습니다.");
                    }
                } catch (err: any) {
                    console.error('독서 카드 상세 정보를 불러오는 중 오류 발생:', err);
                    setError(`독서 카드 상세 정보를 불러오는 데 실패했습니다: ${err.message}`);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setError("다운로드할 독서 카드 정보가 제공되지 않았습니다. 이전 페이지에서 다시 시도해주세요.");
                setIsLoading(false);
            }
        };

        loadCardData();
    }, [location.state]); // location.state에 action이 추가되므로 의존성 배열에 유지

    // 다운로드 처리 함수
    const handleDownload = useCallback(async () => {
        if (!cardContentRef.current) {
            alert('다운로드할 카드를 찾을 수 없습니다.');
            return;
        }
        if (isLoading || isProcessing) {
            //alert('카드가 아직 로드 중이거나 처리 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        setIsProcessing(true);
        try {
            const scale = 2;
            const canvas = await html2canvas(cardContentRef.current, {
                useCORS: true,
                scale: scale,
                logging: true,
                imageTimeout: 15000,
            });
            const dataUrl = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `독서카드_${cardDetail?.book?.title || '제목없음'}_${cardDetail?.cardId}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            alert('독서카드가 다운로드되었습니다!');
        } catch (err: any) {
            console.error('독서카드 다운로드 실패:', err);
            if (err.name === 'SecurityError' || (err.message && err.message.includes('CORS'))) {
                 alert('독서카드 다운로드에 실패했습니다: 이미지 로드에 문제가 발생했습니다 (CORS 오류일 수 있습니다). 개발자 도구 콘솔을 확인해주세요.');
            } else {
                 alert(`독서카드 다운로드에 실패했습니다: ${err.message}`);
            }
        } finally {
            setIsProcessing(false);
        }
    }, [cardDetail, isLoading, isProcessing]);


    // 공유 처리 함수 (DownloadCardPage에서 직접 캡처하여 공유)
    const handleShare = useCallback(async () => {
        if (!cardContentRef.current) {
            alert('공유할 카드를 찾을 수 없습니다.');
            return;
        }
        if (isLoading || isProcessing) {
            //alert('카드가 아직 로드 중이거나 처리 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        setIsProcessing(true);
        try {
            const canvas = await html2canvas(cardContentRef.current, { useCORS: true });
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    console.error('Blob 생성에 실패했습니다.');
                    alert('독서카드 공유에 실패했습니다.');
                    setIsProcessing(false);
                    return;
                }

                const file = new File([blob], `독서카드_${cardDetail?.book?.title || '제목없음'}.png`, { type: 'image/png' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            title: `나의 독서카드: ${cardDetail?.book?.title || '제목없음'}`,
                            text: cardDetail?.content || '나만의 독서카드를 공유해요!',
                            files: [file],
                        });
                        console.log('독서카드 공유 성공');
                    } catch (error: any) {
                        console.error('독서카드 공유 실패:', error);
                        if (error.name !== 'AbortError') {
                            alert(`독서카드 공유에 실패했습니다: ${error.message}`);
                        }
                    }
                } else {
                    alert('현재 브라우저에서는 파일 공유를 지원하지 않습니다.');
                }
                setIsProcessing(false);
            }, 'image/png');
        } catch (err: any) {
            console.error('독서카드 공유 준비 실패:', err);
            alert(`독서카드 공유 준비에 실패했습니다: ${err.message}`);
            setIsProcessing(false);
        }
    }, [cardDetail, isLoading, isProcessing]);

    if (isLoading || isProcessing) {
        return (
            <div className="loading-page-container">
                <p>{isProcessing ? '처리 중...' : '독서 카드 상세 정보를 불러오는 중...'}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="loading-page-container">
                <p style={{ color: 'red' }}>{error}</p>
                <button onClick={() => navigate(-1)} className="back-button">뒤로 가기</button>
            </div>
        );
    }

    if (!cardDetail) {
        return (
            <div className="download-card-page-container no-data-state">독서 카드 정보를 찾을 수 없습니다.</div>
        );
    }

    return (
        <div className="page-container">
            <header className="download-header">
                <button className="header-left-arrow" onClick={() => navigate("/reading-card")}>
                    <MdArrowBackIosNew size={24} color="#333" />
                </button>
                <h3>다운로드</h3>
                <div className="header-right-placeholder"></div>
            </header>

            {/* header-margin div는 포함하지 않습니다. */}

            <div className="download-card-content" ref={cardContentRef}>
                {/* SVG 필터 정의 (화면에 보이지 않음) */}
                <svg width="0" height="0" style={{ position: 'absolute' }}>
                    <filter id="gaussian-blur">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
                    </filter>
                </svg>

                <div
                    className="download-card-blurred-background"
                    style={{ backgroundImage: `url('${cardDetail!.imageUrl || 'https://placehold.co/300x400?text=No+Card+Image'}')` }}
                ></div>

                <div className="download-card-preview-container">
                    <div className="download-card-image-and-overlay-wrapper">
                        <img
                            src={cardDetail!.imageUrl || 'https://placehold.co/300x400?text=No+Card+Image'}
                            alt={`독서 카드: ${cardDetail!.book?.title || '제목없음'}`}
                            className="download-card-main-image"
                            crossOrigin="anonymous"
                            onError={(e) => {
                                e.currentTarget.src = "https://placehold.co/300x400?text=No+Card+Image";
                                e.currentTarget.alt = "이미지 로드 실패";
                                console.error('Failed to load image for display:', e.currentTarget.src);
                            }}
                        />
                        <div className="download-card-image-overlay-text">
                            {cardDetail!.content}
                        </div>
                    </div>

                    <div className="download-card-text-content">
                        <p className="download-card-book-title">
                            {cardDetail!.book?.title || '책 정보 없음'}
                            {!cardDetail!.book && <span className="no-book-info-message"> (책 정보 없음)</span>}
                        </p>
                        <p className="download-card-main-content">{cardDetail!.content}</p>
                    </div>
                </div>
            </div>

            <div className="download-action-button-wrapper">
                <button
                    className="download-button"
                    onClick={handleDownload}
                    disabled={isProcessing || isLoading}
                >
                    <FiDownload size={24} />
                    <span>다운로드</span>
                </button>
                {/* 공유하기 버튼 추가 */}
                <button
                    className="download-button" // 스타일을 위해 새로운 클래스 추가 또는 기존 클래스 재활용
                    onClick={handleShare}
                    disabled={isProcessing || isLoading}
                    style={{ marginLeft: '10px' }} // 버튼 간 간격
                >
                    <FiShare2 size={24} />
                    <span>공유하기</span>
                </button>
            </div>
        </div>
    );
}

export default DownloadCardPage;
