// src/api/bookApi.ts
import { getAccessToken } from './auth';
import { 
  USE_MOCK_DATA, 
  mockDelay, 
  createMockResponse, 
  mockBooks, 
  mockSearchResults, 
  mockPopularBooks, 
  mockTodaysRecommendation 
} from './mock';

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

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
  startedAt: string | null;
  endedAt: string | null;
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
  startedAt: string | null;
  endedAt: string | null;
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
export type SearchMyBookResponse = BaseApiResponse<number>;

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

export interface SearchMyBookQueryParams {
  title: string;
  author: string;
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

// API 함수들
export const getAllBooks = async (
  params: GetAllBooksQueryParams
): Promise<GetAllBooksResponse> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return createMockResponse({
      memberBooks: mockBooks,
      page: params.page || 1,
      size: params.size || 10,
      totalElements: mockBooks.length,
      totalPages: Math.ceil(mockBooks.length / (params.size || 10)),
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
    const book = mockBooks.find(b => b.memberBookId === memberBookId);
    if (book) {
      return createMockResponse({
        memberBookId: book.memberBookId,
        title: book.title,
        author: book.author,
        imageUrl: book.imageUrl,
        status: book.status,
        score: book.score,
        startedAt: book.startedAt,
        endedAt: book.endedAt,
        cardSummaries: book.cardSummaries || []
      }, '목 책 상세 조회 성공');
    }
    return createMockResponse(null, '책을 찾을 수 없습니다.');
  }

  return makeApiRequest<GetBookByIdResponse>(`/api/v2/bookshelf/${memberBookId}`);
};

export const searchBooksByTitle = async (query: string): Promise<SearchBooksResponse> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    const result = mockSearchResults.filter(book => 
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase())
    );
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
      books: mockPopularBooks,
      page: params.page || 1,
      size: params.size || 10,
      totalElements: mockPopularBooks.length,
      totalPages: Math.ceil(mockPopularBooks.length / (params.size || 10)),
    }, '목 인기 도서 조회 성공');
  }

  const url = new URL('/api/v2/bookshelf/popular', BASE_URL);
  if (params.page !== undefined) url.searchParams.append('page', String(params.page));
  if (params.size !== undefined) url.searchParams.append('size', String(params.size));
  return makeApiRequest<GetPopularBooksResponse>(url.pathname + url.search);
};

export const getTodaysRecommendation = async (): Promise<GetTodaysRecommendationResponse> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return createMockResponse(mockTodaysRecommendation, '목 오늘의 추천 도서 조회 성공');
  }

  return makeApiRequest<GetTodaysRecommendationResponse>('/api/v2/bookshelf/recommendation/today');
};

export const createBook = async (bookData: CreateBookRequest): Promise<CreateBookResponse> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    const newBookId = Math.max(...mockBooks.map(b => b.memberBookId)) + 1;
    return createMockResponse({
      memberBookId: newBookId,
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
    return createMockResponse(mockBooks.length, '목 내 책 개수 조회 성공');
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

export const searchMyBook = async (
  params: SearchMyBookQueryParams
): Promise<SearchMyBookResponse> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    // Mock 데이터에서 제목과 저자로 검색
    const foundBook = mockBooks.find(book => 
      book.title.toLowerCase().includes(params.title.toLowerCase()) &&
      book.author.toLowerCase().includes(params.author.toLowerCase())
    );
    
    if (foundBook) {
      return createMockResponse(foundBook.memberBookId, '목 내 책장 검색 성공');
    }
    return createMockResponse(0, '검색 결과가 없습니다.', 'BOOK404');
  }

  const url = new URL('/api/v2/bookshelf/my/search', BASE_URL);
  url.searchParams.append('title', params.title);
  url.searchParams.append('author', params.author);
  
  return makeApiRequest<SearchMyBookResponse>(url.pathname + url.search);
};