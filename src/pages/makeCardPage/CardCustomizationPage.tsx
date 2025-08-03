import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CardCustomizationPage.css';

import PicFillIconSVG from '../../icons/pic_fill.svg?react';
import FontSizeFillIconSVG from '../../icons/font_size_fill.svg?react';
import BookOpenIconSVG from '../../icons/book-open.svg?react';
import CheckFillIconSVG from '../../icons/check_fill.svg?react';

import SkyBackground from '../../assets/images/cardSample/sky.jpg';
import SummerSeaBackground from '../../assets/images/cardSample/sea.jpg';
import RiverBackground from '../../assets/images/cardSample/river.jpg';
import ForsetBackground from '../../assets/images/cardSample/forest.jpg';
import ColorBackground from '../../assets/images/cardSample/color.jpg';

const CardCustomizationPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [selectedBookId] = useState<number | undefined>(
        location.state?.selectedBookId as number | undefined
    );
    const [selectedBookTitle] = useState<string | undefined>(
        location.state?.selectedBookTitle as string | undefined
    );

    const image = location.state?.image as string | undefined;
    const extractedText = location.state?.extractedText as string | undefined;

    const [selectedTab, setSelectedTab] = useState<'image' | 'text' | 'book'>('image');
    const [isBlocked, setIsBlocked] = useState(false);

    const defaultBackgrounds: { label: string; url: string }[] = [
        { label: '하늘', url: SkyBackground },
        { label: '여름바다', url: SummerSeaBackground },
        { label: '강가', url: RiverBackground },
        { label: '숲속', url: ForsetBackground },
        { label: '색깔', url: ColorBackground },
    ];

    const availableFonts: { label: string; value: string }[] = [
        { label: '기본체', value: 'inherit' },
        { label: '나눔펜', value: '"Nanum Pen", cursive' },
        { label: '노토산스', value: '"Noto Sans KR", sans-serif' },
    ];

    const [selectedBackground, setSelectedBackground] = useState<'uploaded' | string>('uploaded');
    const [selectedFont, setSelectedFont] = useState<string>('inherit');

    const getBackgroundImage = () => {
        if (selectedBackground === 'uploaded') return image;
        const found = defaultBackgrounds.find((bg) => bg.label === selectedBackground);
        return found?.url || image;
    };

    useEffect(() => {
        if ((!image || !extractedText) && !isBlocked) {
            alert('필수 데이터 (이미지, 텍스트)가 누락되었습니다. 카드 생성 페이지로 이동합니다.');
            setIsBlocked(true);
            navigate('/make-card', { replace: true });
        }
    }, [image, extractedText, navigate, isBlocked]);

    if (isBlocked) {
        return null;
    }

    useEffect(() => {
        if (selectedBookId !== undefined) {
            setSelectedTab('book');
        }
    }, [selectedBookId]);

    if (!image && !isBlocked) {
        return (
            <div className="page-container">
                <p>필수 정보를 불러오는 중입니다...</p>
            </div>
        );
    }

    const handleSave = () => {
        if (!image || !extractedText || !selectedFont || !selectedBookId) {
            alert('이미지와 텍스트, 책 정보는 필수로 포함되어야 합니다. 저장할 수 없습니다.');
            return;
        }

        navigate('/card-complete', {
            state: {
                image: getBackgroundImage(),
                extractedText,
                font: selectedFont,
                bookId: selectedBookId,
            },
        });
    };

    return (
        <div className="page-container">
            <div className="card-customization-wrapper">
                <header className="customization-header">
                    <button className="customization-cancel-btn" onClick={() => navigate('/make-card')}>취소</button>
                    <span className="spacer" />
                    <button className="save-btn" onClick={handleSave}>
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
                                    style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover' }}
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
                                        style={{ backgroundImage: `url(${bg.url})`, backgroundSize: 'cover' }}
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
                                        style={{ fontFamily: font.value, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2em' }}
                                    >
                                        {selectedFont === font.value && (
                                            <CheckFillIconSVG className="check-icon" />
                                        )}
                                        <span style={{ color: 'black', textShadow: '0 0 2px white' }}>가</span>
                                    </div>
                                    <div className="option-label">{font.label}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedTab === 'book' && (
                        <div className="book-selection-area">
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
                                onClick={() => navigate('/card-book-search', {
                                    state: {
                                        image: image,
                                        extractedText: extractedText,
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
