// src/pages/CameraPage.tsx
import { useRef, useEffect, useState, useCallback } from 'react';

function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Request camera access
  const getCameraAccess = useCallback(async () => {
    setError(null); // Clear previous errors
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setHasPermission(true);
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError') {
        setError('카메라 접근이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('카메라를 찾을 수 없습니다. 장치가 연결되어 있는지 확인해주세요.');
      } else {
        setError('카메라를 시작하는 중 오류가 발생했습니다: ' + err.message);
      }
    }
  }, []);

  // Effect to request camera access and clean up stream on unmount
  useEffect(() => {
    getCameraAccess();

    // Cleanup function
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [getCameraAccess]);

  // Warn user before leaving the page (optional)
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setHasPermission(true);
      } catch (err) {
        console.error(err);
        setHasPermission(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // Take a photo
  const takePhoto = () => {
    if (videoRef.current && photoRef.current) {
      const video = videoRef.current;
      const photo = photoRef.current;
      const context = photo.getContext('2d');

      if (context) {
        // Set canvas dimensions to match video
        photo.width = video.videoWidth;
        photo.height = video.videoHeight;
        context.drawImage(video, 0, 0, photo.width, photo.height);

        // Get image data
        const dataUrl = photo.toDataURL('image/png');
        setPhotoDataUrl(dataUrl);

        // Stop camera
        if (video.srcObject) {
          const tracks = (video.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
          video.srcObject = null;
        }
      }
    }
  };

  return (
    <div className="page-container">
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>촬영 페이지</h2>
        <p>책 표지를 촬영하여 독서 기록을 시작합니다.</p>

        {hasPermission === null && <p>카메라 접근 권한을 요청 중입니다...</p>}
        {hasPermission === false && (
          <div style={{ color: 'red', margin: '20px 0' }}>
            <p>{error || '카메라 접근 권한이 없습니다. 카메라를 사용하려면 권한을 허용해야 합니다.'}</p>
            <button onClick={getCameraAccess} style={{ padding: '10px 20px', cursor: 'pointer' }}>
              다시 권한 요청
            </button>
          </div>
        )}

        {hasPermission === true && !photoDataUrl && (
          <div style={{ margin: '20px 0' }}>
            <video
              ref={videoRef}
              style={{ width: '100%', maxWidth: '500px', border: '1px solid #ccc' }}
              autoPlay
              playsInline
              muted
            />
            <button
              onClick={takePhoto}
              style={{ marginTop: '10px', padding: '10px 20px', fontSize: '1.2em', cursor: 'pointer' }}
            >
              사진 촬영
            </button>
          </div>
        )}

        {photoDataUrl && (
          <div style={{ margin: '20px 0' }}>
            <h3>촬영된 이미지:</h3>
            <img
              src={photoDataUrl}
              alt="Captured Book Cover"
              style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ccc' }}
            />
            <button
              onClick={() => {
                setPhotoDataUrl(null);
                getCameraAccess(); // Restart camera
              }}
              style={{ marginTop: '10px', padding: '10px 20px', fontSize: '1.2em', cursor: 'pointer' }}
            >
              다시 촬영
            </button>
            <button
              style={{
                marginTop: '10px',
                marginLeft: '10px',
                padding: '10px 20px',
                fontSize: '1.2em',
                cursor: 'pointer',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
              }}
            >
              저장 / 사용
            </button>
          </div>
        )}

        {error && hasPermission !== false && <p style={{ color: 'red' }}>오류: {error}</p>}

        {/* Hidden canvas to draw captured image */}
        <canvas ref={photoRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}

export default CameraPage;