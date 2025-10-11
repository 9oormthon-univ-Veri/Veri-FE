// src/pages/WritePostPage/WritePostPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../../api/communityApi';
import type { CreatePostRequest } from '../../api/communityApi';
import { uploadImage } from '../../api/imageApi';
import './WritePostPage.css';

function WritePostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [selectedBook, setSelectedBook] = useState<{ id: number; title: string; author: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedImageUrls: string[] = [];

      // 이미지가 있는 경우 업로드
      if (imageFiles.length > 0) {
        setIsUploadingImages(true);
        try {
          const uploadPromises = imageFiles.map(file => uploadImage(file));
          uploadedImageUrls = await Promise.all(uploadPromises);
        } catch (uploadError) {
          console.error('이미지 업로드 실패:', uploadError);
          throw new Error('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
        } finally {
          setIsUploadingImages(false);
        }
      }

      const postData: CreatePostRequest = {
        title: title.trim(),
        content: content.trim(),
        images: uploadedImageUrls,
        ...(selectedBook && { bookId: selectedBook.id }) // 선택된 책이 있을 때만 포함
      };

      const response = await createPost(postData);

      if (response.isSuccess) {
        alert('게시글이 성공적으로 작성되었습니다!');
        navigate('/community');
      } else {
        throw new Error(response.message || '게시글 작성에 실패했습니다.');
      }
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '게시글 작성에 실패했습니다. 다시 시도해주세요.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookSelection = () => {
    // 책장 페이지로 이동 (선택된 책 정보를 전달)
    navigate('/library', { state: { selectMode: true, onBookSelect: setSelectedBook } });
  };

  // 이미지 파일 선택 핸들러
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newImages: string[] = [];
    const maxImages = 10; // 최대 10개 이미지

    for (let i = 0; i < Math.min(files.length, maxImages - imageFiles.length); i++) {
      const file = files[i];
      if (file && file.type.startsWith('image/')) {
        newFiles.push(file);

        // 미리보기를 위한 base64 변환
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string);
            if (newImages.length === newFiles.length) {
              setImages(prev => [...prev, ...newImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    }

    setImageFiles(prev => [...prev, ...newFiles]);
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="page-container">
      {/* 헤더 */}
      <header className="detail-header">
        <button className="header-left-arrow" onClick={() => navigate(-1)}>
          <span
            className="mgc_close_line"
          ></span>
        </button>
        <h3>글쓰기</h3>
        <div className="header-right-wrapper">
          <button
            className="header-menu-button"
          >
          </button>
        </div>
      </header>

      <div className="header-margin"></div>

      <div className="write-post-content">
        {/* 제목 입력 */}
        <div className="form-section">
          <input
            type="text"
            className="title-input"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* 내용 입력 */}
        <div className="form-section">
          <textarea
            className="content-input"
            placeholder="내용을 입력하세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
          />
        </div>

        {/* 이미지 섹션 */}
        <div className="image-section">
          <div className="image-grid">
            {/* 카메라 버튼 (첫 번째 슬롯) */}
            <div className="image-upload-slot">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload" className="post-page-camera-button">
                <span className="mgc_camera_2_fill"></span>
              </label>
            </div>

            {/* 업로드된 이미지들 */}
            {images.map((image, index) => (
              <div key={index} className="image-slot">
                <img src={image} alt={`업로드 ${index + 1}`} />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => handleRemoveImage(index)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 책 선택 섹션 */}
        <div className="book-section">
          <div className="book-label-section">          
            <div className="book-label">책 선택하기</div>
            <div className="book-hint">내 책장에서 책을 선택해주세요</div></div>
          <button className="bookshelf-button" onClick={handleBookSelection}>
            <span>책장 바로가기</span>
            <span className="mgc_right_fill"></span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default WritePostPage;
