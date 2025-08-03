import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TextExtractionResultPage.css';

const TextExtractionResultPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const image = location.state?.image as string | undefined;
    const extractedText = location.state?.extractedText as string | undefined;

    const [editableText, setEditableText] = useState<string>(extractedText || '');

    const handleRetake = () => {
        navigate('/make-card');
    };

    const handleNext = () => {
        navigate('/customize-card', {
            state: {
                image,
                extractedText: editableText,
            },
        });
    };

    if (!image || !extractedText) {
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