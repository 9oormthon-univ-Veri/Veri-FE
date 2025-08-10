// src/pages/LoginPage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { handleSocialLoginCallback, setAccessToken } from '../api/auth';
import { USE_MOCK_DATA } from '../api/mock';
import kakaoIcon from '../assets/icons/login/kakao_icon.svg';
import naverIcon from '../assets/icons/login/naver_icon.svg';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

  const handleKakaoLogin = async () => {
    if (USE_MOCK_DATA) {
      try {
        console.log('목업 모드: 카카오 로그인 시뮬레이션');
        const accessToken = await handleSocialLoginCallback('kakao', 'mock-code');
        setAccessToken(accessToken);
        console.log('목업 로그인 성공, 홈으로 이동합니다.');
        navigate('/');
      } catch (error) {
        console.error('목업 로그인 실패:', error);
        alert(`로그인 처리 중 오류가 발생했습니다.\n\n${(error as Error).message}`);
      }
    } else {
      const kakaoAuthUrl = `${BASE_URL}/oauth2/authorization/kakao`;
      console.log('Redirecting to backend for Kakao login:', kakaoAuthUrl);
      window.location.href = kakaoAuthUrl;
    }
  };

  const handleNaverLogin = async () => {
    if (USE_MOCK_DATA) {
      try {
        console.log('목업 모드: 네이버 로그인 시뮬레이션');
        const accessToken = await handleSocialLoginCallback('naver', 'mock-code');
        setAccessToken(accessToken);
        console.log('목업 로그인 성공, 홈으로 이동합니다.');
        navigate('/');
      } catch (error) {
        console.error('목업 로그인 실패:', error);
        alert(`로그인 처리 중 오류가 발생했습니다.\n\n${(error as Error).message}`);
      }
    } else {
      console.log('Naver login button clicked');
      // 실제 네이버 로그인 구현 시 여기에 추가
    }
  };

  return (
    <div className="page-container">
      <div className="login-content-wrapper">
        <div className="login-buttons-container">
          <button className="social-login-button kakao" onClick={handleKakaoLogin}>
            <img src={kakaoIcon} alt="kakao-logo" className="kakao-social-icon" />
            <span className="kakao-social-text">카카오 로그인</span>
          </button>

          <button className="social-login-button naver" onClick={handleNaverLogin}>
            <img src={naverIcon} alt="naver-logo" className="naver-social-icon" />
            <span className="naver-social-text">네이버 로그인</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;