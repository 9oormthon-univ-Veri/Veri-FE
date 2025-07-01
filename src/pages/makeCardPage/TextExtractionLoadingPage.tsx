import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// 👇 모의 데이터 가져오기
import { mockExtractedTextResponse } from '../../api/mockData';

import './TextExtractionLoadingPage.css'; // 스타일 파일을 가져옵니다.

const TextExtractionLoadingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const image = location.state?.image as string | undefined;

  useEffect(() => {
    if (!image) {
      navigate('/make-card');
      return;
    }

    const timer = setTimeout(() => {
      // ✅ mock 데이터를 사용해 이동
      const extractedText = mockExtractedTextResponse.result.extractedString;

      navigate('/text-extraction-result', {
        state: {
          image,
          extractedText,
        },
      });
    }, 1500); // 약간 대기 시간 줘서 사용자에게 피드백

    return () => clearTimeout(timer);
  }, [navigate, image]);

  return (
    <div className="page-container">
      <div className="text-extraction-wrapper">
        <div className="text-extraction-loading-page">
          <header className="loading-header">
            <h3>텍스트를 분석중이에요</h3>
            <p>결과가 나올때까지 조금만 기다려주세요!</p>
          </header>

          <div className="loading-content">
            {image && (
              <img
                src={image}
                alt="업로드된 이미지"
                style={{ marginTop: '20px', maxWidth: '80%', borderRadius: '8px' }}
              />
            )}
            <p>앱 사용에 대한 간단한 설명</p>

          </div>
        </div>
      </div>

    </div>
  );
};

export default TextExtractionLoadingPage;
