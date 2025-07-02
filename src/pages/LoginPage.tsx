import React from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate 임포트
import { mockLogin, setAccessToken } from '../api/auth'; // auth.ts에서 만든 함수 임포트
import './LoginPage.css';

const KAKAO_ICON_URL = '/icons/kakao_icon.svg';
const NAVER_ICON_URL = '/icons/naver_icon.svg';

const LoginPage: React.FC = () => {
  const navigate = useNavigate(); // useNavigate 훅 사용

  const handleKakaoLogin = async () => {
    try {
      const accessToken = await mockLogin();

      setAccessToken(accessToken); // 토큰 저장 함수 호출

      console.log('로그인 성공! 토큰 저장됨:', accessToken);

      // ✨ 최종 확인 로그 추가
      const storedToken = localStorage.getItem('accessToken');
      console.log('LoginPage에서 최종 확인: 로컬 스토리지에 저장된 토큰:', storedToken);
      if (!storedToken || storedToken !== accessToken) {
          console.error('오류: 저장된 토큰이 예상과 다릅니다!');
      }

      navigate('/'); 

    } catch (error) {
      console.error('로그인 실패:', error);
      alert('로그인에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleNaverLogin = () => {
    // 네이버 로그인 로직 (카카오와 유사하게 구현)
    console.log('네이버 로그인 버튼 클릭됨');
    // window.location.href = '네이버 로그인 URL';
  };

  return (
    <div className="login-page-container">
      <div className="login-content-wrapper">
        <div className="login-buttons-container">
          <button className="social-login-button kakao" onClick={handleKakaoLogin}>
            <img src={KAKAO_ICON_URL} alt="kakao-logo" className="kakao-social-icon" />
            <span className="kakao-social-text">카카오 로그인</span>
          </button>
          <button className="social-login-button naver" onClick={handleNaverLogin}>
            <img src={NAVER_ICON_URL} alt="naver-logo" className="naver-social-icon" />
            <span className="naver-social-text">네이버 로그인</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;