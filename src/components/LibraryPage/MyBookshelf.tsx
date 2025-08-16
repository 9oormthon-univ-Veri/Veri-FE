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

  const fallbackImageUrl = 'https://placehold.co/100x150?text=No+Cover';
  return (
    <div className="bookshelf-item" onClick={handleClick}>
      <div className="book-cover-thumbnail">
        <img
          src={coverUrl || fallbackImageUrl}
          alt={title}
          onError={(e) => {
            if (e.currentTarget.src !== fallbackImageUrl) {
              e.currentTarget.src = fallbackImageUrl;
            }
          }}
        />
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
          // API 스펙에 맞춰 page, size, sort를 사용하는 것이 좋습니다.
          page: 1,
          size: 5, // 최대 5개만 표시할 것이므로 size를 5로 설정 (API 호출 최적화)
          // offset은 API 스펙에 없으므로 제거하는 것이 좋습니다.
          // sort: 'newest', // 필요하다면 추가
        };
        
        const response = await getAllBooks(queryParams);

        if (response.isSuccess) {
          // ✨ 이 부분을 수정합니다: response.result && Array.isArray(response.result.memberBooks) 체크
          // ✨ 그리고 .books 대신 .memberBooks를 사용합니다.
          if (response.result && Array.isArray(response.result.memberBooks)) {
            const mappedBooks: BookshelfItemType[] = response.result.memberBooks.map((book: Book) => ({
              id: String(book.memberBookId),
              coverUrl: book.imageUrl,
              title: book.title,
              author: book.author,
            }));
            // 최대 5개의 책만 표시하도록 제한 (UI 일관성을 위해)
            setBookshelfItems(mappedBooks.slice(0, 5));
          } else {
            // isSuccess는 true지만, memberBooks 배열이 없거나 비어있는 경우
            console.warn("API는 성공을 반환했지만, 책 데이터(result.memberBooks)가 없거나 형식이 잘못되었습니다:", response);
            setBookshelfItems([]); // 빈 배열로 설정하여 오류 없이 "등록된 책이 없습니다." 메시지 표시
            setError("책장 데이터를 불러왔으나, 표시할 내용이 없습니다.");
          }
        } else {
          // API 호출이 isSuccess: false로 실패한 경우 (예: 인증 오류)
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
  }, []);

  const handleGoToBookshelf = () => {
    navigate('/my-bookshelf');
  };

  if (isLoading) {
    return (
      <section className="my-bookshelf">
        <div className="section-header">
          <p>나의 책장</p>
          <span className="more-link" onClick={handleGoToBookshelf}>책장으로 가기 &gt;</span>
        </div>
        <div className="bookshelf-list horizontal-scroll-container">
          <p className="loading-message">책장 데이터를 불러오는 중...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="my-bookshelf">
        <div className="section-header">
          <p>나의 책장</p>
          <span className="more-link" onClick={handleGoToBookshelf}>책장으로 가기 &gt;</span>
        </div>
        <div className="bookshelf-list horizontal-scroll-container">
          <p className="error-message">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="my-bookshelf">
      <div className="section-header">
        <p>나의 책장</p>
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