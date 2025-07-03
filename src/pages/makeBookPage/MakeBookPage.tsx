import React, { useState, useCallback, useEffect, useRef } from 'react'; // useRef 추가
import { useLocation, useNavigate } from 'react-router-dom';
import { MdArrowBackIosNew } from 'react-icons/md';

// OCR API (가정: 실제 OCR 연동 필요)
import { extractTextFromImage } from '../../api/ocrApi'; 
// 책 생성 API
import { createBook, type CreateBookRequest } from '../../api/bookApi'; 
// getAccessToken 함수 임포트
import { getAccessToken } from '../../api/auth';
// 이미지 업로드 API
import { uploadImage } from '../../api/imageApi'; // uploadImage 함수 임포트

import './MakeBookPage.css'; // 이 페이지를 위한 CSS 파일 (필요 시 생성)

const MakeBookPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // MakeCardPage에서 전달받은 책 표지 이미지 URL (초기에는 없을 수 있음)
  const { bookImageUrl: initialBookImageUrl } = location.state || {}; 

  // 책 정보 상태
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [isbn, setIsbn] = useState('');

  // UI 상태 관리
  const [currentBookImageUrl, setCurrentBookImageUrl] = useState<string | null>(initialBookImageUrl); // 현재 표시/사용될 이미지 URL
  const [isLoading, setIsLoading] = useState(false); // 책 등록 API 호출 중
  const [ocrLoading, setOcrLoading] = useState(false); // OCR 추출 중
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false); // 이미지 업로드 중 상태 추가
  const [uploadError, setUploadError] = useState<string | null>(null); // 이미지 업로드 에러 상태 추가

  const fileInputRef = useRef<HTMLInputElement>(null); // 파일 입력 참조

  // 페이지 로드 시 OCR 자동 실행 (초기 이미지 URL이 있을 경우)
  useEffect(() => {
    if (currentBookImageUrl) {
      handleExtractFromImage(currentBookImageUrl);
    }
  }, [currentBookImageUrl]); // currentBookImageUrl이 변경될 때마다 실행

  // OCR을 통해 이미지에서 책 정보를 추출하여 폼 필드에 자동 채우기
  // ✨ OCR 함수는 이제 currentBookImageUrl을 인자로 받습니다.
  const handleExtractFromImage = useCallback(async (imageUrl: string) => {
    if (!imageUrl) {
      setError('추출할 이미지가 없습니다. 다시 책 표지를 선택해주세요.');
      return;
    }
    setOcrLoading(true);
    setError(null); // 에러 초기화

    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        setError('인증 토큰이 없습니다. 로그인 후 다시 시도해주세요.');
        setOcrLoading(false);
        return;
      }

      const extractedText = await extractTextFromImage(imageUrl, accessToken); 
      console.log("OCR 추출된 전체 텍스트:", extractedText);

      const parsedTitle = extractedText.split('\n')[0] || ''; 
      const parsedAuthor = extractedText.split('\n')[1] || ''; 
      const parsedIsbnMatch = extractedText.match(/ISBN[- ]?(\d{3}[- ]?\d{1,5}[- ]?\d{1,7}[- ]?\d{1,6}[- ]?[\dX])/i);
      const parsedIsbn = (parsedIsbnMatch && parsedIsbnMatch[1]) ? parsedIsbnMatch[1].replace(/-/g, '') : '';
      
      setTitle(parsedTitle);
      setAuthor(parsedAuthor);
      setPublisher(''); // OCR 결과에 따라 적절히 파싱 필요
      setIsbn(parsedIsbn);
      
    } catch (err: any) {
      console.error('OCR 추출 중 오류 발생:', err);
      setError(`OCR 추출 실패: ${err.message}. 수동으로 입력해주세요.`);
    } finally {
      setOcrLoading(false);
    }
  }, []); // 의존성 배열에서 bookImageUrl 제거, 인자로 받음

  // ✨ 갤러리 이미지 선택 및 업로드 핸들러
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true); // 업로드 시작
      setUploadError(null);
      setError(null); // 다른 에러도 초기화

      try {
        const uploadedUrl = await uploadImage(file); // 파일 업로드
        setCurrentBookImageUrl(uploadedUrl); // Public URL 저장
        console.log('갤러리 이미지 업로드 성공:', uploadedUrl);
        // 이미지 업로드 성공 후 OCR 자동 실행 (useEffect에 의해)
      } catch (err: any) {
        console.error('갤러리 이미지 업로드 실패:', err);
        setUploadError(`갤러리 이미지 업로드 실패: ${err.message}`);
      } finally {
        setIsUploading(false); // 업로드 완료
      }
    }
  };

  // 폼 제출 (책 등록 API 호출)
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); 

    if (!currentBookImageUrl || !title || !author || !publisher || !isbn) {
      setError('모든 필드를 입력하고 책 표지 이미지를 선택해야 합니다.');
      return;
    }

    setIsLoading(true); 
    setError(null); 

    const bookData: CreateBookRequest = {
      title,
      image: currentBookImageUrl, // 현재 사용될 이미지 URL
      author,
      publisher,
      isbn,
    };

    try {
      const response = await createBook(bookData); 
      if (response.isSuccess && response.result) {
        console.log('책 등록 성공:', response.result);
        alert('책이 성공적으로 서재에 등록되었습니다!');
        navigate(`/my-bookshelf`); 
      } else {
        setError(`책 등록 실패: ${response.message || '알 수 없는 오류'}. 코드: ${response.code}`);
      }
    } catch (err: any) {
      console.error('책 등록 API 호출 중 오류:', err);
      setError(`책 등록 중 예상치 못한 오류 발생: ${err.message}`);
    } finally {
      setIsLoading(false); 
    }
  }, [title, author, publisher, isbn, currentBookImageUrl, navigate]);

  // 로딩 또는 에러 메시지 표시
  if (isUploading) {
    return (
      <div className="page-container">
        <div className="loading-overlay">
          <p>이미지 업로드 중...</p>
          {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="detail-header">
        <div className="header-left-arrow" onClick={() => navigate(-1)}>
          <MdArrowBackIosNew size={24} color="#333" />
        </div>
        <h3>새 책 정보 입력</h3>
        <div className="dummy-box" />
      </header>

      <div className="header-margin"></div> 

      <div className="make-book-page-content">
        <div className="book-image-preview-area">
          {currentBookImageUrl ? (
            <img 
              src={currentBookImageUrl} 
              alt="책 표지 미리보기" 
              className="book-cover-preview" 
              onError={e => {
                e.currentTarget.src = 'https://placehold.co/350x500/cccccc/333333?text=Image+Load+Failed';
                e.currentTarget.alt = '이미지 로드 실패';
              }}
            />
          ) : (
            <div className="no-image-message">
              <p>책 표지 이미지를 선택해주세요.</p>
            </div>
          )}
          
          <button 
            onClick={() => fileInputRef.current?.click()} // 파일 입력 필드 클릭
            disabled={isUploading || isLoading} 
            className="select-image-button"
          >
            {isUploading ? '업로드 중...' : '표지 이미지 선택'}
          </button>

          {/* OCR 추출 버튼은 이미지가 선택된 후에만 활성화 */}
          {currentBookImageUrl && (
            <button 
              onClick={() => handleExtractFromImage(currentBookImageUrl)} 
              disabled={ocrLoading || isLoading || !currentBookImageUrl} 
              className="extract-info-button"
            >
              {ocrLoading ? '정보 추출 중...' : '이미지에서 정보 추출'}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="book-details-form">
          <div className="form-group">
            <label htmlFor="title">제목</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="책 제목을 입력하세요"
              required
              disabled={isLoading || ocrLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="author">저자</label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="저자를 입력하세요"
              required
              disabled={isLoading || ocrLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="publisher">출판사</label>
            <input
              type="text"
              id="publisher"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              placeholder="출판사를 입력하세요"
              required
              disabled={isLoading || ocrLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="isbn">ISBN</label>
            <input
              type="text"
              id="isbn"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="ISBN을 입력하세요"
              required
              disabled={isLoading || ocrLoading}
            />
          </div>

          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="submit-button" disabled={isLoading || ocrLoading || !currentBookImageUrl}>
            {isLoading ? '등록 중...' : '책 서재에 추가'}
          </button>
        </form>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default MakeBookPage;
