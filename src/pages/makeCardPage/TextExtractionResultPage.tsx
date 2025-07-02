import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TextExtractionResultPage.css';

const TextExtractionResultPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 이전 페이지에서 넘어온 image, extractedText, bookId를 받아옵니다.
    const image = location.state?.image as string | undefined;
    const extractedText = location.state?.extractedText as string | undefined;
    const bookId = location.state?.bookId as number | undefined; // ⭐️ bookId 추가

    const [editableText, setEditableText] = useState<string>(extractedText || '');

    useEffect(() => {
        // 이미지, 추출된 텍스트, bookId 중 하나라도 없으면 카드 생성 페이지로 돌려보냅니다.
        if (!image || !extractedText || bookId === undefined) { // ⭐️ bookId 검사 추가
            console.error('TextExtractionResultPage: 필수 데이터 (이미지, 텍스트 또는 책 ID) 누락, make-card로 리디렉션.');
            navigate('/make-card');
        }
    }, [image, extractedText, bookId, navigate]); // ⭐️ 의존성 배열에 bookId 추가

    const handleRetake = () => {
        navigate('/make-card'); // 재촬영 시에는 bookId를 다시 선택해야 할 수 있으므로, 초기 페이지로 이동
    };

    const handleNext = () => {
        // 다음 페이지로 이동할 때 image, editableText, 그리고 bookId도 함께 전달합니다.
        navigate('/customize-card', {
            state: {
                image,
                extractedText: editableText,
                bookId, // ⭐️ bookId 전달
            },
        });
    };

    // 이미지, 추출된 텍스트 또는 책 ID가 없을 경우 아무것도 렌더링하지 않습니다.
    // useEffect에서 이미 리디렉션 처리를 하므로, 이 부분은 빠르게 지나갈 것입니다.
    if (!image || !extractedText || bookId === undefined) {
        return null;
    }

    return (
        <div className="page-container">
            <div className="text-extraction-result-wrapper">
                <header className="result-header">
                    <h2>아래의 텍스트가 분석되었어요</h2>
                    <p>텍스트 박스를 선택해서 직접 수정이 가능해요</p>
                </header>
                <textarea
                    value={editableText}
                    onChange={(e) => setEditableText(e.target.value)}
                    className="extracted-textarea"
                />
                <div className="button-group">
                    <button onClick={handleRetake} className='reshoot-button'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
                            <path d="M18.864 18.364C18.0293 19.2011 17.0373 19.8649 15.9451 20.3172C14.853 20.7696 13.6821 21.0016 12.5 21C7.5295 21 3.5 16.9705 3.5 12C3.5 7.0295 7.5295 3 12.5 3C14.985 3 17.235 4.0075 18.864 5.636C19.693 6.465 21.5 8.5 21.5 8.5" stroke="#9BA2B1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M21.5 4V8.5H17" stroke="#9BA2B1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        재촬영
                    </button>

                    <button onClick={handleNext} className='next-button'>다음으로</button>
                </div>
            </div>
        </div>
    );
};

export default TextExtractionResultPage;