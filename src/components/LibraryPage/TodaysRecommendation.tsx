// src/pages/LibraryPage/TodaysRecommendation.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getPopularBooks, type PopularBookItem, type GetPopularBooksQueryParams } from '../../api/bookApi';

// BookAddPage에서 기대하는 BookSearchResult 타입에 맞추어 RecommendedBookType을 조정합니다.
// BookSearchResult는 bookApi.ts에 정의되어 있습니다.
// 여기서는 PopularBookItem의 필드를 사용하여 BookSearchResult와 유사한 형태로 만듭니다.
interface RecommendedBookType {
  title: string;
  imageUrl: string; // PopularBookItem의 'image' 필드와 매핑됩니다.
  author: string;
  publisher: string; // PopularBookItem에는 'publisher' 필드가 있으므로 추가
  isbn: string; // PopularBookItem의 'isbn' 필드를 사용
}

// 개별 추천 책 아이템을 렌더링하는 내부 컴포넌트
const SingleRecommendedBookItem: React.FC<RecommendedBookType> = ({ title, imageUrl, author, publisher, isbn }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // BookAddPage로 이동 시 state에 BookSearchResult 타입의 객체를 전달합니다.
    navigate('/book-add', {
      state: {
        bookInfo: {
          title,
          imageUrl,
          author,
          publisher,
          isbn,
          // BookSearchResult에 다른 필드 (e.g., description, publishedDate)가 있다면,
          // PopularBookItem에서 해당 정보를 가져와 여기에 추가할 수 있습니다.
          // 현재 PopularBookItem에는 이 정보들이 없으므로, 필요하다면 API 응답을 확장해야 합니다.
        }
      }
    });
  };

  const fallbackImageUrl = 'https://placehold.co/80x120?text=No+Cover';
  return (
    <div className="recommended-book-item" onClick={handleClick}>
      <div className="book-cover-thumbnail">
        <img
          src={imageUrl || fallbackImageUrl} // imageUrl이 없으면 대체 이미지 사용
          alt={title}
          onError={(e) => {
            if (e.currentTarget.src !== fallbackImageUrl) {
              e.currentTarget.src = fallbackImageUrl;
            } else {
              console.warn(`이미지 로딩 실패: ${imageUrl}. 대체 이미지 ${fallbackImageUrl}도 실패.`);
            }
          }}
        />
      </div>
      <p className="book-title">{title}</p>
      <p className="book-author">{author}</p>
    </div>
  );
};

// '오늘의 추천' 섹션 전체를 담당하는 컴포넌트
const TodaysRecommendationSection: React.FC = () => {
  const [recommendedBooks, setRecommendedBooks] = useState<RecommendedBookType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams: GetPopularBooksQueryParams = {
          page: 1,
          size: 5,
        };
        const response = await getPopularBooks(queryParams);

        if (response.isSuccess && response.result && response.result.books) {
          // API 응답 데이터를 RecommendedBookType에 맞게 매핑
          const mappedBooks: RecommendedBookType[] = response.result.books.map((book: PopularBookItem) => ({
            title: book.title,
            imageUrl: book.image, // PopularBookItem의 'image' 필드를 'imageUrl'로 매핑
            author: book.author,
            publisher: book.publisher, // PopularBookItem의 'publisher' 필드 매핑
            isbn: book.isbn, // PopularBookItem의 'isbn' 필드 매핑
          }));
          setRecommendedBooks(mappedBooks);
        } else {
          setError(response.message || "오늘의 추천 도서를 가져오는데 실패했습니다.");
        }
      } catch (err: any) {
        console.error('추천 도서 데이터를 불러오는 중 오류 발생:', err);
        setError(`추천 도서를 불러오는 데 실패했습니다: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []); // 컴포넌트가 처음 마운트될 때 한 번만 실행

  if (isLoading) {
    return (
      <section className="todays-recommendation">
        <div className="recommendation-section-header">
          <p>오늘의 추천</p>
          <span className="more-text">오늘 가장 많이 읽은 책이에요</span>
        </div>
        <div className="recommendation-list horizontal-scroll-container">
          <p className="loading-message">오늘의 추천 데이터를 불러오는 중...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="todays-recommendation">
        <div className="recommendation-section-header">
          <p>오늘의 추천</p>
          <span className="more-text">오늘 가장 많이 읽은 책이에요</span>
        </div>
        <div className="recommendation-list horizontal-scroll-container">
          <p className="error-message">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="todays-recommendation">
      <div className="recommendation-section-header">
        <p>오늘의 추천</p>
        <span className="more-text">오늘 가장 많이 읽은 책이에요</span>
      </div>
      <div className="recommendation-list horizontal-scroll-container">
        {recommendedBooks.length > 0 ? (
          recommendedBooks.map((book) => (
            <SingleRecommendedBookItem
              key={book.isbn} // key로 isbn 사용
              title={book.title}
              imageUrl={book.imageUrl}
              author={book.author}
              publisher={book.publisher}
              isbn={book.isbn}
            />
          ))
        ) : (
          <p className="no-cards-message">추천 도서가 없습니다.</p>
        )}
      </div>
    </section>
  );
};

export default TodaysRecommendationSection;