// src/components/BookDetailPage/EditPopup.tsx
import React, { useState, useEffect } from 'react';
import './EditPopup.css'; // 팝업 스타일을 위한 CSS 파일 (나중에 생성)

// BookItem 인터페이스를 BookDetailPage.tsx와 동기화해야 합니다.
interface BookItem {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  rating: number;
  status: string;
  date: string;
  translator?: string;
  // 필요한 경우 여기에 추가 필드를 더합니다.
}

interface EditPopupProps {
  isOpen: boolean;
  onClose: () => void;
  bookData: BookItem; // 수정할 책 데이터
  onSave: (updatedBook: BookItem) => void; // 수정된 책 데이터를 저장할 콜백 함수
}

const EditPopup: React.FC<EditPopupProps> = ({ isOpen, onClose, bookData, onSave }) => {
  const [editedTitle, setEditedTitle] = useState(bookData.title);
  const [editedAuthor, setEditedAuthor] = useState(bookData.author);
  const [editedRating, setEditedRating] = useState(bookData.rating);
  const [editedDate, setEditedDate] = useState(bookData.date);
  // 필요한 다른 필드도 여기에 상태로 추가합니다.

  // bookData가 변경될 때마다 폼 필드를 업데이트합니다. (모달이 다시 열릴 때 새 데이터로 초기화)
  useEffect(() => {
    if (bookData) { // bookData가 유효한지 확인
      setEditedTitle(bookData.title);
      setEditedAuthor(bookData.author);
      setEditedRating(bookData.rating);
      setEditedDate(bookData.date);
    }
  }, [bookData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedBook: BookItem = {
      ...bookData,
      title: editedTitle,
      author: editedAuthor,
      rating: editedRating,
      date: editedDate,
      // 다른 필드도 여기서 업데이트합니다.
    };
    onSave(updatedBook); // 부모 컴포넌트로 업데이트된 데이터 전달
    // onClose(); // 저장 후 자동으로 닫으려면 주석 해제
  };

  return (
    <div className="edit-popup-overlay">
      <div className="edit-popup-content">
        <h3>책 정보 수정</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">제목</label>
            <input
              type="text"
              id="title"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="author">저자</label>
            <input
              type="text"
              id="author"
              value={editedAuthor}
              onChange={(e) => setEditedAuthor(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="rating">별점 (0-5)</label>
            <input
              type="number"
              id="rating"
              min="0"
              max="5"
              step="0.5"
              value={editedRating}
              onChange={(e) => setEditedRating(parseFloat(e.target.value))}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="date">시작일</label>
            <input
              type="text" // 또는 type="date"로 변경하여 날짜 선택기 사용
              id="date"
              value={editedDate}
              onChange={(e) => setEditedDate(e.target.value)}
              required
            />
          </div>
          {/* 필요한 다른 입력 필드 추가 */}
          <div className="popup-actions">
            <button type="submit" className="save-button">저장</button>
            <button type="button" onClick={onClose} className="cancel-button">취소</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPopup;