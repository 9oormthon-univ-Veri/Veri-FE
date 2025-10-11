// src/pages/WritePostPage/WritePostPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './WritePostPage.css';
import type { BookItem } from '../../api/bookSearchApi';
import { createPost } from '../../api/communityApi';
import { uploadImage } from '../../api/imageApi';
import Toast from '../../components/Toast';

// 선택된 책 정보 타입 (memberBookId 포함)
interface SelectedBookInfo extends BookItem {
  memberBookId?: number;
}

function WritePostPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [selectedBook, setSelectedBook] = useState<SelectedBookInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // location.state에서 선택된 책 정보 받기
  useEffect(() => {
    if (location.state?.selectedBook) {
      setSelectedBook(location.state.selectedBook);
    }
  }, [location.state]);

  const handleBookSelection = () => {
    // 책 검색 페이지로 이동
    navigate('/post-book-search');
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

  // 책 선택 제거 핸들러
  const handleRemoveBook = () => {
    setSelectedBook(null);
  };

  // 글 올리기 핸들러
  const handleSubmit = async () => {
    if (!title.trim()) {
      showToast('제목을 입력해주세요.', 'warning');
      return;
    }

    if (!content.trim()) {
      showToast('내용을 입력해주세요.', 'warning');
      return;
    }

    if (!selectedBook) {
      showToast('책을 선택해주세요.', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      // 이미지 업로드
      const uploadedImageUrls: string[] = [];
      
      for (const file of imageFiles) {
        try {
          const imageUrl = await uploadImage(file);
          uploadedImageUrls.push(imageUrl);
        } catch (error) {
          console.error('이미지 업로드 실패:', error);
          showToast('이미지 업로드 중 오류가 발생했습니다.', 'error');
        }
      }

      // 게시글 작성 - bookId 포함
      const postData: any = {
        title: title.trim(),
        content: content.trim(),
        images: uploadedImageUrls,
      };

      // selectedBook의 memberBookId를 bookId로 전달
      if (selectedBook?.memberBookId) {
        postData.bookId = selectedBook.memberBookId;
      }

      console.log('게시글 작성 데이터:', postData);

      const response = await createPost(postData);

      if (response.isSuccess) {
        showToast('게시글이 작성되었습니다!', 'success');
        setTimeout(() => {
          navigate('/community');
        }, 1000);
      } else {
        showToast(response.message || '게시글 작성에 실패했습니다.', 'error');
      }
    } catch (error: any) {
      console.error('게시글 작성 중 오류:', error);
      showToast('게시글 작성 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="book-hint">내 책장에서 책을 선택해주세요</div>
          </div>
          
          {selectedBook ? (
            // 선택된 책 표시
            <div className="selected-book-card">
              <img src={selectedBook.imageUrl} alt={selectedBook.title} className="selected-book-image" />
              <div className="selected-book-info">
                <p className="selected-book-title">{selectedBook.title}</p>
                <p className="selected-book-author">{selectedBook.author}</p>
              </div>
              <button 
                className="remove-book-button"
                onClick={handleRemoveBook}
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          ) : (
            // 책 선택 버튼
            <button className="bookshelf-button" onClick={handleBookSelection}>
              <span>책 선택하기</span>
              <span className="mgc_right_fill"></span>
            </button>
          )}
        </div>

        {/* 글 올리기 버튼 */}
        <div className="submit-section">
          <button 
            className="submit-button"
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim() || !selectedBook}
          >
            {isSubmitting ? '작성 중...' : '글 올리기'}
          </button>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}

export default WritePostPage;
