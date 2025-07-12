// src/pages/TextExtractionLoadingPage.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { extractTextFromImage } from '../../api/imageApi';

import './TextExtractionLoadingPage.css'; // 스타일 파일을 가져옵니다.

const TextExtractionLoadingPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const image = location.state?.image as string | undefined;
    const bookId = location.state?.bookId as number | undefined;

    const [isLoadingText, setIsLoadingText] = useState(true);
    const [ocrError, setOcrError] = useState<string | null>(null);

    useEffect(() => {
        const performOcrAndNavigate = async () => {
            if (!image) {
                console.error('TextExtractionLoadingPage: 필수 데이터 (이미지 URL) 누락, make-card로 리디렉션.');
                // Add alert for missing initial image data
                alert('이미지 데이터를 불러올 수 없습니다. 카드 생성 페이지로 돌아갑니다.');
                navigate('/make-card');
                return;
            }

            setIsLoadingText(true);
            setOcrError(null);

            try {
                const response = await extractTextFromImage(image);

                if (response.isSuccess) {
                    const extractedText = response.result;

                    // --- MODIFICATION START ---
                    // Check if extractedText is empty or contains only whitespace
                    if (!extractedText || extractedText.trim().length === 0) {
                        alert('이미지에서 텍스트가 감지되지 않았습니다. 다른 이미지를 시도하거나 직접 입력해 주세요.');
                        navigate('/make-card'); // Go back to the card creation page
                        return; // Stop further execution
                    }
                    // --- MODIFICATION END ---

                    navigate('/text-extraction-result', {
                        state: {
                            image,
                            extractedText,
                            bookId,
                        },
                    });
                } else {
                    setOcrError(response.message || '텍스트 추출에 실패했습니다.');
                    console.error('OCR API 실패:', response.message);
                    // Add alert for API failure
                    alert(`텍스트 추출에 실패했습니다: ${response.message || '알 수 없는 오류'}. 다시 시도해 주세요.`);
                    navigate('/make-card'); // Go back on API failure
                }
            } catch (err: any) {
                console.error('OCR 처리 중 오류 발생:', err);
                const errorMessage = `텍스트 추출 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}.`;
                setOcrError(errorMessage);
                // Add alert for general error
                alert(errorMessage + ' 카드 생성 페이지로 돌아갑니다.');
                navigate('/make-card'); // Go back on general error
            } finally {
                setIsLoadingText(false);
            }
        };

        performOcrAndNavigate();
    }, [navigate, image, bookId]); // Added bookId to dependencies for completeness

    return (
        <div className="page-container">
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
                            <h3>분석 완료!</h3> // 분석이 완료되었으나 navigate가 아직 되지 않은 짧은 순간
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
                            <p style={{ color: 'red', textAlign: 'center' }}>{ocrError}</p>
                        ) : (
                            <p>앱 사용에 대한 간단한 설명</p> // 로딩 중 표시될 설명
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextExtractionLoadingPage;