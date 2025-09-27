// src/pages/WritePostPage/WritePostPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import { createPost } from '../../api/communityApi';
import type { CreatePostRequest } from '../../api/communityApi';
import { uploadImage } from '../../api/imageApi';
import './WritePostPage.css';

function WritePostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [bookId] = useState<number | undefined>(undefined); // 향후 책 연동 기능 구현 시 사용
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
        ...(bookId && { bookId }) // bookId가 있을 때만 포함
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

  const handleProfileClick = () => {
    navigate('/my-page');
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
      <TopBar onProfileClick={handleProfileClick} />
      
      <div className="header-margin"></div>
      
      <div className="write-post-content">
        {/* 헤더 */}
        <div className="write-post-header">
          <button className="back-button" onClick={handleBack}>
            <span className="back-icon">←</span>
            뒤로가기
          </button>
          <h1 className="page-title">글쓰기</h1>
          <button 
            className="submit-button"
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim()}
          >
            {isSubmitting ? '작성 중...' : '등록'}
          </button>
        </div>

        {/* 작성 폼 */}
        <div className="write-form">
          {/* 제목 입력 */}
          <div className="form-group">
            <label className="form-label">제목</label>
            <input
              type="text"
              className="title-input"
              placeholder="제목을 입력해주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <div className="character-count">{title.length}/100</div>
          </div>

          {/* 내용 입력 */}
          <div className="form-group">
            <label className="form-label">내용</label>
            <textarea
              className="content-textarea"
              placeholder="내용을 입력해주세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              maxLength={2000}
            />
            <div className="character-count">{content.length}/2000</div>
          </div>

          {/* 태그 입력 */}
          <div className="form-group">
            <label className="form-label">태그 (선택사항)</label>
            <input
              type="text"
              className="tags-input"
              placeholder="태그를 쉼표로 구분하여 입력해주세요 (예: 독서, 추천, 감상)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <div className="form-help">
              태그는 쉼표(,)로 구분하여 입력해주세요
            </div>
          </div>

          {/* 이미지 업로드 */}
          <div className="form-group">
            <label className="form-label">이미지 (선택사항)</label>
            
            {/* 이미지 미리보기 */}
            {images.length > 0 && (
              <div className="image-preview-container">
                {images.map((image, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={image} alt={`미리보기 ${index + 1}`} />
                    <button 
                      type="button"
                      className="remove-image-button"
                      onClick={() => handleRemoveImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* 파일 선택 영역 */}
            {images.length < 10 && (
              <div className="image-upload-area">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
                <label htmlFor="image-upload" className="upload-label">
                  <div className="upload-placeholder">
                    <span className="upload-icon">📷</span>
                    <p>이미지를 업로드하려면 클릭하세요</p>
                    <p className="upload-hint">JPG, PNG 파일만 업로드 가능합니다 (최대 10개)</p>
                  </div>
                </label>
              </div>
            )}
            
            {images.length >= 10 && (
              <div className="upload-limit-message">
                최대 10개의 이미지만 업로드할 수 있습니다.
              </div>
            )}
            
            {/* 업로드 상태 표시 */}
            {isUploadingImages && (
              <div className="upload-status">
                <p>이미지를 업로드하고 있습니다...</p>
              </div>
            )}
          </div>
        </div>

        {/* 하단 액션 버튼들 */}
        <div className="bottom-actions">
          <button 
            className="cancel-button"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            취소
          </button>
          <button 
            className="submit-button-large"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploadingImages || !title.trim() || !content.trim()}
          >
            {isUploadingImages ? '이미지 업로드 중...' : isSubmitting ? '작성 중...' : '게시글 등록'}
          </button>
        </div>
      </div>

      <div className='main-page-margin'></div>
    </div>
  );
}

export default WritePostPage;
