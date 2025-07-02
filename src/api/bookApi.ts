// src/api/bookApi.ts

// auth.ts 파일에서 getAccessToken 함수를 임포트합니다.
import { getAccessToken } from './auth';

// ✨ 1. 목 데이터 파일을 임포트합니다.
import {
  mockAllBooksResponse,
  mockBookByIdResponse,
  mockSearchBooksResponse,
  mockTodaysRecommendation,
} from './mockData';

// 기존 인터페이스는 그대로 둡니다. (문제 없음)
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

export interface PopularBookItem {
  image: string; // imageUrl과 매핑될 필드
  title: string;
  author: string;
  publisher: string;
  isbn: string;
}

// 인기 도서 API 응답의 result 인터페이스
export interface PopularBooksResult {
  books: PopularBookItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// 인기 도서 API 전체 응답 인터페이스
export interface GetPopularBooksResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: PopularBooksResult;
}

// 인기 도서 API 쿼리 파라미터 인터페이스
export interface GetPopularBooksQueryParams {
  page?: number;
  size?: number;
}


// ==========================================================
//                 ⬇️ 개선된 API 호출 로직 ⬇️
// ==========================================================

// ✨ 2. 목 데이터 사용 여부를 결정하는 스위치를 만듭니다.
//     true로 설정하면 실제 API 호출 없이 목 데이터를 사용합니다.
export const USE_MOCK_DATA = true; // ✨ 개발 시에는 true, 백엔드 연동 시 false로 변경

const BASE_URL = "https://api.very.miensoap.me";

/**
 * 모든 API 호출에 인증 헤더를 자동으로 추가하는 헬퍼 함수
 * @param url 요청 URL
 * @param options fetch 요청 옵션
 * @returns fetch Response 객체
 */

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // 목 데이터 사용 시 로직은 그대로 둡니다. (여기서는 중요하지 않음)
  if (USE_MOCK_DATA) {
      // ... (USE_MOCK_DATA 처리 로직. 현재 getAllBooks에서 직접 목 데이터 반환하므로 여기는 영향 없음)
  }

  const accessToken = getAccessToken();
  
  const headers: Record<string, string> = { 
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
  };

  // ✨ accessToken이 있을 경우에만 Authorization 헤더를 추가합니다.
  if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
  } else {
      // ✨ 토큰이 없는데 인증이 필수인 API라면 여기서 에러를 throw하거나 로그인 페이지로 리다이렉트합니다.
      if (!USE_MOCK_DATA) {
           console.warn(`[fetchWithAuth] Access token is missing for URL: ${url}. This API call might fail if authentication is required.`);
           // throw new Error('Authentication required: No access token available. Please log in.');
           // 실제 서비스에서는 여기서 로그인 페이지로 리다이렉트하는 로직을 추가합니다.
           // navigate('/login'); // navigate는 이 스코프에 없으니 주의
      }
  }

  const response = await fetch(url, {
      ...options,
      headers: headers as HeadersInit, // 최종적으로 HeadersInit으로 단언하여 fetch에 전달
  });

  if (!response.ok) {
      let errorMessage = `API call failed: ${response.status}`;
      try {
          const errorData = await response.json();
          errorMessage += ` - ${errorData.message || response.statusText}`;
      } catch (e) {
          const text = await response.text();
          errorMessage += ` - ${text || response.statusText}`;
      }
      throw new Error(errorMessage);
  }

  return response;
};

/**
 * 모든 책을 가져오는 API
 */
export async function getAllBooks(
  params: GetAllBooksQueryParams): Promise<GetAllBooksResponse> {
  // ✨ 목 데이터를 사용할 경우, 실제 API 호출 대신 목 데이터를 반환합니다.
  if (USE_MOCK_DATA) {
    // 네트워크 지연을 흉내내기 위해 0.5초 지연시킵니다.
    return new Promise(resolve => setTimeout(() => resolve(mockAllBooksResponse), 500));
  }

  // 실제 API 호출 로직
  const url = new URL(`${BASE_URL}/api/v0/bookshelf/all`);
  if (params.offset !== undefined) {
    url.searchParams.append('offset', String(params.offset));
  }
  if (params.page !== undefined) {
    url.searchParams.append('page', String(params.page));
  }

  const response = await fetchWithAuth(url.toString(), {
    method: 'GET',
  });

  const data: GetAllBooksResponse = await response.json();
  return data;
}

/**
 * 특정 책을 ID로 가져오는 API
 */
export async function getBookById(
  memberBookId: number): Promise<GetBookByIdResponse> {
  // ✨ 목 데이터를 사용할 경우, 실제 API 호출 대신 목 데이터를 반환합니다.
  if (USE_MOCK_DATA) {
    // 특정 ID에 맞는 목 데이터를 반환하거나, 에러를 시뮬레이션할 수 있습니다.
    // 여기서는 memberBookId가 1일 때만 데이터가 있다고 가정합니다.
    const mockResult = memberBookId === 1 ? mockBookByIdResponse : {
      isSuccess: false,
      code: '404',
      message: '책을 찾을 수 없습니다.',
      result: null
    };
    return new Promise(resolve => setTimeout(() => resolve(mockResult), 500));
  }

  // 실제 API 호출 로직
  const url = new URL(`${BASE_URL}/api/v0/bookshelf/detail`);
  url.searchParams.append('memberBookId', String(memberBookId));

  const response = await fetchWithAuth(url.toString(), {
    method: 'GET',
  });

  const data: GetBookByIdResponse = await response.json();
  return data;
}

/**
 * 책 제목으로 검색하는 API
 */
export async function searchBooksByTitle(
  query: string): Promise<SearchBooksResponse> {
  // ✨ 목 데이터를 사용할 경우, 실제 API 호출 대신 목 데이터를 반환합니다.
  if (USE_MOCK_DATA) {
    // 쿼리에 따라 다른 결과를 반환하도록 로직을 추가할 수 있습니다.
    const mockResult = query.toLowerCase().includes('해리') ? mockSearchBooksResponse : {
      isSuccess: true,
      code: '1000',
      message: '검색 결과가 없습니다.',
      result: []
    };
    return new Promise(resolve => setTimeout(() => resolve(mockResult), 500));
  }

  // 실제 API 호출 로직
  const url = new URL(`${BASE_URL}/api/v0/bookshelf/search`);
  url.searchParams.append('title', query);

  const response = await fetchWithAuth(url.toString(), {
    method: 'GET',
  });

  const data: SearchBooksResponse = await response.json();
  return data;
}

/**
 * ✨ 오늘의 추천 도서를 가져오는 API 함수
 */
export async function getTodaysRecommendation(): Promise<GetTodaysRecommendationResponse> {
  // ✨ 목 데이터를 사용할 경우, 실제 API 호출 대신 목 데이터를 반환합니다.
  if (USE_MOCK_DATA) {
    return new Promise(resolve => {
      setTimeout(() => resolve({
        isSuccess: true,
        code: '1000',
        message: '요청에 성공하였습니다.',
        result: mockTodaysRecommendation
      }), 500);
    });
  }

  // 실제 API 호출 로직
  const url = `${BASE_URL}/api/v0/recommendation/today`;
  const response = await fetchWithAuth(url, {
    method: 'GET',
  });

  const data: GetTodaysRecommendationResponse = await response.json();
  return data;
}

// ... (기존 코드 생략) ...

/**
 * ✨ 랜덤으로 책 한 권을 가져오는 API 함수 (수정)
 */
export async function getRandomBook(): Promise<Book> {
  if (USE_MOCK_DATA) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const books = mockAllBooksResponse.result.books;
        if (books.length === 0) {
          reject(new Error("No books available in mock data."));
          return;
        }
        const randomIndex = Math.floor(Math.random() * books.length);
        const randomBook = books[randomIndex];

        // 💡 여기서 `!`를 추가하여 TypeScript에게 undefined가 아님을 확신시킨다.
        if (randomBook) { // 💡 또는 이렇게 조건문으로 undefined 여부를 검사하는 것이 더 안전합니다.
          resolve(randomBook);
        } else {
          reject(new Error("Failed to select a random book. The book at the random index was undefined."));
        }

      }, 500);
    });
  }

  throw new Error('Real API for getRandomBook not implemented.');
}

export async function getPopularBooks(
  params: GetPopularBooksQueryParams
): Promise<GetPopularBooksResponse> {
  if (USE_MOCK_DATA) {
    return new Promise(resolve => setTimeout(() => resolve({
      isSuccess: true,
      code: '1000',
      message: '목 인기 도서 조회 성공',
      result: {
        books: [
          // ✨ 이 부분의 URL을 변경합니다.
          { image: 'https://placehold.co/100x150?text=Popular+1', title: '인기 도서 1', author: '인기 작가 1', publisher: '인기 출판사 1', isbn: '1111' },
          { image: 'https://placehold.co/100x150?text=Popular+2', title: '인기 도서 2', author: '인기 작가 2', publisher: '인기 출판사 2', isbn: '2222' },
          { image: 'https://placehold.co/100x150?text=Popular+3', title: '인기 도서 3', author: '인기 작가 3', publisher: '인기 출판사 3', isbn: '3333' },
        ],
        page: params.page || 1,
        size: params.size || 10,
        totalElements: 3,
        totalPages: 1,
      }
    }), 500));
  }

  // 실제 API 호출 로직
  const url = new URL(`${BASE_URL}/api/v0/bookshelf/popular`);
  if (params.page !== undefined) {
    url.searchParams.append('page', String(params.page));
  }
  if (params.size !== undefined) {
    url.searchParams.append('size', String(params.size));
  }

  const response = await fetchWithAuth(url.toString(), {
    method: 'GET',
  });

  const data: GetPopularBooksResponse = await response.json();
  return data;
}