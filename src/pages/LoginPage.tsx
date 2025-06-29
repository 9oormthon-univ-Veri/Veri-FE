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
      // 1. 임시 로그인 API 호출
      const accessToken = await mockLogin();
      
      // 2. 토큰을 로컬 스토리지에 저장
      setAccessToken(accessToken);
      
      console.log('로그인 성공! 토큰 저장됨:', accessToken);
      
      // 3. 메인 페이지로 리디렉션
      navigate('/'); 
      
    } catch (error) {
      console.error('로그인 실패:', error);
      // 사용자에게 에러 메시지를 표시할 수 있습니다.
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