// src/components/BookDetail/BookInfoSection.tsx
import React from 'react';
import { StarRatingFullPage } from '../../pages/MyBookshelfPage'; // 별점 컴포넌트 재사용
import './BookInfoSection.css';
import { MdEdit } from 'react-icons/md'; // 수정 아이콘

interface BookItem {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  rating: number;
  status: string;
  date: string; // 시작일
  translator?: string; // 역자 (옵션)
}

interface BookInfoSectionProps {
  book: BookItem;
}

const BookInfoSection: React.FC<BookInfoSectionProps> = ({ book }) => {
  const [author, translator] = book.author.split(' (지은이), ');
  const displayTranslator = translator ? `(옮긴이) ${translator.replace('(옮긴이)', '')}` : '';

  return (
    <div className="book-info-section">
      <div className="book-cover-detail-container">
        <img src={book.coverUrl || 'https://via.placeholder.com/150x225?text=No+Cover'} alt={book.title} className="book-cover-detail" />
      </div>

      <h2 className="book-detail-title">{book.title}</h2>
      <p className="book-detail-author-translator">
        {author} {displayTranslator}
      </p>

      <div className="my-rating-section">
        <span className="section-label">나의 별점</span>
        <StarRatingFullPage rating={book.rating} />
        <MdEdit size={16} color="#888" className="edit-icon" /> {/* 수정 아이콘 */}
      </div>

      <div className="start-date-section">
        <span className="section-label">시작일</span>
        <span className="start-date-value">{book.date}</span>
        <MdEdit size={16} color="#888" className="edit-icon" /> {/* 수정 아이콘 */}
      </div>

      {/* 여기에 줄거리나 추가 정보 섹션 추가 가능 */}
    </div>
  );
};

export default BookInfoSection;