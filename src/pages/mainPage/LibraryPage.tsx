// src/pages/mainPage/LibraryPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LibraryPage.css';
import starFillIcon from '../../assets/icons/star_fill.svg';
import starLineIcon from '../../assets/icons/star_line.svg';

import { getAllBooks, type Book, type GetAllBooksQueryParams } from '../../api/bookApi';
import BookshelfList from '../../components/LibraryPage/LibraryPageList';
import LibraryPageGrid from '../../components/LibraryPage/LibraryPageGrid';
import TopBar from '../../components/TopBar';


export const StarRatingFullPage: React.FC<{ rating: number }> = ({ rating }) => {
  // 별점 계산 로직 (기존과 동일)
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  const starElements = [];

  // 채워진 별
  for (let i = 0; i < fullStars; i++) {
    starElements.push(
      <img
        key={`full-${i}`}
        src={starFillIcon}
        alt="filled star"
        className="star full"
      />
    );
  }

  if (hasHalfStar) {
    starElements.push(
      <img
        key="half"
        src={starFillIcon}
        alt="half star"
        className="star half"
        style={{ clipPath: 'inset(0 50% 0 0)' }}
      />
    );
  }

  for (let i = 0; i < emptyStars; i++) {
    starElements.push(
      <img
        key={`empty-${i}`}
        src={starLineIcon}
        alt="empty star"
        className="star empty"
      />
    );
  }

  return (
    <div className="star-rating-full-page">
      {starElements}
    </div>
  );
};

function LibraryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // fetchBooks 함수를 useCallback으로 감싸고, sortOrder가 변경될 때마다 재생성되도록 합니다.
  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams: GetAllBooksQueryParams = {
        page: 1,
        size: 10,
        sort: sortOrder,
      };
      const response = await getAllBooks(queryParams);

      if (response.isSuccess) {
        setBooks(response.result.memberBooks);
        setFilteredBooks(response.result.memberBooks);
      } else {
        setError(response.message || "책 목록을 가져오는데 실패했습니다.");
      }
    } catch (err: any) {
      setError("책 목록을 불러오는 중 오류가 발생했습니다: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [sortOrder]);

  // 검색 필터링 함수
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book =>
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [books]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks, location.key]);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [books, searchQuery, handleSearch]);

  const handleSortClick = useCallback(() => {
    setSortOrder(prevOrder => (prevOrder === 'newest' ? 'oldest' : 'newest'));
  }, []);

  const handleCreateBookClick = useCallback(() => {
    navigate('/book-search');
  }, [navigate]);

  const handleProfileClick = () => navigate('/my-page');

  const handleViewModeToggle = useCallback((mode: 'list' | 'grid') => {
    setViewMode(mode);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-page-container">
        <p>책장 데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-page-container">
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <TopBar onProfileClick={handleProfileClick} />

      <div className="header-margin"></div>

      {/* 책장 제목과 책 수 */}
      <div className="library-title-section">
        <h2 className="library-title">나의책장 <span className="book-count">{filteredBooks.length}</span></h2>
        <div className="view-toggle-buttons">
          <button
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => handleViewModeToggle('list')}
            aria-label="리스트 보기"
          >
            ☰
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => handleViewModeToggle('grid')}
            aria-label="그리드 보기"
          >
            ⊞
          </button>
        </div>
      </div>

      {/* 필터와 검색 섹션 */}
      <div className="filter-search-section">
        <div className="sort-options">
          <span
            className="sort-button"
            onClick={handleSortClick}
          >
            {sortOrder === 'newest' ? '최신순' : '오래된순'}
            <span className={sortOrder === 'newest' ? 'mgc_down_fill' : 'mgc_up_fill'}></span>
          </span>
        </div>
        <div className="search-input-container">
          <input
            type="text"
            placeholder="   텍스트를 입력하세요"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="book-search-input"
          />
        </div>
      </div>

      {filteredBooks.length === 0 && !isLoading && !error ? (
        <div className="no-books-message">
          {searchQuery ? (
            <p>검색 결과가 없습니다.</p>
          ) : (
            <p>등록된 책이 없습니다. 새로운 책을 등록해보세요!</p>
          )}
        </div>
      ) : (
        <div className={`books-container ${viewMode === 'grid' ? 'grid-view' : 'list-view'}`}>
          {viewMode === 'list' ? (
            <BookshelfList books={filteredBooks} />
          ) : (
            <LibraryPageGrid books={filteredBooks} />
          )}
        </div>
      )}

      <div className='main-page-margin'>
      </div>

      <div className="create-button-container">
        <button className="create-button" onClick={handleCreateBookClick}>
          + 등록하기
        </button>
      </div>
    </div>
  );
}

export default LibraryPage;
