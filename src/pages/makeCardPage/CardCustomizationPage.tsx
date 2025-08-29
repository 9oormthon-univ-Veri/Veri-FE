import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CardCustomizationPage.css';
import Toast from '../../components/Toast';

import PicFillIconSVG from '../../assets/icons/CustomizePage/pic_fill.svg?react';
import FontSizeFillIconSVG from '../../assets/icons/CustomizePage/font_size_fill.svg?react';
import CheckFillIconSVG from '../../assets/icons/CustomizePage/check_fill.svg?react';

import SkyBackground from '../../assets/images/cardSample/sky.jpg';
import SummerSeaBackground from '../../assets/images/cardSample/sea.jpg';
import RiverBackground from '../../assets/images/cardSample/river.jpg';
import ForsetBackground from '../../assets/images/cardSample/forest.jpg';
import ColorBackground from '../../assets/images/cardSample/color.jpg';

const CardCustomizationPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();



    const image = location.state?.image as string | undefined;
    const extractedText = location.state?.extractedText as string | undefined;

    const [selectedTab, setSelectedTab] = useState<'image' | 'text'>('image');
    const [isBlocked, setIsBlocked] = useState(false);
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
    
    // 텍스트 드래그 관련 상태
    const [textPosition, setTextPosition] = useState({ x: 16, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

    const getBackgroundImage = () => {
        if (selectedBackground === 'uploaded') return image;
        const found = defaultBackgrounds.find((bg) => bg.label === selectedBackground);
        return found?.url || image;
    };

    // 이미지 크기 계산 함수
    const calculateImageDimensions = (imageUrl: string) => {
        const img = new Image();
        img.onload = () => {
            const container = document.querySelector('.custom-card-preview') as HTMLElement;
            if (container) {
                const containerWidth = container.offsetWidth;
                const containerHeight = container.offsetHeight;
                
                // 이미지 비율 계산
                const imageRatio = img.width / img.height;
                const containerRatio = containerWidth / containerHeight;
                
                let displayWidth, displayHeight;
                
                if (imageRatio > containerRatio) {
                    // 이미지가 더 넓은 경우
                    displayWidth = containerWidth;
                    displayHeight = containerWidth / imageRatio;
                } else {
                    // 이미지가 더 높은 경우
                    displayHeight = containerHeight;
                    displayWidth = containerHeight * imageRatio;
                }
                
                setImageDimensions({ width: displayWidth, height: displayHeight });
            }
        };
        img.src = imageUrl;
    };

    useEffect(() => {
        if ((!image || !extractedText) && !isBlocked) {
            showToast('필수 데이터 (이미지, 텍스트)가 누락되었습니다. 카드 생성 페이지로 이동합니다.', 'error');
            setIsBlocked(true);
            navigate('/make-card', { replace: true });
        }
    }, [image, extractedText, navigate, isBlocked]);

    // 배경 이미지가 변경될 때마다 이미지 크기 계산
    useEffect(() => {
        const currentImage = getBackgroundImage();
        if (currentImage) {
            calculateImageDimensions(currentImage);
        }
    }, [selectedBackground, image]);

    if (isBlocked) {
        return null;
    }



    if (!image && !isBlocked) {
        return (
            <div className="page-container">
                <p>필수 정보를 불러오는 중입니다...</p>
            </div>
        );
    }

    // 텍스트 드래그 이벤트 핸들러들
    const handleMouseDown = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        setIsDragging(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        
        const container = e.currentTarget.getBoundingClientRect();
        const newX = e.clientX - container.left - dragOffset.x;
        const newY = e.clientY - container.top - dragOffset.y;
        
        // 이미지 크기에 맞춰서 드래그 범위 제한
        const textElement = document.querySelector('.overlay-text') as HTMLElement;
        const textWidth = textElement ? textElement.offsetWidth : 200;
        const textHeight = textElement ? textElement.offsetHeight : 100;
        
        // 이미지가 표시되는 실제 영역 계산
        const imageLeft = (container.width - imageDimensions.width) / 2;
        const imageTop = (container.height - imageDimensions.height) / 2;
        
        const maxX = imageLeft + imageDimensions.width - textWidth;
        const maxY = imageTop + imageDimensions.height - textHeight;
        
        setTextPosition({
            x: Math.max(imageLeft, Math.min(newX, maxX)),
            y: Math.max(imageTop, Math.min(newY, maxY))
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleSave = () => {
        if (!image || !extractedText || !selectedFont) {
            showToast('이미지와 텍스트, 폰트는 필수로 포함되어야 합니다. 저장할 수 없습니다.', 'error');
            return;
        }

        navigate('/card-book-search-before', {
            state: {
                image: getBackgroundImage(),
                extractedText,
                font: selectedFont,
                textPosition: textPosition,
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
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <div
                        className={`overlay-text ${isDragging ? 'dragging' : ''}`}
                        style={{ 
                            fontFamily: selectedFont,
                            left: `${textPosition.x}px`,
                            top: `${textPosition.y}px`,
                            cursor: isDragging ? 'grabbing' : 'grab'
                        }}
                        onMouseDown={handleMouseDown}
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

export default CardCustomizationPage;
