// src/pages/LoginPage.tsx

import React from 'react';
import './LoginPage.css';

const ICONS = {
  KAKAO: '/src/assets/icons/login/kakao_icon.svg',
  NAVER: '/src/assets/icons/login/naver_icon.svg',
} as const;

const LoginPage: React.FC = () => {
  const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

  const handleKakaoLogin = () => {
    const kakaoAuthUrl = `${BASE_URL}/oauth2/authorization/kakao`;
    console.log('Redirecting to backend for Kakao login:', kakaoAuthUrl);
    window.location.href = kakaoAuthUrl;
  };

  const handleNaverLogin = () => {
    console.log('Naver login button clicked');
  };

  return (
    <div className="page-container">
      <div className="login-content-wrapper">
        <div className="login-buttons-container">
          <button className="social-login-button kakao" onClick={handleKakaoLogin}>
            <img src={ICONS.KAKAO} alt="kakao-logo" className="kakao-social-icon" />
            <span className="kakao-social-text">카카오 로그인</span>
          </button>

          <button className="social-login-button naver" onClick={handleNaverLogin}>
            <img src={ICONS.NAVER} alt="naver-logo" className="naver-social-icon" />
            <span className="naver-social-text">네이버 로그인</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;