// src/pages/makeCardPage/CardCustomizationPage.tsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CardCustomizationPage.css';

const CardCustomizationPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const image = location.state?.image as string | undefined;
    const extractedText = location.state?.extractedText as string | undefined;

    const [selectedTab, setSelectedTab] = useState<'image' | 'text'>('image');

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

    if (!image || !extractedText) {
        navigate('/card-complete', {
            state: {
                image: getBackgroundImage(),
                extractedText,
            },
        });
    }

    return (
        <div className="page-container">
            <header className="customization-header">
                <button className="cancel-btn" onClick={() => navigate('/make-card')}>취소</button>
                <span className="spacer" />
                <button
                    className="save-btn"
                    onClick={() =>
                        navigate('/card-complete', {
                            state: {
                                image: getBackgroundImage(),
                                extractedText,
                                font: selectedFont,
                            },
                        })
                    }
                >
                    저장
                </button>
            </header>

            <div
                className="card-preview"
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
                {selectedTab === 'image' ? (
                    <div className="option-icons">
                        <div
                            className={`option ${selectedBackground === 'uploaded' ? 'active' : ''}`}
                            onClick={() => setSelectedBackground('uploaded')}
                        >
                            촬영 사진
                        </div>
                        {defaultBackgrounds.map((bg) => (
                            <div
                                key={bg.label}
                                className={`option ${selectedBackground === bg.label ? 'active' : ''}`}
                                onClick={() => setSelectedBackground(bg.label)}
                            >
                                {bg.label}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="option-icons">{/* 추후 글자 스타일 옵션 */}</div>
                )}
                {selectedTab === 'text' ? (
                    <div className="option-icons">
                        {availableFonts.map((font) => (
                            <div
                                key={font.label}
                                className={`option ${selectedFont === font.value ? 'active' : ''}`}
                                onClick={() => setSelectedFont(font.value)}
                                style={{ fontFamily: font.value }}
                            >
                                {font.label}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="option-icons">
                        {/* 배경 탭 */}
                        <div
                            className={`option ${selectedBackground === 'uploaded' ? 'active' : ''}`}
                            onClick={() => setSelectedBackground('uploaded')}
                        >
                            촬영 사진
                        </div>
                        {defaultBackgrounds.map((bg) => (
                            <div
                                key={bg.label}
                                className={`option ${selectedBackground === bg.label ? 'active' : ''}`}
                                onClick={() => setSelectedBackground(bg.label)}
                            >
                                {bg.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="tab-buttons">
                <button
                    className={selectedTab === 'image' ? 'tab selected' : 'tab'}
                    onClick={() => setSelectedTab('image')}
                >
                    배경
                </button>
                <button
                    className={selectedTab === 'text' ? 'tab selected' : 'tab'}
                    onClick={() => setSelectedTab('text')}
                >
                    글자
                </button>
            </div>
        </div>
    );
};

export default CardCustomizationPage;
