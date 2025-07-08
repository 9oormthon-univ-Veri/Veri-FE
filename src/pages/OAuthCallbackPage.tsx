// src/pages/OAuthCallbackPage.tsx

import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleSocialLoginCallback, setAccessToken } from '../api/auth';

const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasRun = useRef(false); // Prevent double execution

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const processKakaoCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');

      if (code) {
        console.log('받은 code:', code);
        try {
          const accessToken = await handleSocialLoginCallback('kakao', code);
          setAccessToken(accessToken);
          console.log('로그인 성공, 홈으로 이동합니다.');
          navigate('/');
        } catch (error) {
          console.error('로그인 실패:', error);
          alert(`로그인 처리 중 오류가 발생했습니다.\n\n${(error as Error).message}`);
          navigate('/login');
        }
      } else {
        console.error('인가 코드를 찾을 수 없습니다.');
        alert('인가 코드가 유효하지 않습니다. 다시 시도해주세요.');
        navigate('/login');
      }
    };

    processKakaoCallback();
  }, [location, navigate]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <p>로그인 정보를 처리 중입니다. 잠시만 기다려 주세요...</p>
    </div>
  );
};

export default OAuthCallbackPage;
