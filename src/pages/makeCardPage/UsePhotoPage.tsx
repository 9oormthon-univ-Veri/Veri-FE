import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './UsePhotoPage.css';

const UsePhotoPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { image } = location.state || {};

    const handleUsePhoto = () => {
        // OCR 페이지로 이동
        navigate('/text-extraction-loading', {
            state: { image }
        });
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="page-container">
            <div className="use-photo-wrapper">
                <button className="use-photo-back-button" onClick={handleBack}>
                    <span className="mgc_left_fill"></span>
                </button>

                <div className="use-photo-image-preview-card">
                    {image ? (
                        <img
                            src={image}
                            alt="선택된 책 사진"
                            className="use-photo-book-image"
                        />
                    ) : (
                        <div className="use-photo-no-image">
                            <p>이미지를 불러올 수 없습니다.</p>
                        </div>
                    )}
                </div>

                <div className="use-photo-button-container">
                    <button
                        className="use-photo-action-button"
                        onClick={handleUsePhoto}
                        disabled={!image}
                    >
                        사진 사용하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UsePhotoPage;
