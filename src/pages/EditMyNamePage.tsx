// src/pages/EditMyNamePage.tsx
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditMyNamePage.css';

const EditMyNamePage: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [nickname, setNickname] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const onBack = () => navigate(-1);

    const openFilePicker = () => fileInputRef.current?.click();
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: API 연동 (프로필 이미지/닉네임 업로드)
        navigate(-1);
    };

    return (
        <div className="page-container edit-profile-page">
            <div className="edit-header">
                <button className="header-left-arrow" onClick={onBack} aria-label="뒤로가기">
                    <span className="mgc_left_fill"></span>
                </button>
                <h3>프로필 수정하기</h3>
                <div className="dummy-box"></div>
            </div>

            <form id="edit-profile-form" className="edit-form" onSubmit={onSubmit}>
                <div className="avatar-uploader" onClick={openFilePicker}>
                    {previewUrl ? (
                        <img src={previewUrl} alt="미리보기" />
                    ) : (
                        <div className="avatar-placeholder"></div>
                    )}
                    <div className="camera-chip">
                        <span className="mgc_camera_fill"></span>
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={onFileChange} hidden />
                </div>

                <div className="nickname-input-container">
                    <label className="input-label" htmlFor="nickname">닉네임</label>
                    <input
                        id="nickname"
                        className="text-input"
                        type="text"
                        placeholder="닉네임을 입력하세요"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                    />
                </div>
            </form>

            <div className="bottom-actions">
                <button type="submit" form="edit-profile-form" className="save-button">저장하기</button>
            </div>
        </div>
    );
};

export default EditMyNamePage;
