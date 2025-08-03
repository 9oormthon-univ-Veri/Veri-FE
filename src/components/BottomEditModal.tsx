// src/components/BottomEditModal.tsx

import React, { useState } from 'react';
import './BottomEditModal.css';
import { updateBookStatus } from '../api/bookApi';
import starFillIcon from '../assets/icons/star_fill.svg';
import starLineIcon from '../assets/icons/star_line.svg';

interface BottomEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberBookId: number;
  defaultScore: number;
  defaultStartedAt: string;
  defaultEndedAt: string;
  bookTitle: string;
  bookAuthor: string;
}

// StarRatingInput 컴포넌트
interface StarRatingInputProps {
  initialRating: number;
  onRatingChange: (rating: number) => void;
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({ initialRating, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(initialRating);

  const handleClick = (index: number) => {
    setCurrentRating(index);
    onRatingChange(index);
  };

  return (
    <div className="star-rating-input">
      {[...Array(5)].map((_, index) => {
        index += 1; // 별점은 1부터 시작
        const isFilled = index <= (hoverRating || currentRating);
        return (
          <button
            type="button"
            key={index}
            className={`star-button ${isFilled ? "on" : "off"}`} // 클래스명 일관성 유지
            onClick={() => handleClick(index)}
            onMouseEnter={() => setHoverRating(index)}
            onMouseLeave={() => setHoverRating(0)}
          >
            <img
              src={isFilled ? starFillIcon : starLineIcon}
              alt={isFilled ? "채워진 별" : "빈 별"}
              className="star-icon"
            />
          </button>
        );
      })}
    </div>
  );
};

const BottomEditModal: React.FC<BottomEditModalProps> = ({
  isOpen,
  onClose,
  memberBookId,
  defaultScore,
  defaultStartedAt,
  defaultEndedAt,
  bookTitle,
  bookAuthor,
}) => {
  const [score, setScore] = useState(defaultScore);
  const [startedAt, setStartedAt] = useState(defaultStartedAt);
  const [endedAt, setEndedAt] = useState(defaultEndedAt);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateBookStatus(memberBookId, {
        score,
        startedAt,
        endedAt,
      });
      alert('책 정보가 성공적으로 수정되었습니다.');
      onClose();
    } catch (error) {
      console.error('저장 중 오류가 발생했습니다:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bottom-edit-modal-overlay">
      <div className="bottom-edit-modal">
        <div className="modal-header">
          <p className="modal-title">{bookTitle}</p>
          <p className="modal-author">{bookAuthor}</p>
        </div>

        <div className="star-rating-container">
          <h3>나의 별점</h3>
          <StarRatingInput
            initialRating={score}
            onRatingChange={setScore}
          />
        </div>

        <div className="status-inputs-container">
          <h3>독서 기간</h3>
          <div className="date-inputs">
            <div className="start-time">
              <p>시작일</p>
              <input
                className='date-input'
                type="date"
                value={startedAt.split('T')[0]}
                onChange={(e) => setStartedAt(new Date(e.target.value).toISOString())}
              />
            </div>
            <div className="end-time">
              <p>종료일</p>
              <input
                className='date-input'
                type="date"
                value={endedAt.split('T')[0]}
                onChange={(e) => setEndedAt(new Date(e.target.value).toISOString())}
              />
            </div>
          </div>
        </div>

        <div className="edit-modal-button-container">
          <button onClick={onClose} className='cancel-button'>
            취소
          </button>
          <button onClick={handleSave} disabled={isSaving} className='complete-button'>
            {isSaving ? '저장 중...' : '완료'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomEditModal;