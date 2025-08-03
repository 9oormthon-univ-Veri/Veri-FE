// src/pages/LoginPage.tsx

import React from 'react';
//import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const KAKAO_ICON_URL = '/src/assets/icons/kakao_icon.svg';
const NAVER_ICON_URL = '/src/assets/icons/naver_icon.svg';

const LoginPage: React.FC = () => {
  //const navigate = useNavigate();

  // Make sure VITE_APP_API_BASE_URL is correctly set in your .env file
  // (e.g., VITE_APP_API_BASE_URL=https://api.very.miensoap.me)
  const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

  // --- Kakao login start handler (redirects to backend's auth endpoint) ---
  const handleRealKakaoLoginStart = () => {
    const KAKAO_AUTH_URL_THROUGH_BACKEND = `${BASE_URL}/oauth2/authorization/kakao`;
    console.log('Redirecting to backend for Kakao login:', KAKAO_AUTH_URL_THROUGH_BACKEND);
    window.location.href = KAKAO_AUTH_URL_THROUGH_BACKEND;
  };

  const handleNaverLogin = () => {
    console.log('Naver login button clicked');
  };

  return (
    <div className="login-page-container">
      <div className="login-content-wrapper">
        <div className="login-buttons-container">
          <button className="social-login-button kakao" onClick={handleRealKakaoLoginStart}>
            <img src={KAKAO_ICON_URL} alt="kakao-logo" className="kakao-social-icon" />
            <span className="kakao-social-text">카카오 로그인 Test</span>
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