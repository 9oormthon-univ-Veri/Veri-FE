// src/pages/BookDetailPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BookDetailPage.css';
import { MdArrowBackIosNew, MdEdit } from 'react-icons/md'; // MdArrowBackIosNew 아이콘 사용
import { MdKeyboardArrowRight } from 'react-icons/md'; // ✨ MdKeyboardArrowRight 아이콘 추가

import { getBookById, type Book, type CardItem } from '../api/bookApi';
import { StarRatingFullPage } from './MyBookshelfPage';

// EditPopup 더미 컴포넌트
const EditPopup: React.FC<any> = ({ isOpen, onClose, bookData, onSave }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
    }}>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '300px' }}>
        <h3>책 정보 수정</h3>
        <p>책 제목: {bookData.title}</p>
        <button onClick={() => onSave({ ...bookData, title: bookData.title + ' (수정됨)' })} style={{ marginRight: '10px' }}>저장 (더미)</button>
        <button onClick={onClose}>취소</button>
      </div>
    </div>
  );
};

// MyReadingCardSection 컴포넌트 업데이트
interface MyReadingCardSectionProps {
  cards: CardItem[];
}

const MyReadingCardSection: React.FC<MyReadingCardSectionProps> = ({ cards }) => {

  const handleSeeAllCards = useCallback(() => {
    // 모든 독서 카드 보기 페이지로 이동하는 로직
    // 예: navigate(`/book-detail/${bookId}/cards`);
    // 현재 bookId를 알 수 없으므로, 일단 더미 로직만
    alert('모든 독서 카드 보기 기능은 아직 구현되지 않았습니다.');
  }, []);

  return (
    <div className="my-reading-card-section">
      <div className="section-header">
        <h4>이 책의 독서카드</h4>
        <button className="see-all-button" onClick={handleSeeAllCards}>
          <span>전체보기</span>
          <MdKeyboardArrowRight size={20} />
        </button>
      </div>
      {cards.length > 0 ? (
        <div className="card-list">
          {cards.map((card, index) => (
            <div key={index} className="card-item-container">
              <img src={card.imageUrl} alt={`Reading Card ${index + 1}`} className="reading-card-image" />
            </div>
          ))}
        </div>
      ) : (
        <p className="no-cards-message">등록된 독서 카드가 없습니다.</p>
      )}
    </div>
  );
};


function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);

  const accessToken = "your_dummy_access_token";

  const fetchBookDetails = useCallback(async (memberBookId: number) => {
    setIsLoading(true);
    setError(null);
    setBook(null);

    try {
      const response = await getBookById(memberBookId);

      if (response.isSuccess && response.result) {
        const fetchedBook: Book = {
          bookId: response.result.bookId,
          title: response.result.title,
          author: response.result.author,
          imageUrl: response.result.imageUrl,
          rating: response.result.rating,
          status: response.result.status,
          date: "2023.01.01",
          cards: response.result.cards,
        };
        setBook(fetchedBook);
      } else {
        setError(response.message || "책 상세 정보를 가져오는데 실패했습니다.");
      }
    } catch (err: any) {
      setError("책 상세 정보를 불러오는 중 오류가 발생했습니다: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (id) {
      fetchBookDetails(Number(id));
    } else {
      setError("조회할 책 ID가 제공되지 않았습니다.");
      setIsLoading(false);
    }
  }, [id, fetchBookDetails]);

  const getAuthorAndTranslator = useCallback((fullAuthor: string) => {
    const parts = fullAuthor.split(' (지은이), ');
    const authorName = parts[0];
    const translatorName = parts[1] ? `(옮긴이) ${parts[1].replace('(옮긴이)', '')}` : '';
    return { author: authorName, translator: translatorName };
  }, []);

  const handleOpenEditPopup = useCallback(() => {
    setIsEditPopupOpen(true);
  }, []);

  const handleCloseEditPopup = useCallback(() => {
    setIsEditPopupOpen(false);
  }, []);

  const handleSaveBook = useCallback((updatedBook: Book) => {
    setBook(updatedBook);
    handleCloseEditPopup();
  }, [handleCloseEditPopup]);

  if (isLoading) {
    return (
      <div className="book-detail-page-container loading-state">책 정보를 불러오는 중...</div>
    );
  }

  if (error) {
    return (
      <div className="book-detail-page-container error-state">
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate(-1)} className="back-button">뒤로 가기</button>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-detail-page-container no-data-state">책 정보를 찾을 수 없습니다.</div>
    );
  }

  const { author, translator } = getAuthorAndTranslator(book.author);

  return (
    <div className="book-detail-page-container">
      <header className="detail-header">
        <button className="header-left-arrow" onClick={() => navigate(-1)}>
          <MdArrowBackIosNew size={24} color="#333" />
        </button>
        <h3>내가 읽은 책</h3>
        <div className="spacer"></div>
      </header>

      <div className="book-info-section">
        <div className="book-cover-detail-container">
          <img src={book.imageUrl || 'https://via.placeholder.com/150x225?text=No+Cover'} alt={book.title} className="book-cover-detail" />
        </div>

        <h2 className="book-detail-title">{book.title}</h2>
        <p className="book-detail-author-translator">
          {author} {translator}
        </p>

        <div className="setting-sections">
          <div className="my-rating-section">
            <span className="section-label">나의 별점</span>
            <StarRatingFullPage rating={book.rating} />
            <MdEdit size={16} color="#888" className="edit-icon" onClick={handleOpenEditPopup} />
          </div>

          <div className="start-date-section">
            <span className="section-label">시작일</span>
            <span className="start-date-value">{book.date}</span>
            <MdEdit size={16} color="#888" className="edit-icon" onClick={handleOpenEditPopup} />
          </div>
        </div>
      </div>

      <MyReadingCardSection cards={book.cards || []} />

      {book && (
        <EditPopup
          isOpen={isEditPopupOpen}
          onClose={handleCloseEditPopup}
          bookData={book}
          onSave={handleSaveBook}
        />
      )}
    </div>
  );
}

export default BookDetailPage;