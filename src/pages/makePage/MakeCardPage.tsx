// src/pages/makePage/MakeCardPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBackIosNew } from 'react-icons/md'; // 리액트 아이콘은 정상 작동

// 💡 SVG 파일을 URL로 임포트합니다.
//    이 경로는 'public' 폴더나 웹팩/Vite의 정적 파일 서버 경로에 해당해야 합니다.
import GalleryIconUrl from '/icons/gallery.svg';
import CameraIconUrl from '/icons/camera.svg';

import './MakeCardPage.css';

const MakeCardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 💡 더 안정적인 임시 이미지 URL로 변경합니다.
  const images = [
    'https://picsum.photos/id/1018/350/500', // 랜덤 이미지 1
    'https://picsum.photos/id/1015/350/500', // 랜덤 이미지 2
    'https://picsum.photos/id/1025/350/500', // 랜덤 이미지 3
  ];

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleGalleryClick = () => {
    console.log('갤러리 버튼 클릭됨');
    // 실제 갤러리 로직 (예: 파일 인풋 트리거) 구현 필요
  };

  const handleCameraClick = () => {
    console.log('카메라 버튼 클릭됨');
    navigate('/camera'); // App.tsx에 정의된 카메라 페이지로 이동
  };

  return (
    <div className="page-container">
      <div className="make-card-page">
        <header className="detail-header">
          <button className="header-left-arrow" onClick={() => navigate(-1)}>
            <MdArrowBackIosNew size={24} color="#333" />
          </button>
          <h3>독서카드 만들기</h3>
          <div className="dummy-box"></div> {/* 우측 정렬을 위한 더미 요소 */}
        </header>

        {/* 이미지 미리보기 영역 */}
        <div className="image-preview-card">
          <img src={images[currentImageIndex]} alt="카드 이미지" className="preview-image" />
        </div>

        <div className="image-dots-container">
          {images.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentImageIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>

        {/* 하단 버튼 영역 */}
        <div className="button-container">
          <button className="gallery-button" onClick={handleGalleryClick}>
            {/* 💡 SVG URL을 <img> 태그의 src로 사용합니다. */}
            <img src={GalleryIconUrl} alt="갤러리 아이콘" className="button-icon" />
            <span>갤러리</span>
          </button>
          <button className="camera-button" onClick={handleCameraClick}>
            <img src={CameraIconUrl} alt="카메라 아이콘" className="button-icon" />
            <span>카메라</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MakeCardPage;