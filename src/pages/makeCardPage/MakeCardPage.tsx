// src/pages/MakeCardPage.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdClose } from 'react-icons/md';

import GalleryIcon from '/icons/gallery.svg';
import CameraIcon from '/icons/camera.svg';

// imageApi에서 uploadImage 함수를 임포트합니다.
import { uploadImage } from '../../api/imageApi';

import './MakeCardPage.css';

const MakeCardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // selectedGalleryImage와 capturedImage는 이제 Public URL (string)을 저장합니다.
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null); // 업로드 후 Public URL 저장
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // 업로드 중 상태 추가
  const [uploadError, setUploadError] = useState<string | null>(null); // 업로드 에러 상태 추가

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [bookId] = useState<number>(6); // 임의의 책 ID 설정 (실제 책 ID로 대체 필요)

  // 현재 표시할 이미지 목록 (업로드된 이미지 + 갤러리 이미지 + 기본 이미지)
  // ✨ defaultImages를 제거하여 초기 화면이 비어있도록 합니다.
  const allAvailableImages = [];
  if (capturedImage) allAvailableImages.push(capturedImage);
  if (selectedGalleryImage) allAvailableImages.push(selectedGalleryImage);
  // allAvailableImages.push(...defaultImages); // 이 줄을 주석 처리하거나 제거합니다.
  const imagesToDisplay = allAvailableImages;

  // 이미지 업로드 및 OCR 페이지로 이동을 처리하는 공통 함수
  const processAndNavigateToOcr = useCallback(async (imageToProcess: string) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      let finalImageUrl: string;

      if (imageToProcess.startsWith('data:')) {
        const response = await fetch(imageToProcess);
        const blob = await response.blob();
        const file = new File([blob], `captured_photo_${Date.now()}.png`, { type: 'image/png' });
        finalImageUrl = await uploadImage(file);
      } else {
        finalImageUrl = imageToProcess;
      }

      console.log('OCR을 위해 전달될 최종 이미지 URL:', finalImageUrl);

      navigate('/text-extraction-loading', {
        state: {
          image: finalImageUrl,
          bookId: bookId,
        },
      });
    } catch (err: any) {
      console.error('이미지 업로드 또는 OCR 페이지 이동 중 오류 발생:', err);
      setUploadError(`이미지 처리 중 오류가 발생했습니다: ${err.message}`);
      setIsUploading(false);
    }
  }, [bookId, navigate]);

  // Attach stream to video and handle play & readiness
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      setIsVideoReady(false); // 리셋

      videoRef.current.onloadedmetadata = () => {
        setIsVideoReady(true);
      };

      videoRef.current.play().catch(err => {
        console.error('비디오 재생 에러:', err);
        setCameraError('비디오 재생에 실패했습니다.');
      });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setIsVideoReady(false);
    };
  }, [stream]);

  // selectedGalleryImage와 capturedImage는 Public URL이므로, revokeObjectURL은 필요 없습니다.
  // defaultImages도 외부 URL이므로 revokeObjectURL은 필요 없습니다.

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleGalleryClick = () => {
    if (stream) {
      stopCameraStream(); // 카메라 스트림 중지
    }
    setIsCameraActive(false);
    setCameraError(null);
    fileInputRef.current?.click(); // 파일 입력 필드 클릭
  };

  // 갤러리 이미지 선택 시 바로 업로드 및 Public URL 저장
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true); // 업로드 시작
      setUploadError(null);
      try {
        const uploadedUrl = await uploadImage(file); // 파일 업로드
        setSelectedGalleryImage(uploadedUrl); // Public URL 저장
        setCapturedImage(null); // 캡처된 이미지 초기화
        setCurrentImageIndex(0); // 첫 번째 이미지로 설정
        console.log('갤러리 이미지 업로드 성공:', uploadedUrl);
      } catch (err: any) {
        console.error('갤러리 이미지 업로드 실패:', err);
        setUploadError(`갤러리 이미지 업로드 실패: ${err.message}`);
      } finally {
        setIsUploading(false); // 업로드 완료
      }
    }
  };

  const startCameraStream = useCallback(async () => {
    setCameraError(null);
    try {
      // 카메라 시작 전 기존 이미지 상태 초기화 (Public URL은 revoke 안함)
      setSelectedGalleryImage(null);
      setCapturedImage(null);

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
  }, []);

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

  // 촬영된 사진을 Base64로 저장하는 대신, 바로 Public URL로 변환하여 저장
  const handleTakePhoto = async () => {
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

        // 캡처된 이미지를 Blob으로 변환
        const imageBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, 'image/png');
        });

        if (!imageBlob) {
          console.error('캔버스에서 이미지 Blob 생성 실패.');
          return;
        }

        // Blob을 File 객체로 변환
        const photoFile = new File([imageBlob], `captured_photo_${Date.now()}.png`, { type: 'image/png' });

        setIsUploading(true); // 업로드 시작
        setUploadError(null);
        try {
          const uploadedUrl = await uploadImage(photoFile); // 이미지를 서버에 업로드
          setCapturedImage(uploadedUrl); // Public URL 저장
          setSelectedGalleryImage(null); // 갤러리 이미지 초기화
          setCurrentImageIndex(0);
          stopCameraStream(); // 촬영 후 카메라 중지
          setCameraError(null);
          console.log('촬영된 사진 업로드 성공:', uploadedUrl);
        } catch (err: any) {
          console.error('촬영된 사진 업로드 실패:', err);
          setUploadError(`사진 업로드 실패: ${err.message}`);
        } finally {
          setIsUploading(false); // 업로드 완료
        }
      }
    }
  };

  // 로딩 또는 에러 메시지 표시
  if (isUploading) {
    return (
      <div className="page-container">
        <div className="loading-overlay">
          <p>이미지 업로드 중...</p>
          {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="make-card-page">
        <header className="detail-header">
          <button className="header-left-arrow" onClick={() => navigate("/reading-card")}>
            <MdClose size={24} color="#333" />
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
              <p>카메라 접근 권한을 확인하고 다시 시도해주세요.</p>
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
            // ✨ 이미지가 없을 때 표시될 빈 화면 메시지
            <div className="no-image-message">
              <p>표시할 이미지가 없습니다.</p>
              <p>갤러리에서 선택하거나 카메라로 촬영해주세요.</p>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* 이미지가 있을 때만 점 인디케이터 표시 */}
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
            <button className="take-photo-button" onClick={handleTakePhoto} disabled={!isVideoReady || isUploading}>
              <span>{isUploading ? '업로드 중...' : '촬영'}</span>
            </button>
          ) : (
            <>
              <button className="gallery-button" onClick={handleGalleryClick} disabled={isUploading}>
                <img src={GalleryIcon} alt="갤러리 아이콘" className="button-icon" />
                <span>갤러리</span>
              </button>
              <button className="camera-button" onClick={handleCameraClick} disabled={isUploading}>
                <img src={CameraIcon} alt="카메라 아이콘" className="button-icon" />
                <span>카메라</span>
              </button>
            </>
          )}
        </div>

        {/* 촬영된 사진이 있거나 갤러리에서 선택된 사진이 있거나, 기본 이미지가 있을 때만 "사진 사용하기" 버튼 노출 */}
        {(!isCameraActive && imagesToDisplay[currentImageIndex]) && (
          <div className="use-photo-button-container" style={{ marginTop: '16px', textAlign: 'center' }}>
            <button
              className="use-photo-button"
              onClick={() => {
                const currentDisplayedImage = imagesToDisplay[currentImageIndex];
                if (currentDisplayedImage) { // currentDisplayedImage가 undefined가 아닌지 확인
                  processAndNavigateToOcr(currentDisplayedImage);
                } else {
                  // 이미지 선택이 안 된 경우 사용자에게 알리거나 버튼을 비활성화할 수 있습니다.
                  alert('사용할 이미지를 선택해주세요.');
                }
              }}
              disabled={isUploading || !imagesToDisplay[currentImageIndex]} // 버튼 비활성화 로직 유지
            >
              {isUploading ? '업로드 중...' : '사진 사용하기'}
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
