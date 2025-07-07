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
const SingleBookshelfItem: React.FC<BookshelfItemType> = React.memo(({ id, coverUrl, title, author }) => {
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
});

interface MyBookshelfSectionProps {
  books: any[];
}

const MyBookshelfSection: React.FC<MyBookshelfSectionProps> = React.memo(({ books }) => {
  const navigate = useNavigate();
  if (!books) {
    return null;
  }
  if (books.length === 0) {
    return (
      <section className="my-bookshelf">
        <div className="section-header">
          <h3>나의 책장</h3>
          <span className="more-link" onClick={() => navigate('/my-bookshelf')}>책장으로 가기 &gt;</span>
        </div>
        <div className="bookshelf-list horizontal-scroll-container">
          <p className="no-cards-message">등록된 책이 없습니다.</p>
        </div>
      </section>
    );
  }
  return (
    <section className="my-bookshelf">
      <div className="section-header">
        <h3>나의 책장</h3>
        <span className="more-link" onClick={() => navigate('/my-bookshelf')}>책장으로 가기 &gt;</span>
      </div>
      <div className="bookshelf-list horizontal-scroll-container">
        {books.map((book: any) => (
          <SingleBookshelfItem
            key={book.memberBookId}
            id={String(book.memberBookId)}
            coverUrl={book.imageUrl}
            title={book.title}
            author={book.author}
          />
        ))}
      </div>
    </section>
  );
});

export default MyBookshelfSection;