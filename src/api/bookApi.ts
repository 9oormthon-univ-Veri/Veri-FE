// src/api/bookApi.ts

export type BookStatus = "독서중" | "완독" | "읽고싶어요" | "미정";

export interface CardItem {
  imageUrl: string;
}

export interface Book {
  bookId: number;
  title: string;
  author: string;
  imageUrl: string;
  status: BookStatus;
  rating: number; // score 대신 rating 필드로 변경
  date: string;
  translator?: string;
  cards?: CardItem[];
}

export interface BooksResult {
  books: Book[];
}

export interface GetAllBooksResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: BooksResult;
}

export interface GetAllBooksQueryParams {
  offset?: number;
  page?: number;
}

export interface GetBookByIdResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    bookId: number;
    title: string;
    author: string;
    imageUrl: string;
    rating: number; // score 대신 rating 필드로 변경
    status: BookStatus;
    cards: CardItem[];
  } | null;
}

export interface BookSearchResult {
  title: string;
  author: string;
  imageUrl: string;
}

export interface SearchBooksResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: BookSearchResult[];
}

// ✨ 오늘의 추천 책을 위한 인터페이스 추가
export interface TodaysRecommendationBook {
  bookId: number;
  title: string;
  author: string;
  imageUrl: string;
}

// ✨ 오늘의 추천 API 응답 인터페이스 추가
export interface GetTodaysRecommendationResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: TodaysRecommendationBook[]; // 결과는 책 객체 배열
}


const BASE_URL = "https://your-api-base-url.com";

const mockBooksData: Book[] = [
  { bookId: 1, title: "해리포터와 죽음의 성물", author: "조앤 롤링 (지은이), 박진아 (옮긴이)", imageUrl: "https://placehold.co/100x150/ff9900/ffffff?text=HP1", status: "독서중", rating: 4.5, date: "2023.01.15" },
  { bookId: 2, title: "인간실격", author: "다자이 오사무 (지은이)", imageUrl: "https://placehold.co/100x150/0099ff/ffffff?text=Human", status: "완독", rating: 5.0, date: "2023.03.20" },
  { bookId: 3, title: "노인과 바다", author: "어니스트 헤밍웨이 (지은이)", imageUrl: "https://placehold.co/100x150/99ff00/ffffff?text=OldMan", status: "독서중", rating: 3.5, date: "2023.05.10" },
  { bookId: 4, title: "데미안", author: "헤르만 헤세 (지은이), 전영애 (옮긴이)", imageUrl: "https://placehold.co/100x150/ff0099/ffffff?text=Demian", status: "완독", rating: 4.0, date: "2023.07.01" },
  { bookId: 5, title: "어린 왕자", author: "앙투안 드 생텍쥐페리 (지은이)", imageUrl: "https://placehold.co/100x150/00ffff/000000?text=LittlePrince", status: "읽고싶어요", rating: 0.0, date: "2023.09.25" },
  { bookId: 6, title: "해리포터와 불의 잔", author: "조앤 롤링 (지은이), 김혜원 (옮긴이)", imageUrl: "https://placehold.co/100x150/800080/ffffff?text=HP4", status: "독서중", rating: 4.8, date: "2024.01.10" },
  { bookId: 7, title: "참을 수 없는 존재의 가벼움", author: "밀란 쿤데라 (지은이), 이재룡 (옮긴이)", imageUrl: "https://placehold.co/100x150/FF4500/ffffff?text=Unbearable", status: "완독", rating: 4.2, date: "2024.02.28" },
  { bookId: 8, title: "총, 균, 쇠", author: "재레드 다이아몬드 (지은이)", imageUrl: "https://placehold.co/100x150/20B2AA/ffffff?text=GunsGerms", status: "독서중", rating: 4.7, date: "2024.04.05" },
  { bookId: 9, title: "1984", author: "조지 오웰 (지은이), 정영목 (옮긴이)", imageUrl: "https://placehold.co/100x150/4682B4/ffffff?text=Nineteen", status: "읽고싶어요", rating: 0.0, date: "2024.06.01" }
];


export async function getAllBooks(
  params: GetAllBooksQueryParams): Promise<GetAllBooksResponse> {
  const url = new URL(`${BASE_URL}/api/v0/bookshelf/allHeaders`);
  if (params.offset !== undefined) {
    url.searchParams.append('offset', String(params.offset));
  }
  if (params.page !== undefined) {
    url.searchParams.append('page', String(params.page));
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      const mockResponse: GetAllBooksResponse = {
        isSuccess: true,
        code: "COMMON200",
        message: "성공입니다.",
        result: { books: mockBooksData }
      };
      resolve(mockResponse);
    }, 500);
  });
}

export async function getBookById(
  memberBookId: number): Promise<GetBookByIdResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const foundBook = mockBooksData.find(b => b.bookId === memberBookId);

      const detailedBookResponse = foundBook ? {
        bookId: foundBook.bookId,
        title: foundBook.title,
        author: foundBook.author,
        imageUrl: foundBook.imageUrl,
        rating: foundBook.rating,
        status: foundBook.status,
        cards: [
          { imageUrl: "https://placehold.co/150x100/A0BBEA/FFFFFF?text=Card1" },
          { imageUrl: "https://placehold.co/150x100/C8A2C8/FFFFFF?text=Card2" },
          { imageUrl: "https://placehold.co/150x100/FFD700/000000?text=Card3" }
        ]
      } : null;

      const mockResponse: GetBookByIdResponse = detailedBookResponse
        ? {
            isSuccess: true,
            code: "COMMON200",
            message: "성공입니다.",
            result: detailedBookResponse
          }
        : {
            isSuccess: false,
            code: "BOOK_NOT_FOUND",
            message: "책을 찾을 수 없습니다.",
            result: null
          };
      resolve(mockResponse);
    }, 800);
  });
}

export async function searchBooksByTitle(
  query: string): Promise<SearchBooksResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerCaseQuery = query.toLowerCase();
      const filteredBooks: BookSearchResult[] = mockBooksData
        .filter(book => book.title.toLowerCase().includes(lowerCaseQuery))
        .map(book => ({
          title: book.title,
          author: book.author,
          imageUrl: book.imageUrl
        }));

      const mockResponse: SearchBooksResponse = {
        isSuccess: true,
        code: "COMMON200",
        message: "성공입니다.",
        result: filteredBooks
      };
      resolve(mockResponse);
    }, 500);
  });
}

// ✨ 오늘의 추천 도서를 가져오는 API 함수 추가
export async function getTodaysRecommendation(): Promise<GetTodaysRecommendationResponse> {
  const url = `${BASE_URL}/api/v0/bookshelf/today`;

  return new Promise((resolve) => {
    setTimeout(() => {
      // mockBooksData에서 임의로 2-3권의 책을 오늘의 추천으로 반환
      const recommended = [
        { bookId: 2, title: "인간실격", author: "다자이 오사무", imageUrl: "https://placehold.co/100x150/0099ff/ffffff?text=Human" },
        { bookId: 3, title: "노인과 바다", author: "어니스트 헤밍웨이", imageUrl: "https://placehold.co/100x150/99ff00/ffffff?text=OldMan" },
        { bookId: 8, title: "총, 균, 쇠", author: "재레드 다이아몬드", imageUrl: "https://placehold.co/100x150/20B2AA/ffffff?text=GunsGerms" },
      ];

      const mockResponse: GetTodaysRecommendationResponse = {
        isSuccess: true,
        code: "COMMON200",
        message: "성공입니다.",
        result: recommended
      };
      resolve(mockResponse);
    }, 600); // 약간의 지연
  });
}