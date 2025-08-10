import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdArrowBackIosNew } from 'react-icons/md';
import { extractTextFromImage } from '../../api/imageApi';
import Toast from '../../components/Toast';

import './TextExtractionLoadingPage.css';

const TextExtractionLoadingPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const image = location.state?.image as string | undefined;
    const bookId = location.state?.bookId as number | undefined;

    const [isLoadingText, setIsLoadingText] = useState(true);
    const [ocrError, setOcrError] = useState<string | null>(null);
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        isVisible: boolean;
    }>({
        message: '',
        type: 'info',
        isVisible: false
    });

    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setToast({ message, type, isVisible: true });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    useEffect(() => {
        const performOcrAndNavigate = async () => {
            if (!image) {
                console.error('TextExtractionLoadingPage: 필수 데이터 (이미지 URL) 누락, make-card로 리디렉션.');
                showToast('이미지 데이터를 불러올 수 없습니다. 카드 생성 페이지로 돌아갑니다.', 'error');
                navigate('/make-card', { replace: true });
                return;
            }

            // 중복 처리 방지를 위한 세션스토리지 체크
            const processingKey = `ocr_processing_${image}`;
            const isProcessing = sessionStorage.getItem(processingKey);
            
            if (isProcessing) {
                // 이미 처리 중이거나 완료된 경우
                const result = sessionStorage.getItem(`ocr_result_${image}`);
                if (result) {
                    const parsedResult = JSON.parse(result);
                    if (parsedResult.success) {
                        navigate('/text-extraction-result', {
                            state: {
                                image,
                                extractedText: parsedResult.text,
                                bookId,
                            },
                            replace: true
                        });
                    } else {
                        setOcrError(parsedResult.error);
                        setIsLoadingText(false);
                    }
                }
                return;
            }

            // 처리 시작 표시
            sessionStorage.setItem(processingKey, 'true');

            setIsLoadingText(true);
            setOcrError(null);

            try {
                const response = await extractTextFromImage(image);

                if (response.isSuccess) {
                    const extractedText = response.result;

                    if (!extractedText || extractedText.trim().length === 0) {
                        showToast('이미지에서 텍스트가 감지되지 않았습니다. 다른 이미지를 시도하거나 직접 입력해 주세요.', 'warning');
                        sessionStorage.removeItem(processingKey);
                        navigate('/make-card', { replace: true });
                        return;
                    }

                    // 결과를 세션스토리지에 저장
                    sessionStorage.setItem(`ocr_result_${image}`, JSON.stringify({
                        success: true,
                        text: extractedText
                    }));

                    navigate('/text-extraction-result', {
                        state: {
                            image,
                            extractedText,
                            bookId,
                        },
                        replace: true // 히스토리에서 현재 페이지를 교체
                    });
                } else {
                    const errorMessage = response.message || '텍스트 추출에 실패했습니다.';
                    setOcrError(errorMessage);
                    console.error('OCR API 실패:', response.message);
                    
                    // 에러 결과를 세션스토리지에 저장
                    sessionStorage.setItem(`ocr_result_${image}`, JSON.stringify({
                        success: false,
                        error: errorMessage
                    }));
                    
                    // alert 제거 - UI에서 에러 메시지 표시
                    // navigate('/make-card', { replace: true }); // 자동 리디렉션 제거
                }
            } catch (err: any) {
                console.error('OCR 처리 중 오류 발생:', err);
                const errorMessage = `텍스트 추출 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}.`;
                setOcrError(errorMessage);
                
                // 에러 결과를 세션스토리지에 저장
                sessionStorage.setItem(`ocr_result_${image}`, JSON.stringify({
                    success: false,
                    error: errorMessage
                }));
                
                // alert 제거 - UI에서 에러 메시지 표시
                // navigate('/make-card', { replace: true }); // 자동 리디렉션 제거
            } finally {
                setIsLoadingText(false);
                // 처리 완료 표시 제거
                sessionStorage.removeItem(processingKey);
            }
        };

        performOcrAndNavigate();
    }, [navigate, image, bookId]);

    // 컴포넌트 언마운트 시 세션스토리지 정리
    useEffect(() => {
        return () => {
            if (image) {
                const processingKey = `ocr_processing_${image}`;
                sessionStorage.removeItem(processingKey);
            }
        };
    }, [image]);

    return (
        <div className="page-container">
            <header className="detail-header">
                <button className="header-left-arrow" onClick={() => navigate('/make-card')}>
                    <MdArrowBackIosNew size={24} color="#333" />
                </button>
                <h3>텍스트 분석</h3>
                <div className="dummy-box"></div>
            </header>

            <div className="header-margin"></div>

            <div className="text-extraction-wrapper">
                <div className="text-extraction-loading-page">
                    <header className="loading-header">
                        {isLoadingText ? (
                            <>
                                <h3>텍스트를 분석중이에요</h3>
                                <p>결과가 나올때까지 조금만 기다려주세요!</p>
                            </>
                        ) : ocrError ? (
                            <h3 style={{ color: 'red' }}>오류 발생!</h3>
                        ) : (
                            <h3>분석 완료!</h3>
                        )}
                    </header>

                    <div className="loading-content">
                        {image && (
                            <img
                                src={image}
                                alt="업로드된 이미지"
                                style={{ marginTop: '20px', maxWidth: '80%', borderRadius: '8px' }}
                            />
                        )}
                        {ocrError ? (
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: 'red', marginBottom: '20px' }}>{ocrError}</p>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    <button 
                                        onClick={() => navigate('/make-card')}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: '#f0f0f0',
                                            border: '1px solid #ccc',
                                            borderRadius: '5px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        홈으로 돌아가기
                                    </button>
                                    <button 
                                        onClick={() => window.location.reload()}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        다시 시도
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p>앱 사용에 대한 간단한 설명</p>
                        )}
                    </div>
                </div>
            </div>
            <Toast 
                message={toast.message} 
                type={toast.type} 
                isVisible={toast.isVisible} 
                onClose={hideToast} 
            />
        </div>
    );
};

export default TextExtractionLoadingPage;