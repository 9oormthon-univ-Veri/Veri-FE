// src/pages/MyBookshelfPage.tsx
import { useNavigate } from 'react-router-dom';
import './MyBookshelfPage.css'; // 새로운 책장 페이지 전용 CSS

// 책 데이터 타입을 정의합니다.
interface BookItem {
  id: string;
  title: string;
  author: string;
  coverUrl: string; // 책 표지 이미지 URL
  rating: number; // 별점 (0~5)
  status: string; // 독서 상태 (예: '독서중')
  date: string; // 날짜
}

// 예시 책 데이터 (실제 프로젝트에서는 API 호출 등으로 가져옵니다)
const dummyBooks: BookItem[] = [
  {
    id: 'book1',
    title: '내게 남은 스물다섯 번의 계절',
    author: '슈테판 페퍼 (지은이), 전은경 (옮김이)',
    coverUrl: 'https://via.placeholder.com/80x120?text=Book1', // 임시 이미지
    rating: 4,
    status: '독서중',
    date: '2025.05.24'
  },
  {
    id: 'book2',
    title: '단 한번의 삶',
    author: '김영하',
    coverUrl: 'https://via.placeholder.com/80x120?text=Book2',
    rating: 3,
    status: '독서중',
    date: '2025.05.24'
  },
  {
    id: 'book3',
    title: '어린이는 멀리 간다',
    author: '김지은',
    coverUrl: 'https://via.placeholder.com/80x120?text=Book3',
    rating: 4,
    status: '독서중',
    date: '2025.05.24'
  },
  {
    id: 'book4',
    title: '내게 남은 스물다섯 번의 계절',
    author: '요시타케 신스케 (지은이), 고향욱 (옮김이)',
    coverUrl: 'https://via.placeholder.com/80x120?text=Book4',
    rating: 4,
    status: '독서중',
    date: '2025.05.24'
  },
  {
    id: 'book5',
    title: '내게 남은 스물다섯 번의 계절',
    author: '슈테판 페퍼 (지은이), 전은경 (옮김이)',
    coverUrl: 'https://via.placeholder.com/80x120?text=Book5',
    rating: 3,
    status: '독서중',
    date: '2025.05.24'
  },
  // 더 많은 책 데이터를 추가할 수 있습니다.
];

function MyBookshelfPage() {
  const navigate = useNavigate();

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'filled' : ''}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="my-bookshelf-page-container">
      <header className="bookshelf-header">
        <div className="header-left-arrow" onClick={() => navigate(-1)}>
          &lt; {/* 뒤로가기 아이콘 */}
        </div>
        <h3>나의 책장</h3>
        <div className="header-right-dots">
          ... {/* 점 3개 메뉴 아이콘 */}
        </div>
      </header>

      <div className="sort-options">
        <span className="sort-button">최신순 &gt;</span>
      </div>

      <div className="bookshelf-list-full">
        {dummyBooks.map((book) => (
          <div key={book.id} className="bookshelf-item-full">
            <div className="book-cover-large">
              <img src={book.coverUrl} alt={book.title} />
            </div>
            <div className="book-details-full">
              <h4 className="book-title-full">{book.title}</h4>
              <p className="book-author-full">{book.author}</p>
              <div className="book-rating">
                {renderStars(book.rating)}
              </div>
              <div className="book-status-info">
                <span className="book-status">{book.status}</span>
                <span className="book-date">{book.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="add-book-button-container">
        <button className="add-book-button">
          + 책 등록
        </button>
      </div>
    </div>
  );
}

export default MyBookshelfPage;