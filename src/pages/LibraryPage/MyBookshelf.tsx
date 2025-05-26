// src/pages/LibraryPage/MyBookshelf.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 개별 책장 아이템의 타입
interface BookshelfItemType {
  id: string;
  coverUrl: string;
  title: string;
  author: string;
}

// 개별 책장 아이템을 렌더링하는 내부 컴포넌트
const SingleBookshelfItem: React.FC<BookshelfItemType> = ({ coverUrl, title, author }) => {
  return (
    <div className="bookshelf-item">
      <div className="book-cover-thumbnail">
        <img src={coverUrl || 'https://via.placeholder.com/80x120?text=No+Cover'} alt={title} />
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
    // public/datas/bookshelf.json 경로로 fetch 요청
    fetch('/datas/bookshelf.json') // 현재 동작하는 경로
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then((data: BookshelfItemType[]) => {
        setBookshelfItems(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('책장 데이터를 불러오는 중 오류 발생:', err);
        setError('책장 데이터를 불러오는 데 실패했습니다.');
        setIsLoading(false);
      });
  }, []);

  const handleGoToBookshelf = () => {
    navigate('/my-bookshelf');
  };

  if (isLoading) {
    return <p>책장 데이터를 불러오는 중...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <section className="my-bookshelf">
      <div className="section-header">
        <h3>나의 책장</h3>
        <span className="more-link" onClick={handleGoToBookshelf}>책장으로 가기 &gt;</span>
      </div>
      <div className="bookshelf-list">
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
          <p>등록된 책이 없습니다.</p>
        )}
      </div>
    </section>
  );
};

export default MyBookshelfSection;