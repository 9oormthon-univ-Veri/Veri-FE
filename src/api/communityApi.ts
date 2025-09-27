// src/api/communityApi.ts
import { getAccessToken } from './auth';
import { 
  USE_MOCK_DATA, 
  mockDelay, 
  createMockResponse
} from './mock';

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || 'https://api.veri.me.kr';

// 타입 정의
export interface Post {
  postId: number;
  title: string;
  content: string;
  author: string;
  authorImage?: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  images?: string[];
  tags?: string[];
}

export interface PostFeedResponse {
  posts: Post[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface MyPostsResponse {
  posts: Post[];
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
export type GetPostFeedResponse = BaseApiResponse<PostFeedResponse>;
export type GetMyPostsResponse = BaseApiResponse<MyPostsResponse>;
export type CreatePostResponse = BaseApiResponse<number>;
export type DeletePostResponse = BaseApiResponse<Record<string, never>>;

// 쿼리 파라미터 타입들
export interface GetPostFeedQueryParams {
  page?: number;
  size?: number;
  sort?: 'newest' | 'oldest' | 'popular';
}

export interface GetMyPostsQueryParams {
  page?: number;
  size?: number;
  sort?: 'newest' | 'oldest' | 'popular';
}

// 게시글 작성 요청 타입
export interface CreatePostRequest {
  title: string;
  content: string;
  images: string[];
  bookId?: number;
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
  
  // 204 No Content 또는 빈 응답 본문 처리
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }
  
  // Content-Type이 JSON이 아닌 경우 처리
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    if (!text.trim()) {
      return {} as T;
    }
    // JSON이 아닌 텍스트 응답인 경우 에러로 처리하거나 적절히 변환
    throw new Error(`Expected JSON response, but got: ${contentType}`);
  }
  
  return response.json();
};

// Mock 데이터 생성
const createMockPosts = (): Post[] => [
  {
    postId: 1,
    title: "오늘 읽은 책에 대한 감상",
    content: "정말 좋은 책이었습니다. 특히 마지막 장면이 인상적이었어요.",
    author: "독서왕",
    authorImage: "/images/profileSample/sample_user.png",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    likeCount: 15,
    commentCount: 3,
    isLiked: false,
    images: ["/images/cardSample/forest.jpg"],
    tags: ["감상", "추천"]
  },
  {
    postId: 2,
    title: "새로 발견한 작가의 작품들",
    content: "이번에 새로 알게 된 작가인데, 작품 스타일이 정말 독특해요.",
    author: "책벌레",
    authorImage: "/images/profileSample/sample_user.png",
    createdAt: "2024-01-14T15:20:00Z",
    updatedAt: "2024-01-14T15:20:00Z",
    likeCount: 8,
    commentCount: 1,
    isLiked: true,
    images: ["/images/cardSample/sea.jpg", "/images/cardSample/sky.jpg"],
    tags: ["작가", "발견"]
  },
  {
    postId: 3,
    title: "독서 모임 후기",
    content: "이번 주 독서 모임에서 정말 좋은 이야기들을 나눴어요.",
    author: "독서모임장",
    authorImage: "/images/profileSample/sample_user.png",
    createdAt: "2024-01-13T20:45:00Z",
    updatedAt: "2024-01-13T20:45:00Z",
    likeCount: 22,
    commentCount: 7,
    isLiked: false,
    images: [],
    tags: ["모임", "후기"]
  }
];

// API 함수들

/**
 * 전체 게시글 목록 조회
 * 모든 사용자의 게시글 목록을 페이지네이션과 정렬 기준으로 조회합니다.
 * 
 * @param params - 쿼리 파라미터 (page, size, sort)
 * @returns 게시글 목록과 페이지네이션 정보
 */
export const getPostFeed = async (
  params: GetPostFeedQueryParams = {}
): Promise<GetPostFeedResponse> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    const mockPosts = createMockPosts();
    const page = params.page || 1;
    const size = params.size || 10;
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedPosts = mockPosts.slice(startIndex, endIndex);
    
    return createMockResponse({
      posts: paginatedPosts,
      page: page,
      size: size,
      totalElements: mockPosts.length,
      totalPages: Math.ceil(mockPosts.length / size),
    }, '목 전체 게시글 조회 성공');
  }

  const url = new URL('/api/v1/posts', BASE_URL);
  if (params.page !== undefined) url.searchParams.append('page', String(params.page));
  if (params.size !== undefined) url.searchParams.append('size', String(params.size));
  if (params.sort !== undefined) url.searchParams.append('sort', params.sort);

  return makeApiRequest<GetPostFeedResponse>(url.pathname + url.search);
};

/**
 * 내 게시글 목록 조회
 * 로그인한 사용자의 게시글 목록을 조회합니다.
 * 
 * @param params - 쿼리 파라미터 (page, size, sort)
 * @returns 내 게시글 목록과 페이지네이션 정보
 */
export const getMyPosts = async (
  params: GetMyPostsQueryParams = {}
): Promise<GetMyPostsResponse> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    const mockPosts = createMockPosts().slice(0, 2); // 내 게시글은 2개만 있다고 가정
    const page = params.page || 1;
    const size = params.size || 10;
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedPosts = mockPosts.slice(startIndex, endIndex);
    
    return createMockResponse({
      posts: paginatedPosts,
      page: page,
      size: size,
      totalElements: mockPosts.length,
      totalPages: Math.ceil(mockPosts.length / size),
    }, '목 내 게시글 조회 성공');
  }

  const url = new URL('/api/v1/posts/my', BASE_URL);
  if (params.page !== undefined) url.searchParams.append('page', String(params.page));
  if (params.size !== undefined) url.searchParams.append('size', String(params.size));
  if (params.sort !== undefined) url.searchParams.append('sort', params.sort);

  return makeApiRequest<GetMyPostsResponse>(url.pathname + url.search);
};

/**
 * 새 게시글 작성
 * 새로운 게시글을 작성합니다.
 * 
 * @param postData - 게시글 작성 데이터 (title, content, images, bookId)
 * @returns 생성된 게시글 ID
 */
export const createPost = async (
  postData: CreatePostRequest
): Promise<CreatePostResponse> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    const newPostId = Math.floor(Math.random() * 1000) + 100; // Mock 게시글 ID
    return createMockResponse(newPostId, '목 게시글 작성 성공');
  }

  return makeApiRequest<CreatePostResponse>('/api/v1/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
};

/**
 * 게시글 삭제
 * 게시글을 삭제합니다.
 * 
 * @param postId - 삭제할 게시글 ID
 * @returns 삭제 결과
 */
export const deletePost = async (
  postId: number
): Promise<DeletePostResponse> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return createMockResponse({}, '목 게시글 삭제 성공');
  }

  return makeApiRequest<DeletePostResponse>(`/api/v1/posts/${postId}`, {
    method: 'DELETE',
  });
};
