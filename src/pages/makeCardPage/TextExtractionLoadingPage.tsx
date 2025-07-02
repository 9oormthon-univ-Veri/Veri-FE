import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// 👇 모의 데이터 가져오기
import { mockExtractedTextResponse } from '../../api/mockData';

import './TextExtractionLoadingPage.css'; // 스타일 파일을 가져옵니다.

const TextExtractionLoadingPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // 이전 페이지에서 넘어온 image와 bookId를 받아옵니다.
    const image = location.state?.image as string | undefined;
    const bookId = location.state?.bookId as number | undefined; // ⭐️ bookId 추가

    useEffect(() => {
        // 이미지나 bookId가 없으면 카드 생성 페이지로 돌려보냅니다.
        if (!image || bookId === undefined) { // ⭐️ bookId 검사 추가
            console.error('TextExtractionLoadingPage: 필수 데이터 (이미지 또는 책 ID) 누락, make-card로 리디렉션.');
            navigate('/make-card');
            return;
        }

        const timer = setTimeout(() => {
            // ✅ mock 데이터를 사용해 이동
            const extractedText = mockExtractedTextResponse.result.extractedString;

            // 다음 페이지로 이동할 때 image와 extractedText, 그리고 bookId도 함께 전달합니다.
            navigate('/text-extraction-result', {
                state: {
                    image,
                    extractedText,
                    bookId, // ⭐️ bookId 전달
                },
            });
        }, 1500); // 사용자에게 피드백을 주기 위한 대기 시간

        return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
    }, [navigate, image, bookId]); // ⭐️ 의존성 배열에 bookId 추가

    return (
        <div className="page-container">
            <div className="text-extraction-wrapper">
                <div className="text-extraction-loading-page">
                    <header className="loading-header">
                        <h3>텍스트를 분석중이에요</h3>
                        <p>결과가 나올때까지 조금만 기다려주세요!</p>
                    </header>

                    <div className="loading-content">
                        {image && (
                            <img
                                src={image}
                                alt="업로드된 이미지"
                                style={{ marginTop: '20px', maxWidth: '80%', borderRadius: '8px' }}
                            />
                        )}
                        <p>앱 사용에 대한 간단한 설명</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextExtractionLoadingPage;