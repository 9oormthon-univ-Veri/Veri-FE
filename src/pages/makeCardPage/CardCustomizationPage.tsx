import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CardCustomizationPage.css';

// Import SVG icons as React components
// Ensure these paths are correct relative to your project structure
import PicFillIconSVG from '../../icons/pic_fill.svg?react';
import FontSizeFillIconSVG from '../../icons/font_size_fill.svg?react';
import BookOpenIconSVG from '../../icons/book-open.svg?react';
import CheckFillIconSVG from '../../icons/check_fill.svg?react'; 

const CardCustomizationPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // CardCustomizationPage로 돌아왔을 때, 선택된 책 정보를 받기 위한 state
    const [selectedBookId] = useState<number | undefined>(
        location.state?.selectedBookId as number | undefined
    );
    const [selectedBookTitle] = useState<string | undefined>(
        location.state?.selectedBookTitle as string | undefined
    );

    // Ensure 'image' and 'extractedText' are correctly retrieved from location.state
    // These should be passed from the page preceding CardCustomizationPage (e.g., MakeCardPage)
    const image = location.state?.image as string | undefined;
    const extractedText = location.state?.extractedText as string | undefined;

    const [selectedTab, setSelectedTab] = useState<'image' | 'text' | 'book'>('image');

    const defaultBackgrounds: { label: string; url: string }[] = [
        { label: '하늘', url: 'https://picsum.photos/id/1015/400/600' },
        { label: '여름바다', url: 'https://picsum.photos/id/1011/400/600' },
        { label: '강가', url: 'https://picsum.photos/id/1003/400/600' },
    ];

    const availableFonts: { label: string; value: string }[] = [
        { label: '기본체', value: 'inherit' },
        { label: '나눔고딕', value: '"Nanum Gothic", sans-serif' },
        { label: '나눔손글씨 붓', value: '"Nanum Brush Script", cursive' },
        { label: '나눔펜', value: '"Nanum Pen Script", cursive' },
    ];

    const [selectedBackground, setSelectedBackground] = useState<'uploaded' | string>('uploaded');
    const [selectedFont, setSelectedFont] = useState<string>('inherit');

    const getBackgroundImage = () => {
        if (selectedBackground === 'uploaded') return image;
        const found = defaultBackgrounds.find((bg) => bg.label === selectedBackground);
        return found?.url || image;
    };

    useEffect(() => {
        // This useEffect checks if initial 'image' or 'extractedText' are missing
        // It might redirect if CardCustomizationPage is accessed directly without these.
        if (!image || !extractedText) {
            console.error('CardCustomizationPage: 필수 데이터 (이미지, 텍스트)가 누락되었습니다. 카드 생성 페이지로 리디렉션합니다.');
            navigate('/make-card', { replace: true });
        }
    }, [image, extractedText, navigate]);

    // CardBookSearchPage에서 책 선택 후 돌아왔을 때,
    // selectedTab을 'book'으로 유지하도록 설정 (선택 사항)
    useEffect(() => {
        if (selectedBookId !== undefined) {
            setSelectedTab('book');
        }
    }, [selectedBookId]);


    if (!image) {
        // Render a loading state or redirect if 'image' is not yet available
        // This can happen if the page is directly accessed or data is not fully loaded.
        return (
            <div className="page-container">
                <p>필수 정보를 불러오는 중입니다...</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="card-customization-wrapper">
                <header className="customization-header">
                    <button className="customization-cancel-btn" onClick={() => navigate('/make-card')}>취소</button>
                    <span className="spacer" />
                    <button
                        className="save-btn"
                        onClick={() =>
                            navigate('/card-complete', {
                                state: {
                                    image: getBackgroundImage(),
                                    extractedText,
                                    font: selectedFont,
                                    bookId: selectedBookId, // 선택된 책 ID 전달
                                },
                            })
                        }
                    >
                        저장
                    </button>
                </header>

                <div
                    className="custom-card-preview"
                    style={{ backgroundImage: `url(${getBackgroundImage()})` }}
                >
                    <div
                        className="overlay-text"
                        style={{ fontFamily: selectedFont }}
                    >
                        {extractedText}
                    </div>
                </div>

                <div className="option-panel">
                    {selectedTab === 'image' && (
                        <div className="option-icons">
                            <div>
                                <div
                                    className={`option ${selectedBackground === 'uploaded' ? 'active' : ''}`}
                                    onClick={() => setSelectedBackground('uploaded')}
                                >
                                    {selectedBackground === 'uploaded' && (
                                        <CheckFillIconSVG className="check-icon" />
                                    )}
                                </div>
                                <div className="option-label">촬영 사진</div>
                            </div>

                            {defaultBackgrounds.map((bg) => (
                                <div key={bg.label}>
                                    <div
                                        className={`option ${selectedBackground === bg.label ? 'active' : ''}`}
                                        onClick={() => setSelectedBackground(bg.label)}
                                    >
                                        {selectedBackground === bg.label && (
                                            <CheckFillIconSVG className="check-icon" />
                                        )}
                                    </div>
                                    <div className="option-label">{bg.label}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedTab === 'text' && (
                        <div className="option-icons">
                            {availableFonts.map((font) => (
                                <div key={font.label}>
                                    <div
                                        className={`option ${selectedFont === font.value ? 'active' : ''}`}
                                        onClick={() => setSelectedFont(font.value)}
                                        style={{ fontFamily: font.value }}
                                    >
                                        {selectedFont === font.value && (
                                            <CheckFillIconSVG className="check-icon" />
                                        )}
                                    </div>
                                    <div className="option-label">{font.label}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedTab === 'book' && (
                        <div className="option-icons book-selection-area">
                            {selectedBookId ? (
                                <p className="selected-book-info">
                                    선택된 책: <strong>{selectedBookTitle}</strong>
                                </p>
                            ) : (
                                <p className="no-book-selected">
                                    카드를 연결할 책을 찾아주세요.
                                </p>
                            )}
                            <button
                                className="search-book-button"
                                // MODIFIED: Pass image and extractedText to CardBookSearchPage
                                onClick={() => navigate('/card-book-search', {
                                    state: {
                                        image: image, // Pass the original image
                                        extractedText: extractedText, // Pass the original extracted text
                                    }
                                })}
                            >
                                책 찾아보기
                            </button>
                        </div>
                    )}
                </div>

                <div className="tab-buttons">
                    <button
                        className={selectedTab === 'image' ? 'tab-selected' : 'tab'}
                        onClick={() => setSelectedTab('image')}
                    >
                        <div className="tab-icon">
                            <PicFillIconSVG className={`tab-icon-svg ${selectedTab === 'image' ? 'active' : ''}`} />
                        </div>
                        <div className="tab-label">배경</div>
                    </button>
                    <button
                        className={selectedTab === 'text' ? 'tab-selected' : 'tab'}
                        onClick={() => setSelectedTab('text')}
                    >
                        <div className="tab-icon">
                            <FontSizeFillIconSVG className={`tab-icon-svg ${selectedTab === 'text' ? 'active' : ''}`} />
                        </div>
                        <div className="tab-label">글자</div>
                    </button>
                    <button
                        className={selectedTab === 'book' ? 'tab-selected' : 'tab'}
                        onClick={() => setSelectedTab('book')}
                    >
                        <div className="tab-icon">
                            <BookOpenIconSVG className={`tab-icon-svg ${selectedTab === 'book' ? 'active' : ''}`} />
                        </div>
                        <div className="tab-label">책 찾기</div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CardCustomizationPage;