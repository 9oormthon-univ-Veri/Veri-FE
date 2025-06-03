// src/pages/BookDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBackIosNew } from 'react-icons/md'; // 뒤로가기 아이콘
import BookInfoSection from '../components/BookDetailPage/BookInfoSection'; // 책 정보 섹션 임포트
import MyReadingCardSection from '../components/LibraryPage/MyReadingCard';
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

  useEffect(() => {
    if (id) {
      // 실제 API 호출 또는 Mock 데이터에서 책 정보 가져오기
      // 여기서는 bookshelf.json에서 가져오는 예시를 유지합니다.
      // 실제 앱에서는 단일 책 정보를 가져오는 API를 호출하는 것이 좋습니다.
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
            setBook({
              ...foundBook,
            });
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

  if (isLoading) {
    return <div className="book-detail-page-container loading-state">책 정보를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="book-detail-page-container error-state" style={{ color: 'red' }}>{error}</div>;
  }

  if (!book) {
    return <div className="book-detail-page-container no-data-state">책 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="book-detail-page-container">
      <header className="detail-header">
        <div className="header-left-arrow" onClick={() => navigate(-1)}>
          <MdArrowBackIosNew size={24} color="#333" />
        </div>
        <h3>내가 읽은 책</h3>
        <div className="spacer">
        </div>
      </header>

      {/* 책 정보 섹션 */}
      <BookInfoSection book={book} />

      {/* 독서카드 섹션 */}
      <MyReadingCardSection />

    </div>
  );
}

export default BookDetailPage;