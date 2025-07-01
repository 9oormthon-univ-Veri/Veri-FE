import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBackIosNew } from 'react-icons/md';

import GalleryIcon from '/icons/gallery.svg';
import CameraIcon from '/icons/camera.svg';

import './MakeCardPage.css';

const MakeCardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const defaultImages = [
    'https://picsum.photos/id/1018/350/500',
    'https://picsum.photos/id/1015/350/500',
    'https://picsum.photos/id/1025/350/500',
  ];

  const handleUseCapturedPhoto = () => {
    if (capturedImage) {
      navigate('/text-extraction-loading', {
        state: {
          image: capturedImage,
        },
      });
    }
  };

  const allAvailableImages = [];
  if (capturedImage) allAvailableImages.push(capturedImage);
  if (selectedGalleryImage) allAvailableImages.push(selectedGalleryImage);
  allAvailableImages.push(...defaultImages);
  const imagesToDisplay = allAvailableImages;

  // Attach stream to video and handle play & readiness
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      setIsVideoReady(false); // 리셋

      // onloadedmetadata 이벤트에서 비디오 준비 완료 표시
      videoRef.current.onloadedmetadata = () => {
        setIsVideoReady(true);
      };

      // 즉시 play 시도 (onloadedmetadata 기다리지 않고)
      videoRef.current.play().catch(err => {
        console.error('비디오 재생 에러:', err);
        setCameraError('비디오 재생에 실패했습니다.');
      });
    }

    return () => {
      // 컴포넌트 언마운트 또는 stream 변경시 스트림 정리
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setIsVideoReady(false);
    };
  }, [stream]);

  useEffect(() => {
    // URL 객체 정리
    if (selectedGalleryImage) {
      URL.revokeObjectURL(selectedGalleryImage);
    }
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
  }, [capturedImage, selectedGalleryImage]);

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleGalleryClick = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
    setCameraError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (selectedGalleryImage) URL.revokeObjectURL(selectedGalleryImage);
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
        setCapturedImage(null);
      }
      const imageUrl = URL.createObjectURL(file);
      setSelectedGalleryImage(imageUrl);
      setCurrentImageIndex(0);
    }
  };

  const startCameraStream = useCallback(async () => {
    setCameraError(null);
    try {
      if (selectedGalleryImage) {
        URL.revokeObjectURL(selectedGalleryImage);
        setSelectedGalleryImage(null);
      }
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
        setCapturedImage(null);
      }
      const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(newStream);
      setIsCameraActive(true);
      setCurrentImageIndex(0);
    } catch (err: any) {
      console.error('카메라 접근 에러:', err);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setCameraError('카메라 접근 권한이 거부되었습니다. 브라우저 설정을 확인해주세요.');
      } else if (err instanceof DOMException && (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError')) {
        setCameraError('카메라를 찾을 수 없습니다. 장치가 연결되어 있는지 확인해주세요.');
      } else {
        setCameraError('카메라를 시작할 수 없습니다. 다시 시도해주세요: ' + err.message);
      }
      setIsCameraActive(false);
    }
  }, [selectedGalleryImage, capturedImage]);

  const stopCameraStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
    setIsVideoReady(false);
  }, [stream]);

  const handleCameraClick = () => {
    if (isCameraActive) {
      stopCameraStream();
    } else {
      startCameraStream();
    }
  };

  const handleTakePhoto = () => {
    if (!isVideoReady) {
      setCameraError('카메라 준비가 되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setCameraError('비디오 크기가 0입니다. 캡처를 중단합니다.');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const photoUrl = canvas.toDataURL('image/png');
        setCapturedImage(photoUrl);
        setSelectedGalleryImage(null);
        setCurrentImageIndex(0);
        stopCameraStream();
        setCameraError(null);
      }
    }
  };

  return (
    <div className="page-container">
      <div className="make-card-page">
        <header className="detail-header">
          <button className="header-left-arrow" onClick={() => navigate(-1)}>
            <MdArrowBackIosNew size={24} color="#333" />
          </button>
          <h3>독서카드 만들기</h3>
          <div className="dummy-box" />
        </header>

        <div className="image-preview-card">
          {isCameraActive && stream ? (
            <video
              ref={videoRef}
              className="camera-feed"
              autoPlay
              playsInline
              muted
            />
          ) : cameraError ? (
            <div className="camera-error-message">
              <p>{cameraError}</p>
              <p>카메라 버튼을 다시 눌러 시도하거나, 브라우저 설정에서 권한을 확인해주세요.</p>
            </div>
          ) : imagesToDisplay.length > 0 && imagesToDisplay[currentImageIndex] ? (
            <img
              src={imagesToDisplay[currentImageIndex]}
              alt="카드 이미지"
              className="preview-image"
              onLoad={() => console.log('Image loaded:', imagesToDisplay[currentImageIndex])}
              onError={e => {
                e.currentTarget.src = 'https://placehold.co/350x500/cccccc/333333?text=Image+Load+Failed';
                e.currentTarget.alt = '이미지 로드 실패';
              }}
            />
          ) : (
            <div className="no-image-message">
              <p>표시할 이미지가 없습니다.</p>
              <p>갤러리에서 선택하거나 카메라로 촬영해주세요.</p>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* 기존 이미지 도트 및 버튼들 유지 */}

        {!isCameraActive && imagesToDisplay.length > 0 && (
          <div className="image-dots-container">
            {imagesToDisplay.map((_, idx) => (
              <span
                key={idx}
                className={`dot ${idx === currentImageIndex ? 'active' : ''}`}
                onClick={() => handleDotClick(idx)}
              />
            ))}
          </div>
        )}

        <div className="button-container">
          {isCameraActive ? (
            <button className="take-photo-button" onClick={handleTakePhoto}>
              <span>촬영</span>
            </button>
          ) : (
            <>
              <button className="gallery-button" onClick={handleGalleryClick}>
                <img src={GalleryIcon} alt="갤러리 아이콘" className="button-icon" />
                <span>갤러리</span>
              </button>
              <button className="camera-button" onClick={handleCameraClick}>
                <img src={CameraIcon} alt="카메라 아이콘" className="button-icon" />
                <span>카메라</span>
              </button>
            </>
          )}
        </div>

        {/* 촬영된 사진이 있을 때만 "사진 사용하기" 버튼 노출 */}
        {capturedImage && (
          <div className="use-photo-button-container" style={{ marginTop: '16px', textAlign: 'center' }}>
            <button className="use-photo-button" onClick={handleUseCapturedPhoto}>
              사진 사용하기
            </button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default MakeCardPage;
