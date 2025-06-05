import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBackIosNew, MdEdit } from 'react-icons/md';
import MyReadingCardSection from '../components/LibraryPage/MyReadingCard';
import { StarRatingFullPage } from './MyBookshelfPage';
import EditPopup from '../components/BookDetailPage/EditPopup';
import './BookDetailPage.css';

// 책 데이터 타입 정의 (필요에 따라 확장)
interface BookItem {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  rating: number;
  status: string;
  date: string; // 시작일
  translator?: string; // 역자 추가
  // 추가 정보 (줄거리 등)
}

function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<BookItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false); // 팝업 열림/닫힘 상태

  useEffect(() => {
    if (id) {
      fetch('/datas/bookshelf.json')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data: BookItem[]) => {
          const foundBook = data.find(b => b.id === id);
          if (foundBook) {
            setBook(foundBook);
          } else {
            setError('책을 찾을 수 없습니다.');
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error('책 상세 정보를 불러오는 중 오류 발생:', err);
          setError('책 상세 정보를 불러오는 데 실패했습니다.');
          setIsLoading(false);
        });
    }
  }, [id]);

  // 저자와 역자를 분리하는 로직
  const getAuthorAndTranslator = useCallback((fullAuthor: string) => {
    const parts = fullAuthor.split(' (지은이), ');
    const authorName = parts[0];
    const translatorName = parts[1] ? `(옮긴이) ${parts[1].replace('(옮긴이)', '')}` : '';
    return { author: authorName, translator: translatorName };
  }, []);

  // 수정 팝업 열기 핸들러
  const handleOpenEditPopup = useCallback(() => {
    setIsEditPopupOpen(true);
  }, []);

  // 수정 팝업 닫기 핸들러
  const handleCloseEditPopup = useCallback(() => {
    setIsEditPopupOpen(false);
  }, []);

  // 책 정보 저장 핸들러 (팝업에서 호출됨)
  const handleSaveBook = useCallback((updatedBook: BookItem) => {
    // 실제 백엔드 API에 업데이트 요청을 보내거나
    // 로컬 상태를 업데이트하는 로직을 여기에 추가합니다.
    setBook(updatedBook); // 현재 표시되는 책 정보 업데이트
    console.log('책 정보가 업데이트되었습니다:', updatedBook);
    handleCloseEditPopup(); // 저장 후 팝업 닫기
    // 실제 앱에서는 여기서 API 호출을 통해 서버에 변경 사항을 저장해야 합니다.
  }, [handleCloseEditPopup]); // handleCloseEditPopup이 의존성으로 추가되어야 합니다.

  if (isLoading) {
    return <div className="book-detail-page-container loading-state">책 정보를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="book-detail-page-container error-state" style={{ color: 'red' }}>{error}</div>;
  }

  if (!book) {
    return <div className="book-detail-page-container no-data-state">책 정보를 찾을 수 없습니다.</div>;
  }

  const { author, translator } = getAuthorAndTranslator(book.author);

  return (
    <div className="book-detail-page-container">
      <header className="detail-header">
        <div className="header-left-arrow" onClick={() => navigate(-1)}>
          <MdArrowBackIosNew size={24} color="#333" />
        </div>
        <h3>내가 읽은 책</h3>
        <div className="spacer"></div>
      </header>

      {/* BookInfoSection의 내용을 직접 포함 */}
      <div className="book-info-section">
        <div className="book-cover-detail-container">
          <img src={book.coverUrl || 'https://via.placeholder.com/150x225?text=No+Cover'} alt={book.title} className="book-cover-detail" />
        </div>

        <h2 className="book-detail-title">{book.title}</h2>
        <p className="book-detail-author-translator">
          {author} {translator}
        </p>

        <div className="setting-sections">
          <div className="my-rating-section">
            <span className="section-label">나의 별점</span>
            <StarRatingFullPage rating={book.rating} />
            {/* 수정 아이콘 클릭 시 팝업 열기 */}
            <MdEdit size={16} color="#888" className="edit-icon" onClick={handleOpenEditPopup} />
          </div>

          <div className="start-date-section">
            <span className="section-label">시작일</span>
            <span className="start-date-value">{book.date}</span>
            {/* 수정 아이콘 클릭 시 팝업 열기 */}
            <MdEdit size={16} color="#888" className="edit-icon" onClick={handleOpenEditPopup} />
          </div>
        </div>
        {/* 여기에 줄거리나 추가 정보 섹션 추가 가능 */}
      </div>

      {/* 독서카드 섹션 */}
      <MyReadingCardSection />

      {/* 책 수정 팝업 */}
      {book && ( // 책 데이터가 있을 때만 팝업을 렌더링
        <EditPopup
          isOpen={isEditPopupOpen}
          onClose={handleCloseEditPopup}
          bookData={book} // 현재 책 데이터를 팝업에 전달
          onSave={handleSaveBook} // 팝업에서 저장 시 호출될 함수
        />
      )}
    </div>
  );
}

export default BookDetailPage;