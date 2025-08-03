// src/api/bookApi.ts
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;
import { getAccessToken } from './auth';

// 타입 정의
export type BookStatus = "NOT_START" | "READING" | "DONE";

export interface CardSummary {
  cardId: number;
  cardImage: string;
}

export interface Book {
  memberBookId: number;
  title: string;
  author: string;
  imageUrl: string;
  score: number;
  startedAt: string;
  endedAt: string;
  status: BookStatus;
  cardSummaries?: CardSummary[];
}

export interface BooksResult {
  memberBooks: Book[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface BookSearchResult {
  title: string;
  author: string;
  imageUrl: string;
  publisher: string;
  isbn: string;
}

export interface TodaysRecommendationBook {
  bookId: number;
  title: string;
  author: string;
  imageUrl: string;
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

// 공통 응답 타입
interface BaseApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

// 구체적인 응답 타입들
export type GetAllBooksResponse = BaseApiResponse<BooksResult>;
export type GetBookByIdResponse = BaseApiResponse<{
  memberBookId: number;
  title: string;
  author: string;
  imageUrl: string;
  status: BookStatus;
  score: number;
  startedAt: string;
  endedAt: string;
  cardSummaries: CardSummary[];
} | null>;
export type SearchBooksResponse = BaseApiResponse<BookSearchResult[]>;
export type GetTodaysRecommendationResponse = BaseApiResponse<TodaysRecommendationBook[]>;
export type GetPopularBooksResponse = BaseApiResponse<PopularBooksResult>;
export type CreateBookResponse = BaseApiResponse<{
  memberBookId: number;
  createdAt: string;
} | null>;
export type DeleteBookResponse = BaseApiResponse<Record<string, never>>;
export type UpdateBookStatusResponse = BaseApiResponse<Record<string, never>>;
export type GetMyBooksCountResponse = BaseApiResponse<number>;

// 쿼리 파라미터 타입들
export interface GetAllBooksQueryParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface GetPopularBooksQueryParams {
  page?: number;
  size?: number;
}

export interface CreateBookRequest {
  title: string;
  image: string;
  author: string;
  publisher: string;
  isbn: string;
}

export interface UpdateBookStatusRequest {
  score: number;
  startedAt: string;
  endedAt: string;
}

export interface UpdateBookContentRequest {
  title?: string;
  image?: string;
  author?: string;
  publisher?: string;
  isbn?: string;
}

export interface RateBookRequest {
  score: number;
}

// 설정
export const USE_MOCK_DATA = false;

// 유틸리티 함수들
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const accessToken = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else if (!USE_MOCK_DATA) {
    console.warn(`[fetchWithAuth] Access token is missing for URL: ${url}`);
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
    } catch {
      const text = await response.text();
      errorMessage += ` - ${text || response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  return response;
};

const makeApiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, options);
  return response.json();
};

const createMockResponse = <T>(
  result: T, 
  message: string = 'Mock 성공'
): BaseApiResponse<T> => ({
  isSuccess: true,
  code: '1000',
  message,
  result
});

const mockDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// API 함수들
export const getAllBooks = async (
  params: GetAllBooksQueryParams
): Promise<GetAllBooksResponse> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return createMockResponse({
      memberBooks: [
        { 
          memberBookId: 1, 
          title: '목 책 1', 
          author: '목 작가 1', 
          imageUrl: 'https://placehold.co/100x150?text=My+Book+1', 
          score: 5, 
          startedAt: '2025-07-01T10:00:00.000Z', 
          endedAt: '2025-07-01T10:00:00.000Z', 
          status: 'READING' 
        },
        { 
          memberBookId: 3, 
          title: '목 책 3', 
          author: '목 작가 3', 
          imageUrl: 'https://placehold.co/100x150?text=My+Book+3', 
          score: 3, 
          startedAt: '2025-05-15T10:00:00.000Z', 
          endedAt: '2025-07-01T10:00:00.000Z', 
          status: 'DONE' 
        },
      ],
      page: params.page || 1,
      size: params.size || 10,
      totalElements: 3,
      totalPages: 1,
    }, '목 책장 조회 성공');
  }

  const url = new URL('/api/v2/bookshelf/my', BASE_URL);
  if (params.page !== undefined) url.searchParams.append('page', String(params.page));
  if (params.size !== undefined) url.searchParams.append('size', String(params.size));
  if (params.sort !== undefined) url.searchParams.append('sort', params.sort);

  return makeApiRequest<GetAllBooksResponse>(url.pathname + url.search);
};

export const getBookById = async (memberBookId: number): Promise<GetBookByIdResponse> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    if (memberBookId === 1) {
      return createMockResponse({
        memberBookId,
        title: `목 책 상세 (ID: ${memberBookId})`,
        author: '목 작가 상세',
        imageUrl: 'https://placehold.co/200x300?text=Mock+Book+Detail',
        status: 'DONE',
        score: 5,
        startedAt: '2025-07-01T10:00:00.000Z',
        endedAt: '2025-07-10T10:00:00.000Z',
        cardSummaries: [
          { cardId: 101, cardImage: 'https://placehold.co/100x100?text=Card1' },
          { cardId: 102, cardImage: 'https://placehold.co/100x100?text=Card2' },
        ]
      }, '목 책 상세 조회 성공');
    }
    return createMockResponse(null, '책을 찾을 수 없습니다.');
  }

  return makeApiRequest<GetBookByIdResponse>(`/api/v2/bookshelf/${memberBookId}`);
};

export const searchBooksByTitle = async (query: string): Promise<SearchBooksResponse> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    const result = query.toLowerCase().includes('해리') ? [
      { 
        title: '해리포터와 마법사의 돌', 
        author: 'J.K. 롤링', 
        imageUrl: 'https://placehold.co/100x150?text=Harry+Potter', 
        publisher: '목 출판사', 
        isbn: '978-1234567890' 
      }
    ] : [];
    return createMockResponse(result, '목 검색 결과');
  }

  const url = new URL('/api/v2/bookshelf/search', BASE_URL);
  url.searchParams.append('title', query);
  return makeApiRequest<SearchBooksResponse>(url.pathname + url.search);
};

export const getPopularBooks = async (
  params: GetPopularBooksQueryParams
): Promise<GetPopularBooksResponse> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return createMockResponse({
      books: [
        { image: 'https://placehold.co/100x150?text=Popular+1', title: '인기 도서 1', author: '인기 작가 1', publisher: '인기 출판사 1', isbn: '1111' },
        { image: 'https://placehold.co/100x150?text=Popular+2', title: '인기 도서 2', author: '인기 작가 2', publisher: '인기 출판사 2', isbn: '2222' },
        { image: 'https://placehold.co/100x150?text=Popular+3', title: '인기 도서 3', author: '인기 작가 3', publisher: '인기 출판사 3', isbn: '3333' },
      ],
      page: params.page || 1,
      size: params.size || 10,
      totalElements: 3,
      totalPages: 1,
    }, '목 인기 도서 조회 성공');
  }

  const url = new URL('/api/v2/bookshelf/popular', BASE_URL);
  if (params.page !== undefined) url.searchParams.append('page', String(params.page));
  if (params.size !== undefined) url.searchParams.append('size', String(params.size));
  return makeApiRequest<GetPopularBooksResponse>(url.pathname + url.search);
};

export const createBook = async (bookData: CreateBookRequest): Promise<CreateBookResponse> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return createMockResponse({
      memberBookId: Math.floor(Math.random() * 1000) + 1,
      createdAt: new Date().toISOString(),
    }, '목 책 등록 성공');
  }

  return makeApiRequest<CreateBookResponse>('/api/v2/bookshelf', {
    method: 'POST',
    body: JSON.stringify(bookData),
  });
};

export const deleteBook = async (memberBookId: number): Promise<DeleteBookResponse> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return createMockResponse({}, '목 책 삭제 성공');
  }

  return makeApiRequest<DeleteBookResponse>(`/api/v2/bookshelf/${memberBookId}`, {
    method: 'DELETE'
  });
};

export const updateBookStatusToStart = async (memberBookId: number): Promise<UpdateBookStatusResponse> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return createMockResponse({}, '목 책 읽기 시작 성공');
  }

  return makeApiRequest<UpdateBookStatusResponse>(`/api/v2/bookshelf/${memberBookId}/status/start`, {
    method: 'PATCH'
  });
};

export const updateBookStatusToOver = async (memberBookId: number): Promise<UpdateBookStatusResponse> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return createMockResponse({}, '목 책 읽기 완료 성공');
  }

  return makeApiRequest<UpdateBookStatusResponse>(`/api/v2/bookshelf/${memberBookId}/status/over`, {
    method: 'PATCH'
  });
};

export const rateBook = async (memberBookId: number, score: number): Promise<UpdateBookStatusResponse> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return createMockResponse({}, '목 책 평점 주기 성공');
  }

  return makeApiRequest<UpdateBookStatusResponse>(`/api/v2/bookshelf/${memberBookId}/rate`, {
    method: 'PATCH',
    body: JSON.stringify({ score }),
  });
};

export const updateBookContent = async (
  memberBookId: number, 
  bookData: UpdateBookContentRequest
): Promise<UpdateBookStatusResponse> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return createMockResponse({}, '목 책 내용 수정 성공');
  }

  return makeApiRequest<UpdateBookStatusResponse>(`/api/v2/bookshelf/${memberBookId}/modify`, {
    method: 'PATCH',
    body: JSON.stringify(bookData),
  });
};

export const getMyBooksCount = async (): Promise<GetMyBooksCountResponse> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return createMockResponse(5, '목 내 책 개수 조회 성공');
  }

  return makeApiRequest<GetMyBooksCountResponse>('/api/v2/bookshelf/my/count');
};

export const updateBookStatus = async (
  memberBookId: number,
  data: UpdateBookStatusRequest
): Promise<UpdateBookStatusResponse> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return createMockResponse({}, 'Mock 책 상태 수정 성공');
  }

  return makeApiRequest<UpdateBookStatusResponse>(`/api/v2/bookshelf/${memberBookId}/modify`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};