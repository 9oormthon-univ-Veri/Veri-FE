// src/pages/makeCardPage/CardCustomizationPage.tsx

import React, { useState, useEffect } from 'react'; // useEffect를 import 합니다.
import { useLocation, useNavigate } from 'react-router-dom';
import './CardCustomizationPage.css';

const CardCustomizationPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const image = location.state?.image as string | undefined;
    const extractedText = location.state?.extractedText as string | undefined;
    const bookId = location.state?.bookId as number | undefined;

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
        return found?.url || image; // 기본 이미지 없으면 촬영 사진
    };

    // ✨ 수정된 부분: useEffect를 사용하여 초기 데이터 확인 및 리디렉션
    useEffect(() => {
        if (!image || !extractedText || bookId === undefined) {
            console.error('CardCustomizationPage: 필수 데이터 (이미지, 텍스트 또는 책 ID)가 누락되었습니다. 카드 생성 페이지로 리디렉션합니다.');
            // 리디렉션 시 `replace: true`를 사용하여 뒤로 가기 버튼으로 다시 이 페이지로 돌아오지 않게 합니다.
            navigate('/make-card', { replace: true });
        }
    }, [image, extractedText, bookId, navigate]); // 의존성 배열에 필요한 모든 변수 포함

    // 필수 데이터가 없을 경우 렌더링을 일시 중단하거나 로딩 스피너를 보여줄 수 있습니다.
    // useEffect에서 리디렉션을 처리하므로, 여기서는 간단히 로딩 메시지를 보여줍니다.
    if (!image || !extractedText || bookId === undefined) {
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
                                    bookId, // bookId도 정확히 전달합니다.
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
                                        <svg // SVG 코드는 그대로 유지
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            className="check-icon"
                                        >
                                            <g clipPath="url(#clip0_482_8205)">
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M21.546 5.11107C21.8272 5.39236 21.9852 5.77382 21.9852 6.17157C21.9852 6.56931 21.8272 6.95077 21.546 7.23207L10.303 18.4751C10.1544 18.6237 9.97805 18.7416 9.7839 18.822C9.58976 18.9024 9.38167 18.9438 9.17153 18.9438C8.96138 18.9438 8.75329 18.9024 8.55915 18.822C8.365 18.7416 8.1886 18.6237 8.04003 18.4751L2.45403 12.8901C2.31076 12.7517 2.19649 12.5862 2.11787 12.4032C2.03926 12.2202 1.99788 12.0233 1.99615 11.8242C1.99442 11.625 2.03237 11.4275 2.10779 11.2431C2.18322 11.0588 2.29459 10.8913 2.43543 10.7505C2.57627 10.6096 2.74375 10.4983 2.92809 10.4228C3.11244 10.3474 3.30996 10.3095 3.50913 10.3112C3.7083 10.3129 3.90513 10.3543 4.08813 10.4329C4.27114 10.5115 4.43666 10.6258 4.57503 10.7691L9.17103 15.3651L19.424 5.11107C19.5633 4.97168 19.7287 4.8611 19.9108 4.78566C20.0928 4.71022 20.288 4.67139 20.485 4.67139C20.6821 4.67139 20.8772 4.71022 21.0593 4.78566C21.2413 4.8611 21.4067 4.97168 21.546 5.11107Z"
                                                    fill="#0CE19A"
                                                />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_482_8205">
                                                    <rect width="24" height="24" fill="white" />
                                                </clipPath>
                                            </defs>
                                        </svg>
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
                                            <svg // SVG 코드는 그대로 유지
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className="check-icon"
                                            >
                                                <g clipPath="url(#clip0_482_8205)">
                                                    <path
                                                        fillRule="evenodd"
                                                        clipRule="evenodd"
                                                        d="M21.546 5.11107C21.8272 5.39236 21.9852 5.77382 21.9852 6.17157C21.9852 6.56931 21.8272 6.95077 21.546 7.23207L10.303 18.4751C10.1544 18.6237 9.97805 18.7416 9.7839 18.822C9.58976 18.9024 9.38167 18.9438 9.17153 18.9438C8.96138 18.9438 8.75329 18.9024 8.55915 18.822C8.365 18.7416 8.1886 18.6237 8.04003 18.4751L2.45403 12.8901C2.31076 12.7517 2.19649 12.5862 2.11787 12.4032C2.03926 12.2202 1.99788 12.0233 1.99615 11.8242C1.99442 11.625 2.03237 11.4275 2.10779 11.2431C2.18322 11.0588 2.29459 10.8913 2.43543 10.7505C2.57627 10.6096 2.74375 10.4983 2.92809 10.4228C3.11244 10.3474 3.30996 10.3095 3.50913 10.3112C3.7083 10.3129 3.90513 10.3543 4.08813 10.4329C4.27114 10.5115 4.43666 10.6258 4.57503 10.7691L9.17103 15.3651L19.424 5.11107C19.5633 4.97168 19.7287 4.8611 19.9108 4.78566C20.0928 4.71022 20.288 4.67139 20.485 4.67139C20.6821 4.67139 20.8772 4.71022 21.0593 4.78566C21.2413 4.8611 21.4067 4.97168 21.546 5.11107Z"
                                                        fill="#0CE19A"
                                                    />
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_482_8205">
                                                        <rect width="24" height="24" fill="white" />
                                                    </clipPath>
                                                </defs>
                                            </svg>
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
                                            <svg // SVG 코드는 그대로 유지
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className="check-icon"
                                            >
                                                <g clipPath="url(#clip0_482_8205)">
                                                    <path
                                                        fillRule="evenodd"
                                                        clipRule="evenodd"
                                                        d="M21.546 5.11107C21.8272 5.39236 21.9852 5.77382 21.9852 6.17157C21.9852 6.56931 21.8272 6.95077 21.546 7.23207L10.303 18.4751C10.1544 18.6237 9.97805 18.7416 9.7839 18.822C9.58976 18.9024 9.38167 18.9438 9.17153 18.9438C8.96138 18.9438 8.75329 18.9024 8.55915 18.822C8.365 18.7416 8.1886 18.6237 8.04003 18.4751L2.45403 12.8901C2.31076 12.7517 2.19649 12.5862 2.11787 12.4032C2.03926 12.2202 1.99788 12.0233 1.99615 11.8242C1.99442 11.625 2.03237 11.4275 2.10779 11.2431C2.18322 11.0588 2.29459 10.8913 2.43543 10.7505C2.57627 10.6096 2.74375 10.4983 2.92809 10.4228C3.11244 10.3474 3.30996 10.3095 3.50913 10.3112C3.7083 10.3129 3.90513 10.3543 4.08813 10.4329C4.27114 10.5115 4.43666 10.6258 4.57503 10.7691L9.17103 15.3651L19.424 5.11107C19.5633 4.97168 19.7287 4.8611 19.9108 4.78566C20.0928 4.71022 20.288 4.67139 20.485 4.67139C20.6821 4.67139 20.8772 4.71022 21.0593 4.78566C21.2413 4.8611 21.4067 4.97168 21.546 5.11107Z"
                                                        fill="#0CE19A"
                                                    />
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_482_8205">
                                                        <rect width="24" height="24" fill="white" />
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        )}
                                    </div>
                                    <div className="option-label">{font.label}</div>
                                </div>
                            ))}
                        </div>

                    )}
                </div>


                <div className="tab-buttons">
                    <button
                        className={selectedTab === 'image' ? 'tab-selected' : 'tab'}
                        onClick={() => setSelectedTab('image')}
                    >
                        <div className="tab-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none" className={`tab-icon-svg ${selectedTab === 'image' ? 'active' : ''}`}>
                                <g clip-path="url(#clip0_482_8191)">
                                    <path d="M25.0002 3.75C25.6633 3.75 26.2992 4.01339 26.768 4.48223C27.2369 4.95107 27.5002 5.58696 27.5002 6.25V23.75C27.5002 24.413 27.2369 25.0489 26.768 25.5178C26.2992 25.9866 25.6633 26.25 25.0002 26.25H5.00024C4.3372 26.25 3.70132 25.9866 3.23248 25.5178C2.76364 25.0489 2.50024 24.413 2.50024 23.75V6.25C2.50024 5.58696 2.76364 4.95107 3.23248 4.48223C3.70132 4.01339 4.3372 3.75 5.00024 3.75H25.0002ZM25.0002 6.25H5.00024V18.875L11.244 12.6325C11.3891 12.4874 11.5614 12.3722 11.751 12.2937C11.9406 12.2151 12.1438 12.1747 12.349 12.1747C12.5542 12.1747 12.7574 12.2151 12.947 12.2937C13.1366 12.3722 13.3089 12.4874 13.454 12.6325L18.5352 17.715L20.0827 16.1675C20.2278 16.0224 20.4001 15.9072 20.5897 15.8287C20.7793 15.7501 20.9825 15.7097 21.1877 15.7097C21.393 15.7097 21.5962 15.7501 21.7858 15.8287C21.9754 15.9072 22.1476 16.0224 22.2927 16.1675L25.0002 18.8763V6.25ZM19.3752 8.75C19.8725 8.75 20.3494 8.94754 20.7011 9.29918C21.0527 9.65081 21.2502 10.1277 21.2502 10.625C21.2502 11.1223 21.0527 11.5992 20.7011 11.9508C20.3494 12.3025 19.8725 12.5 19.3752 12.5C18.878 12.5 18.401 12.3025 18.0494 11.9508C17.6978 11.5992 17.5002 11.1223 17.5002 10.625C17.5002 10.1277 17.6978 9.65081 18.0494 9.29918C18.401 8.94754 18.878 8.75 19.3752 8.75Z" fill="#9BA2B1" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_482_8191">
                                        <rect width="30" height="30" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                        </div>
                        <div className="tab-label">배경</div>
                    </button>
                    <button
                        className={selectedTab === 'text' ? 'tab-selected' : 'tab'}
                        onClick={() => setSelectedTab('text')}
                    >
                        <div className="tab-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none" className={`tab-icon-svg ${selectedTab === 'text' ? 'active' : ''}`}>
                                <g clip-path="url(#clip0_482_8197)">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M9.99946 4.375C11.187 4.375 12.237 5.14125 12.6007 6.27125L18.0345 23.1763C18.1822 23.6484 18.1373 24.1599 17.9096 24.5991C17.6819 25.0384 17.2898 25.3698 16.8188 25.5212C16.3478 25.6726 15.836 25.6317 15.395 25.4074C14.954 25.1831 14.6195 24.7936 14.4645 24.3237L12.8732 19.375H7.12571L5.53446 24.3237C5.37942 24.7936 5.04495 25.1831 4.60395 25.4074C4.16295 25.6317 3.65117 25.6726 3.18014 25.5212C2.70911 25.3698 2.31701 25.0384 2.0893 24.5991C1.86159 24.1599 1.81671 23.6484 1.96446 23.1763L7.39821 6.27125C7.57519 5.72073 7.92225 5.24054 8.38946 4.89979C8.85667 4.55904 9.42119 4.37529 9.99946 4.375ZM25.6245 15C26.1217 15 26.5987 15.1975 26.9503 15.5492C27.3019 15.9008 27.4995 16.3777 27.4995 16.875V23.125C27.4994 23.4768 27.4004 23.8215 27.2137 24.1197C27.027 24.4178 26.7602 24.6575 26.4438 24.8112C26.1273 24.9649 25.774 25.0265 25.4242 24.9889C25.0744 24.9514 24.7423 24.8162 24.4657 24.5988C23.7053 24.9233 22.8763 25.0541 22.0529 24.9797C21.2295 24.9052 20.4374 24.6277 19.7475 24.1721C19.0577 23.7164 18.4916 23.0968 18.0999 22.3687C17.7082 21.6406 17.5032 20.8268 17.5032 20C17.5032 19.1732 17.7082 18.3594 18.0999 17.6313C18.4916 16.9032 19.0577 16.2836 19.7475 15.8279C20.4374 15.3723 21.2295 15.0948 22.0529 15.0203C22.8763 14.9459 23.7053 15.0767 24.4657 15.4012C24.7845 15.15 25.187 15 25.6245 15ZM22.4995 18.75C22.1679 18.75 21.85 18.8817 21.6156 19.1161C21.3812 19.3505 21.2495 19.6685 21.2495 20C21.2495 20.3315 21.3812 20.6495 21.6156 20.8839C21.85 21.1183 22.1679 21.25 22.4995 21.25C22.831 21.25 23.1489 21.1183 23.3833 20.8839C23.6178 20.6495 23.7495 20.3315 23.7495 20C23.7495 19.6685 23.6178 19.3505 23.3833 19.1161C23.1489 18.8817 22.831 18.75 22.4995 18.75ZM9.99946 10.4325L8.33071 15.625H11.6682L9.99946 10.4325Z" fill="#9BA2B1" fill-opacity="0.6" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_482_8197">
                                        <rect width="30" height="30" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                        </div>
                        <div className="tab-label">글자</div>
                    </button>
                </div>

            </div>

        </div>
    );
};

export default CardCustomizationPage;