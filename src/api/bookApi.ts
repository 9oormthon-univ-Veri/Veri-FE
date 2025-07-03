// src/api/bookApi.ts

import { getAccessToken } from './auth';
import {
  // mockAllBooksResponse,
  // // mockBookByIdResponse,
  // // mockSearchBooksResponse,
  // mockTodaysRecommendation,
} from './mockData';

export type BookStatus =  "NOT_START" |"READING" | "DONE";

export interface CardSummary {
  cardId: number;
  cardImage: string;
}

// Book 인터페이스: getAllBooks 응답 및 상세 정보에서 사용될 필드 포함
export interface Book {
  memberBookId: number;
  title: string;
  author: string;
  imageUrl: string;
  score: number;
  startedAt: string;
  status: BookStatus;
  cardSummaries?: CardSummary[]; // 상세 조회 시 포함될 수 있도록 추가
}

export interface BooksResult {
  memberBooks: Book[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface GetAllBooksResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: BooksResult;
}

export interface GetAllBooksQueryParams {
  page?: number;
  size?: number;
  sort?: string;
}

// GetBookByIdResponse 인터페이스: API 명세에 맞춰 score, startedAt, cardSummaries 포함
export interface GetBookByIdResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    memberBookId: number;
    title: string;
    author: string;
    imageUrl: string;
    status: BookStatus;
    score: number; // API 명세에 따라 'score'
    startedAt: string; // Book 인터페이스와의 일관성을 위해 추가 (API 명세에는 없었으나, 필요하다고 가정)
    cardSummaries: CardSummary[]; // API 명세에 따라 'cardSummaries'
  } | null;
}

export interface BookSearchResult {
  title: string;
  author: string;
  imageUrl: string;
  publisher: string;
  isbn: string;
}

export interface SearchBooksResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: BookSearchResult[];
}

export interface TodaysRecommendationBook {
  bookId: number;
  title: string;
  author: string;
  imageUrl: string;
}

export interface GetTodaysRecommendationResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: TodaysRecommendationBook[];
}

export interface PopularBookItem {
  image: string;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
}

export interface PopularBooksResult {
  books: PopularBookItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface GetPopularBooksResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: PopularBooksResult;
}

export interface GetPopularBooksQueryParams {
  page?: number;
  size?: number;
}

export const USE_MOCK_DATA = false;
const BASE_URL = "https://api.very.miensoap.me";

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const accessToken = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else if (!USE_MOCK_DATA) {
    console.warn(`[fetchWithAuth] Access token is missing for URL: ${url}. This API call might fail if authentication is required.`);
  }

  const response = await fetch(url, {
    ...options,
    headers: headers as HeadersInit,
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

export async function getAllBooks(
  params: GetAllBooksQueryParams): Promise<GetAllBooksResponse> {
  if (USE_MOCK_DATA) {
    return new Promise(resolve => setTimeout(() => resolve({
      isSuccess: true,
      code: '1000',
      message: '목 책장 조회 성공',
      result: {
        memberBooks: [
          { memberBookId: 1, title: '목 책 1', author: '목 작가 1', imageUrl: 'https://placehold.co/100x150?text=My+Book+1', score: 5, startedAt: '2025-07-01T10:00:00.000Z', status: 'READING' },
          { memberBookId: 3, title: '목 책 3', author: '목 작가 3', imageUrl: 'https://placehold.co/100x150?text=My+Book+3', score: 3, startedAt: '2025-05-15T10:00:00.000Z', status: 'DONE' },
        ],
        page: params.page || 1,
        size: params.size || 10,
        totalElements: 3,
        totalPages: 1,
      }
    }), 500));
  }

  const url = new URL(`${BASE_URL}/api/v0/bookshelf/all`);
  if (params.page !== undefined) url.searchParams.append('page', String(params.page));
  if (params.size !== undefined) url.searchParams.append('size', String(params.size));
  if (params.sort !== undefined) url.searchParams.append('sort', params.sort);

  const response = await fetchWithAuth(url.toString(), { method: 'GET' });
  const data: GetAllBooksResponse = await response.json();
  return data;
}

export async function getBookById(memberBookId: number): Promise<GetBookByIdResponse> {
  if (USE_MOCK_DATA) {
    const mockSuccessResult: GetBookByIdResponse = {
      isSuccess: true,
      code: '1000',
      message: '목 책 상세 조회 성공',
      result: {
        memberBookId: memberBookId,
        title: '목 책 상세 (ID: ' + memberBookId + ')',
        author: '목 작가 상세',
        imageUrl: 'https://placehold.co/200x300?text=Mock+Book+Detail',
        status: 'DONE',
        score: 5, // 'rating' 대신 'score' 사용
        startedAt: '2025-07-01T10:00:00.000Z', // 'startedAt' 필드 추가
        cardSummaries: [
          { cardId: 101, cardImage: 'https://placehold.co/100x100?text=Card1' },
          { cardId: 102, cardImage: 'https://placehold.co/100x100?text=Card2' },
        ]
      }
    };

    const mockNotFoundResult: GetBookByIdResponse = {
      isSuccess: false,
      code: '404',
      message: '책을 찾을 수 없습니다.',
      result: null
    };

    const resultToReturn = memberBookId === 1 ? mockSuccessResult : mockNotFoundResult;
    return new Promise(resolve => setTimeout(() => resolve(resultToReturn), 500));
  }

  const url = new URL(`${BASE_URL}/api/v0/bookshelf/detail`);
  url.searchParams.append('memberBookId', String(memberBookId));

  const response = await fetchWithAuth(url.toString(), { method: 'GET' });
  const data: GetBookByIdResponse = await response.json();
  return data;
}

export async function searchBooksByTitle(query: string): Promise<SearchBooksResponse> {
  if (USE_MOCK_DATA) {
    const mockResult: SearchBooksResponse = {
      isSuccess: true,
      code: '1000',
      message: '목 검색 결과',
      result: query.toLowerCase().includes('해리') ? [
        { title: '해리포터와 마법사의 돌', author: 'J.K. 롤링', imageUrl: 'https://placehold.co/100x150?text=Harry+Potter', publisher: '목 출판사', isbn: '978-1234567890' }
      ] : []
    };
    return new Promise(resolve => setTimeout(() => resolve(mockResult), 500));
  }

  const url = new URL(`${BASE_URL}/api/v0/bookshelf/search`);
  url.searchParams.append('title', query);

  const response = await fetchWithAuth(url.toString(), { method: 'GET' });
  const data: SearchBooksResponse = await response.json();
  return data;
}

// export async function getTodaysRecommendation(): Promise<GetTodaysRecommendationResponse> {
//   if (USE_MOCK_DATA) {
//     return new Promise(resolve => setTimeout(() => resolve({
//       isSuccess: true,
//       code: '1000',
//       message: '요청에 성공하였습니다.',
//       result: mockTodaysRecommendation
//     }), 500));
//   }

//   const url = `${BASE_URL}/api/v0/recommendation/today`;
//   const response = await fetchWithAuth(url, { method: 'GET' });
//   const data: GetTodaysRecommendationResponse = await response.json();
//   return data;
// }

// export async function getRandomBook(): Promise<Book> {
//   if (USE_MOCK_DATA) {
//     return new Promise((resolve, reject) => {
//       setTimeout(() => {
//         const books = mockAllBooksResponse.result.memberBooks; 
//         if (books.length === 0) {
//           reject(new Error("No books available in mock data."));
//           return;
//         }
//         const randomIndex = Math.floor(Math.random() * books.length);
//         const randomBook = books[randomIndex];
//         if (randomBook) {
//           resolve(randomBook);
//         } else {
//           reject(new Error("Failed to select a random book. The book at the random index was undefined."));
//         }
//       }, 500);
//     });
//   }
//   throw new Error('Real API for getRandomBook not implemented.');
// }

export async function getPopularBooks(params: GetPopularBooksQueryParams): Promise<GetPopularBooksResponse> {
  if (USE_MOCK_DATA) {
    return new Promise(resolve => setTimeout(() => resolve({
      isSuccess: true,
      code: '1000',
      message: '목 인기 도서 조회 성공',
      result: {
        books: [
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

  const url = new URL(`${BASE_URL}/api/v0/bookshelf/popular`);
  if (params.page !== undefined) url.searchParams.append('page', String(params.page));
  if (params.size !== undefined) url.searchParams.append('size', String(params.size));

  const response = await fetchWithAuth(url.toString(), { method: 'GET' });
  const data: GetPopularBooksResponse = await response.json();
  return data;
}

export interface CreateBookRequest {
  title: string;
  image: string;
  author: string;
  publisher: string;
  isbn: string;
}

export interface CreateBookResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    memberBookId: number;
    createdAt: string;
  } | null;
}

export async function createBook(bookData: CreateBookRequest): Promise<CreateBookResponse> {
  if (USE_MOCK_DATA) {
    return new Promise(resolve => setTimeout(() => resolve({
      isSuccess: true,
      code: '1000',
      message: '목 책 등록 성공',
      result: {
        memberBookId: Math.floor(Math.random() * 1000) + 1,
        createdAt: new Date().toISOString(),
      }
    }), 500));
  }

  const url = `${BASE_URL}/api/v0/bookshelf`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(bookData),
  });

  const data: CreateBookResponse = await response.json();
  return data;
}

export interface DeleteBookResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: Record<string, never>;
}

export async function deleteBook(memberBookId: number): Promise<DeleteBookResponse> {
  if (USE_MOCK_DATA) {
    return new Promise(resolve => setTimeout(() => resolve({
      isSuccess: true,
      code: '1000',
      message: '목 책 삭제 성공',
      result: {}
    }), 500));
  }

  const url = new URL(`${BASE_URL}/api/v0/bookshelf`);
  url.searchParams.append('memberBookId', String(memberBookId));

  const response = await fetchWithAuth(url.toString(), { method: 'DELETE' });
  const data: DeleteBookResponse = await response.json();
  return data;
}

export interface UpdateBookStatusResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: Record<string, never>;
}

export async function updateBookStatusToStart(memberBookId: number): Promise<UpdateBookStatusResponse> {
  if (USE_MOCK_DATA) {
    return new Promise(resolve => setTimeout(() => resolve({
      isSuccess: true,
      code: '1000',
      message: '목 책 읽기 시작 성공',
      result: {}
    }), 500));
  }

  const url = new URL(`${BASE_URL}/api/v0/bookshelf/status/start`);
  url.searchParams.append('memberBookId', String(memberBookId));

  const response = await fetchWithAuth(url.toString(), { method: 'PATCH' });
  const data: UpdateBookStatusResponse = await response.json();
  return data;
}

export async function updateBookStatusToOver(memberBookId: number): Promise<UpdateBookStatusResponse> {
  if (USE_MOCK_DATA) {
    return new Promise(resolve => setTimeout(() => resolve({
      isSuccess: true,
      code: '1000',
      message: '목 책 읽기 완료 성공',
      result: {}
    }), 500));
  }

  const url = new URL(`${BASE_URL}/api/v0/bookshelf/status/over`);
  url.searchParams.append('memberBookId', String(memberBookId));

  const response = await fetchWithAuth(url.toString(), { method: 'PATCH' });
  const data: UpdateBookStatusResponse = await response.json();
  return data;
}

export interface RateBookRequest {
  score: number;
}

export async function rateBook(memberBookId: number, score: number): Promise<UpdateBookStatusResponse> {
  if (USE_MOCK_DATA) {
    return new Promise(resolve => setTimeout(() => resolve({
      isSuccess: true,
      code: '1000',
      message: '목 책 평점 주기 성공',
      result: {}
    }), 500));
  }

  const url = new URL(`${BASE_URL}/api/v0/bookshelf/rate`);
  url.searchParams.append('memberBookId', String(memberBookId));

  const response = await fetchWithAuth(url.toString(), {
    method: 'PATCH',
    body: JSON.stringify({ score }),
  });

  const data: UpdateBookStatusResponse = await response.json();
  return data;
}

export interface GetMyBooksCountResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: number;
}

export async function getMyBooksCount(): Promise<GetMyBooksCountResponse> {
  if (USE_MOCK_DATA) {
    return new Promise(resolve => setTimeout(() => resolve({
      isSuccess: true,
      code: '1000',
      message: '목 내 책 개수 조회 성공',
      result: 5
    }), 500));
  }

  const url = `${BASE_URL}/api/v0/bookshelf/my/count`;
  const response = await fetchWithAuth(url, { method: 'GET' });
  const data: GetMyBooksCountResponse = await response.json();
  return data;
}