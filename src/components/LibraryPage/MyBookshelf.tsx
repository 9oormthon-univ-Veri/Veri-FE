// src/pages/LibraryPage/MyBookshelf.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAllBooks, type Book, type GetAllBooksQueryParams } from '../../api/bookApi'; // API 임포트

// 개별 책장 아이템의 타입 정의
// Book 인터페이스와 호환되도록 조정
interface BookshelfItemType {
  id: string; // bookId
  coverUrl: string; // imageUrl
  title: string;
  author: string;
}

// 개별 책장 아이템을 렌더링하는 내부 컴포넌트
const SingleBookshelfItem: React.FC<BookshelfItemType> = ({ id, coverUrl, title, author }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/book-detail/${id}`); // 클릭 시 해당 책의 상세 페이지로 이동
  };

  return (
    <div className="bookshelf-item" onClick={handleClick}>
      <div className="book-cover-thumbnail">
        <img src={coverUrl || 'https://via.placeholder.com/100x150?text=No+Cover'} alt={title} onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/100x150?text=No+Cover"; }} />
      </div>
      <p className="book-title">{title}</p>
      <p className="book-author">{author}</p>
    </div>
  );
};

// '나의 책장' 섹션 전체를 담당하는 컴포넌트
const MyBookshelfSection: React.FC = () => {
  const navigate = useNavigate();
  const [bookshelfItems, setBookshelfItems] = useState<BookshelfItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams: GetAllBooksQueryParams = {
          offset: 0, // 필요에 따라 조정
          page: 1,   // 필요에 따라 조정
        };
        const response = await getAllBooks(queryParams); // getAllBooks API 호출 (accessToken 없음)

        if (response.isSuccess) {
          const mappedBooks: BookshelfItemType[] = response.result.books.map((book: Book) => ({
            id: String(book.bookId), // bookId를 string으로 변환
            coverUrl: book.imageUrl,
            title: book.title,
            author: book.author,
          }));
          // 최대 5개의 책만 표시하도록 제한 (UI 일관성을 위해)
          setBookshelfItems(mappedBooks.slice(0, 5));
        } else {
          setError(response.message || "책장 데이터를 가져오는데 실패했습니다.");
        }
      } catch (err: any) {
        console.error('책장 데이터를 불러오는 중 오류 발생:', err);
        setError(`책장 데이터를 불러오는 데 실패했습니다: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []); // 빈 배열은 컴포넌트가 처음 마운트될 때 한 번만 실행됨을 의미합니다.

  const handleGoToBookshelf = () => {
    navigate('/my-bookshelf');
  };

  if (isLoading) {
    return (
      <section className="my-bookshelf">
        <div className="section-header">
          <h3>나의 책장</h3>
          <span className="more-link" onClick={handleGoToBookshelf}>책장으로 가기 &gt;</span>
        </div>
        <div className="bookshelf-list horizontal-scroll-container">
          <p>책장 데이터를 불러오는 중...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="my-bookshelf">
        <div className="section-header">
          <h3>나의 책장</h3>
          <span className="more-link" onClick={handleGoToBookshelf}>책장으로 가기 &gt;</span>
        </div>
        <div className="bookshelf-list horizontal-scroll-container">
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="my-bookshelf">
      <div className="section-header">
        <h3>나의 책장</h3>
        <span className="more-link" onClick={handleGoToBookshelf}>책장으로 가기 &gt;</span>
      </div>
      <div className="bookshelf-list horizontal-scroll-container">
        {bookshelfItems.length > 0 ? (
          bookshelfItems.map((book) => (
            <SingleBookshelfItem
              key={book.id}
              id={book.id}
              coverUrl={book.coverUrl}
              title={book.title}
              author={book.author}
            />
          ))
        ) : (
          <p className="no-cards-message">등록된 책이 없습니다.</p>
        )}
      </div>
    </section>
  );
};

export default MyBookshelfSection;