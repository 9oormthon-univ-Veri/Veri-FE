import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TextExtractionResultPage.css';

const TextExtractionResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const image = location.state?.image as string | undefined;
  const extractedText = location.state?.extractedText as string | undefined;

  const [editableText, setEditableText] = useState<string>(extractedText || '');

  useEffect(() => {
    if (!image || !extractedText) {
      navigate('/make-card');
    }
  }, [image, extractedText, navigate]);

  const handleRetake = () => {
    navigate('/make-card');
  };

  const handleNext = () => {
    navigate('/customize-card', {
      state: {
        image,
        extractedText: editableText,
      },
    });
  };

  if (!image || !extractedText) return null;

  return (
    <div className="page-container">
      <h2>아래의 텍스트가 분석되었어요</h2>
      <p>텍스트 박스에서 직접 수정할 수 있습니다.</p>
      <img src={image} alt="선택한 이미지" className="extracted-image" />
      <textarea
        value={editableText}
        onChange={(e) => setEditableText(e.target.value)}
        className="extracted-textarea"
      />
      <div className="button-group">
        <button onClick={handleRetake}>재촬영</button>
        <button onClick={handleNext}>다음으로</button>
      </div>
    </div>
  );
};

export default TextExtractionResultPage;
