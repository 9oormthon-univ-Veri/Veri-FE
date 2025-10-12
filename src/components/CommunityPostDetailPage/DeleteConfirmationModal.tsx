import React from 'react';
import './DeleteConfirmationModal.css';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-message-container">
          <p className="modal-question">게시글을 삭제하시겠어요?</p>
          <p className="modal-info">삭제된 게시글은 복구할 수 없어요</p>
        </div>
        <div className="modal-actions-delete">
          <button className="cancel-button" onClick={onClose} disabled={isLoading}>
            취소하기
          </button>
          <button className="delete-button" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? '삭제 중...' : '삭제하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;

