// src/pages/makePage/MakeCardPage.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBackIosNew } from 'react-icons/md'; // React icons work correctly

// 💡 SVG files are imported via URL.
//    These paths should correspond to the 'public' folder or webpack/Vite's static file server path.
import GalleryIconUrl from '/icons/gallery.svg';
import CameraIconUrl from '/icons/camera.svg';

import './MakeCardPage.css'; // Assuming this CSS file is present and contains necessary styles

const MakeCardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // State to hold the URL of the selected gallery image
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);

  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 💡 Changed to more stable temporary image URLs.
  const defaultImages = [
    'https://picsum.photos/id/1018/350/500', // Random image 1
    'https://picsum.photos/id/1015/350/500', // Random image 2
    'https://picsum.photos/id/1025/350/500', // Random image 3
  ];

  // Determine which image to display: selected gallery image first, then default images
  const imagesToDisplay = selectedGalleryImage ? [selectedGalleryImage, ...defaultImages] : defaultImages;

  // Effect to clean up the object URL when the component unmounts or image changes
  useEffect(() => {
    return () => {
      if (selectedGalleryImage) {
        URL.revokeObjectURL(selectedGalleryImage);
      }
    };
  }, [selectedGalleryImage]);

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleGalleryClick = () => {
    console.log('갤러리 버튼 클릭됨 (Gallery button clicked)');
    // Trigger the hidden file input click
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a URL for the selected file
      const imageUrl = URL.createObjectURL(file);
      // Revoke previous object URL if any
      if (selectedGalleryImage) {
        URL.revokeObjectURL(selectedGalleryImage);
      }
      setSelectedGalleryImage(imageUrl);
      setCurrentImageIndex(0); // Reset to show the newly selected image
      console.log('이미지 선택됨:', file.name); // Image selected
    }
  };

  const handleCameraClick = () => {
    console.log('카메라 버튼 클릭됨 (Camera button clicked)');
    navigate('/camera'); // Navigate to the camera page defined in App.tsx
  };

  return (
    <div className="page-container">
      <div className="make-card-page">
        <header className="detail-header">
          <button className="header-left-arrow" onClick={() => navigate(-1)}>
            <MdArrowBackIosNew size={24} color="#333" />
          </button>
          <h3>독서카드 만들기</h3> {/* Make Reading Card */}
          <div className="dummy-box"></div> {/* Dummy element for right alignment */}
        </header>

        {/* Image preview area */}
        <div className="image-preview-card">
          <img
            src={imagesToDisplay[currentImageIndex]}
            alt="카드 이미지" // Card image
            className="preview-image"
          />
        </div>

        <div className="image-dots-container">
          {imagesToDisplay.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentImageIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>

        {/* Hidden file input for gallery selection */}
        <input
          type="file"
          accept="image/*" // Accept only image files
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }} // Hide the input visually
        />

        {/* Bottom button area */}
        <div className="button-container">
          <button className="gallery-button" onClick={handleGalleryClick}>
            {/* 💡 Use SVG URL as the src for the <img> tag. */}
            <img src={GalleryIconUrl} alt="갤러리 아이콘" className="button-icon" /> {/* Gallery icon */}
            <span>갤러리</span> {/* Gallery */}
          </button>
          <button className="camera-button" onClick={handleCameraClick}>
            <img src={CameraIconUrl} alt="카메라 아이콘" className="button-icon" /> {/* Camera icon */}
            <span>카메라</span> {/* Camera */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MakeCardPage;
