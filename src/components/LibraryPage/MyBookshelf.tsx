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
// 'navigate' 함수를 prop으로 받도록 수정
const SingleBookshelfItem: React.FC<BookshelfItemType & { navigate: (path: string) => void }> = ({ id, coverUrl, title, author, navigate }) => {
  const handleClick = () => {
    navigate(`/book-detail/${id}`); // 클릭 시 해당 책의 상세 페이지로 이동
  };

  return (
    <div className="bookshelf-item" onClick={handleClick} style={{ cursor: 'pointer' }}> {/* 클릭 가능하도록 cursor 스타일 추가 */}
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
    navigate('/my-bookshelf'); // "책장으로 가기" 버튼 클릭 시 전체 책장 페이지로 이동
  };

  if (isLoading) {
    return <p>책장 데이터를 불러오는 중...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return ( // ✨ 이 return 문 바로 앞에 불필요한 문자가 있는지 확인하세요.
    <section className="my-bookshelf">
      <div className="section-header">
        <h3>나의 책장</h3>
        <span className="more-link" onClick={handleGoToBookshelf}>책장으로 가기 &gt;</span>
      </div>
      {/* 여기에 horizontal-scroll-container 클래스 추가 */}
      <div className="bookshelf-list horizontal-scroll-container">
        {bookshelfItems.length > 0 ? (
          bookshelfItems.map((book) => (
            <SingleBookshelfItem
              key={book.id}
              id={book.id}
              coverUrl={book.coverUrl}
              title={book.title}
              author={book.author}
              navigate={navigate}
            />
          ))
        ) : (
          <p>등록된 책이 없습니다.</p>
        )}
      </div>
    </section>
  );
}; // ✨ 그리고 이 닫는 중괄호 이후에 불필요한 문자가 없는지 확인하세요.

export default MyBookshelfSection;