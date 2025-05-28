// src/pages/LibraryPage/MyBookshelf.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ---
// 개별 책장 아이템의 타입 정의
// ---
interface BookshelfItemType {
  id: string;
  coverUrl: string;
  title: string;
  author: string;
}

// ---
// 개별 책장 아이템을 렌더링하는 내부 컴포넌트
// ---
// 'navigate' 함수를 prop으로 직접 받는 대신, useNavigate 훅을 내부에서 사용하도록 변경
const SingleBookshelfItem: React.FC<BookshelfItemType> = ({ id, coverUrl, title, author }) => {
  const navigate = useNavigate(); // SingleBookshelfItem 내부에서 useNavigate 훅 사용
  const handleClick = () => {
    navigate(`/book-detail/${id}`); // 클릭 시 해당 책의 상세 페이지로 이동
  };

  return (
    // LibraryPage.css의 .bookshelf-item 클래스 적용
    <div className="bookshelf-item" onClick={handleClick}>
      <div className="book-cover-thumbnail">
        {/* coverUrl이 없을 경우를 대비한 폴백 이미지 */}
        <img src={coverUrl || 'https://via.placeholder.com/100x150?text=No+Cover'} alt={title} />
      </div>
      {/* LibraryPage.css의 .book-title과 .book-author에 말줄임표 스타일이 있으므로 긴 제목도 잘 처리됩니다. */}
      <p className="book-title">{title}</p>
      <p className="book-author">{author}</p>
    </div>
  );
};

// ---
// '나의 책장' 섹션 전체를 담당하는 컴포넌트
// ---
const MyBookshelfSection: React.FC = () => {
  const navigate = useNavigate();
  const [bookshelfItems, setBookshelfItems] = useState<BookshelfItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // public/datas/bookshelf.json 경로로 fetch 요청
    fetch('/datas/bookshelf.json')
      .then(response => {
        if (!response.ok) {
          // 네트워크 응답이 200 OK가 아니면 에러 발생 (예: 404 Not Found)
          throw new Error(`Network response was not ok: ${response.statusText}. Requested URL: /datas/bookshelf.json`);
        }
        return response.json();
      })
      .then((data: BookshelfItemType[]) => {
        setBookshelfItems(data);
        setIsLoading(false);
      })
      .catch(err => {
        // JSON 파싱 오류 또는 네트워크 오류 발생 시
        console.error('책장 데이터를 불러오는 중 오류 발생:', err);
        setError(`책장 데이터를 불러오는 데 실패했습니다: ${err.message}`);
        setIsLoading(false);
      });
  }, []); // 빈 배열은 컴포넌트가 처음 마운트될 때 한 번만 실행됨을 의미합니다.

  // "책장으로 가기" 버튼 클릭 시 전체 책장 페이지로 이동
  const handleGoToBookshelf = () => {
    navigate('/my-bookshelf');
  };

  // 로딩 상태 처리
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

  // 에러 상태 처리
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
    // LibraryPage.css의 section 공통 스타일 (예: .my-bookshelf)이 적용되는 곳
    <section className="my-bookshelf">
      <div className="section-header">
        <h3>나의 책장</h3>
        <span className="more-link" onClick={handleGoToBookshelf}>책장으로 가기 &gt;</span>
      </div>
      {/* LibraryPage.css의 .bookshelf-list와 .horizontal-scroll-container 클래스 적용 */}
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
          // 책장 데이터가 없을 때 표시할 메시지
          <p className="no-cards-message">등록된 책이 없습니다.</p>
        )}
      </div>
    </section>
  );
};

export default MyBookshelfSection;