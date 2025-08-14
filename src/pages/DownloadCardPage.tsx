// src/pages/DownloadCardPage/DownloadCardPage.tsx
import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { MdArrowBackIosNew } from 'react-icons/md';
import { FiDownload, FiShare2 } from 'react-icons/fi';

import { getCardDetailById, type Card } from '../api/cardApi';
import './DownloadCardPage.css';

interface LocationState {
    cardDetail?: Card;
    cardId?: number;
    action?: 'download' | 'share';
}

const DEFAULT_IMAGE_URL = 'https://placehold.co/300x400?text=No+Card+Image';

function DownloadCardPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const cardContentRef = useRef<HTMLDivElement>(null);

    const [cardDetail, setCardDetail] = useState<Card | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);


    const getImageUrl = useCallback(() => 
        cardDetail?.imageUrl || DEFAULT_IMAGE_URL, [cardDetail?.imageUrl]
    );

    const getBookTitle = useCallback(() => 
        cardDetail?.book?.title || '제목없음', [cardDetail?.book?.title]
    );

    const getFileName = useCallback((suffix: string) => 
        `독서카드_${getBookTitle()}_${cardDetail?.cardId || 'unknown'}${suffix}`, 
        [getBookTitle, cardDetail?.cardId]
    );

    const handleCardDataLoad = useCallback(async (cardId: number) => {
        try {
            const response = await getCardDetailById(cardId);
            
            if (response.isSuccess && response.result) {
                const newCardDetail = {
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
                };
                
                setCardDetail(newCardDetail);
            } else {
                setError(response.message || "독서 카드 상세 정보를 가져오는데 실패했습니다.");
            }
        } catch (err: any) {
            console.error('독서 카드 상세 정보를 불러오는 중 오류 발생:', err);
            setError(`독서 카드 상세 정보를 불러오는 데 실패했습니다: ${err.message}`);
        }
    }, []);

    const handleDownload = useCallback(async () => {
        if (!cardContentRef.current || isLoading || isProcessing) return;
        
        setIsProcessing(true);
        try {
            // 카드 미리보기 컨테이너만 캡처 (블러 배경 제외)
            const cardPreviewElement = cardContentRef.current.querySelector('.download-card-preview-container');
            if (!cardPreviewElement) {
                throw new Error('카드 미리보기 요소를 찾을 수 없습니다.');
            }

            // 블러 배경을 임시로 숨김
            const blurBackground = cardContentRef.current.querySelector('.download-card-blurred-background') as HTMLElement;
            const originalDisplay = blurBackground?.style.display;
            if (blurBackground) {
                blurBackground.style.display = 'none';
            }

            const canvas = await html2canvas(cardPreviewElement as HTMLElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                foreignObjectRendering: false,
                imageTimeout: 15000,
                logging: false,
                removeContainer: true,
            });

            // 블러 배경을 다시 표시
            if (blurBackground) {
                (blurBackground as HTMLElement).style.display = originalDisplay || '';
            }
            
            const dataUrl = canvas.toDataURL('image/png', 1.0);

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = getFileName('.png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            alert('독서카드가 다운로드되었습니다!');
        } catch (err: any) {
            console.error('독서카드 다운로드 실패:', err);
            const errorMessage = err.name === 'SecurityError' || err.message?.includes('CORS')
                ? '이미지 로드에 문제가 발생했습니다 (CORS 오류일 수 있습니다).'
                : err.message;
            alert(`독서카드 다운로드에 실패했습니다: ${errorMessage}`);
        } finally {
            setIsProcessing(false);
        }
    }, [cardDetail, isLoading, isProcessing, getFileName]);

    const handleShare = useCallback(async () => {
        if (!cardContentRef.current || isLoading || isProcessing) return;
        
        setIsProcessing(true);
        try {
            // 카드 미리보기 컨테이너만 캡처 (블러 배경 제외)
            const cardPreviewElement = cardContentRef.current.querySelector('.download-card-preview-container');
            if (!cardPreviewElement) {
                throw new Error('카드 미리보기 요소를 찾을 수 없습니다.');
            }

            // 블러 배경을 임시로 숨김
            const blurBackground = cardContentRef.current.querySelector('.download-card-blurred-background') as HTMLElement;
            const originalDisplay = blurBackground?.style.display;
            if (blurBackground) {
                blurBackground.style.display = 'none';
            }

            const canvas = await html2canvas(cardPreviewElement as HTMLElement, { 
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                foreignObjectRendering: false,
                imageTimeout: 15000,
                logging: false,
                removeContainer: true,
            });

            // 블러 배경을 다시 표시
            if (blurBackground) {
                blurBackground.style.display = originalDisplay || '';
            }
            
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    console.error('Blob 생성에 실패했습니다.');
                    alert('독서카드 공유에 실패했습니다.');
                    setIsProcessing(false);
                    return;
                }

                const file = new File([blob], getFileName('.png'), { type: 'image/png' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            title: `나의 독서카드: ${getBookTitle()}`,
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
    }, [cardDetail, isLoading, isProcessing, getFileName, getBookTitle]);

    useEffect(() => {
        const loadCardData = async () => {
            setIsLoading(true);
            setError(null);

            const state = location.state as LocationState;

            if (state?.cardDetail) {
                setCardDetail(state.cardDetail);
                setIsLoading(false);
            } else if (state?.cardId) {
                await handleCardDataLoad(state.cardId);
            } else {
                setError("다운로드할 독서 카드 정보가 제공되지 않았습니다. 이전 페이지에서 다시 시도해주세요.");
            }
            setIsLoading(false);
        };

        loadCardData();
    }, [location.state, handleCardDataLoad]);

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
            <div className="download-card-page-container no-data-state">
                독서 카드 정보를 찾을 수 없습니다.
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="download-header">
                <button className="header-left-arrow" onClick={() => navigate("/reading-card")}>
                    <MdArrowBackIosNew size={24} color="#333" />
                </button>
                <h3>독서카드 다운로드</h3>
                <div className="header-right-placeholder"></div>
            </header>

            <div className="download-card-content" ref={cardContentRef}>
                <svg width="0" height="0" style={{ position: 'absolute' }}>
                    <filter id="gaussian-blur">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
                    </filter>
                </svg>

                <div
                    className="download-card-blurred-background"
                    style={{ backgroundImage: `url('${getImageUrl()}')` }}
                />

                <div className="download-card-preview-container">
                    <div className="download-card-image-and-overlay-wrapper">
                        <img
                            src={getImageUrl()}
                            alt={`독서 카드: ${getBookTitle()}`}
                            className="download-card-main-image"
                            crossOrigin="anonymous"
                            onError={(e) => {
                                e.currentTarget.src = DEFAULT_IMAGE_URL;
                                e.currentTarget.alt = "이미지 로드 실패";
                            }}
                        />
                        <div className="download-card-image-overlay-text">
                            {cardDetail.content}
                        </div>
                    </div>

                    <div className="download-card-text-content">
                        <p className="download-card-book-title">
                            {cardDetail.book?.title || '책 정보 없음'}
                            {!cardDetail.book && <span className="no-book-info-message"> (책 정보 없음)</span>}
                        </p>
                        <p className="download-card-main-content">{cardDetail.content}</p>
                    </div>
                </div>
            </div>

            <div className="action-buttons-container-revised">
                <button 
                    className="action-button-revised download-button-revised" 
                    onClick={handleDownload} 
                    disabled={isProcessing || isLoading}
                >
                    <FiDownload size={24} />
                    <span>다운로드</span>
                </button>
                <button 
                    className="action-button-revised share-button-revised" 
                    onClick={handleShare} 
                    disabled={isProcessing || isLoading}
                >
                    <FiShare2 size={24} />
                    <span>공유하기</span>
                </button>
            </div>
        </div>
    );
}

export default DownloadCardPage;
