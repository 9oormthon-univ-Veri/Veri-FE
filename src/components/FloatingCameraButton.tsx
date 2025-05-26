// src/components/FloatingCameraButton.tsx
import { useNavigate } from 'react-router-dom';
import './FloatingCameraButton.css'; // 전용 CSS 파일 임포트

function FloatingCameraButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/camera'); // 카메라 페이지로 이동
  };

  return (
    // button 태그 대신 div로 감싸고, 내부를 flex column으로 만들 예정
    // button 태그를 사용하려면 내부 구조를 조정해야 할 수 있습니다.
    // 여기서는 클릭 가능한 div로 가정하고 FloatingCameraButton.css를 수정하겠습니다.
    <div className="floating-camera-button-wrapper"> {/* 새로운 wrapper div 추가 */}
      <button className="floating-camera-button" onClick={handleClick}>
        <div className="camera-icon"></div> {/* 카메라 아이콘을 위한 div */}
      </button>
      <span className="floating-camera-text">촬영</span> {/* 텍스트 추가 */}
    </div>
  );
}

export default FloatingCameraButton;