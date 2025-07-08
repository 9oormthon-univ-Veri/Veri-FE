// src/pages/TextExtractionLoadingPage.tsx
import React, { useEffect, useState } from 'react'; // useState를 추가합니다.
import { useLocation, useNavigate } from 'react-router-dom';
// ✨ OCR API 함수를 가져옵니다.
import { extractTextFromImage } from '../../api/imageApi';

import './TextExtractionLoadingPage.css'; // 스타일 파일을 가져옵니다.

const TextExtractionLoadingPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 이전 페이지에서 넘어온 image (업로드된 이미지의 Public URL)와 bookId를 받아옵니다.
    const image = location.state?.image as string | undefined; // 이 image는 이제 public URL입니다.
    const bookId = location.state?.bookId as number | undefined;

    // 로딩 및 에러 상태를 관리합니다.
    const [isLoadingText, setIsLoadingText] = useState(true);
    const [ocrError, setOcrError] = useState<string | null>(null);

    useEffect(() => {
        const performOcrAndNavigate = async () => {
            // 이미지 URL이나 bookId가 없으면 카드 생성 페이지로 돌려보냅니다.
            if (!image) {
                console.error('TextExtractionLoadingPage: 필수 데이터 (이미지 URL 또는 책 ID) 누락, make-card로 리디렉션.');
                navigate('/make-card');
                return;
            }

            setIsLoadingText(true); // 텍스트 분석 시작
            setOcrError(null);     // 이전 에러 초기화

            try {
                // ✨ OCR API 호출
                const response = await extractTextFromImage(image);

                if (response.isSuccess) {
                    const extractedText = response.result;

                    // 다음 페이지로 이동할 때 image, extractedText, bookId를 함께 전달합니다.
                    navigate('/text-extraction-result', {
                        state: {
                            image,
                            extractedText,
                            bookId,
                        },
                    });
                } else {
                    // API 호출은 성공했으나 isSuccess가 false인 경우
                    setOcrError(response.message || '텍스트 추출에 실패했습니다.');
                    console.error('OCR API 실패:', response.message);
                }
            } catch (err: any) {
                // 네트워크 오류 또는 예상치 못한 오류 발생 시
                console.error('OCR 처리 중 오류 발생:', err);
                setOcrError(`텍스트 추출 중 오류가 발생했습니다: ${err.message}`);
            } finally {
                setIsLoadingText(false); // 텍스트 분석 완료 (성공 또는 실패)
            }
        };

        performOcrAndNavigate();
    }, [navigate, image]); // 의존성 배열에 image와 bookId 추가

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