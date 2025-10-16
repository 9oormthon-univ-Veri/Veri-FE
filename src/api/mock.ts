// src/api/mock.ts

// 목업 데이터 설정
export const USE_MOCK_DATA = false; // 개발 시 true로 설정

// 공통 응답 타입
export interface MockApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

// 목업 지연 시간 (실제 API 호출 시뮬레이션)
export const mockDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// 목업 응답 생성 유틸리티
export const createMockResponse = <T>(
  result: T, 
  message: string = 'Mock 성공',
  code: string = '1000'
): MockApiResponse<T> => ({
  isSuccess: true,
  code,
  message,
  result
});

// 목업 에러 응답 생성
export const createMockError = (
  message: string = 'Mock 오류',
  code: string = '5000'
): MockApiResponse<null> => ({
  isSuccess: false,
  code,
  message,
  result: null
});

// 목업 사용자 데이터
export const mockUser = {
  email: 'mock@example.com',
  nickname: '목업 사용자',
  image: 'https://placehold.co/100x100?text=User',
  numOfReadBook: 15,
  numOfCard: 42
};

// 목업 책 데이터
export const mockBooks = [
  {
    bookId: 1,
    memberBookId: 1,
    title: '해리포터와 마법사의 돌, 해리포터와 마법사의 돌, 해리포터와 마법사의 돌, 해리포터와 마법사의 돌',
    author: 'J.K. 롤링',
    imageUrl: 'https://placehold.co/100x150?text=Harry+Potter',
    score: 5,
    startedAt: '2024-01-15T10:00:00.000Z',
    endedAt: '2024-02-20T10:00:00.000Z',
    status: 'DONE' as const,
    cardSummaries: [
      { cardId: 101, cardImage: 'https://placehold.co/100x100?text=Card1' },
      { cardId: 102, cardImage: 'https://placehold.co/100x100?text=Card2' }
    ]
  },
  {
    memberBookId: 2,
    title: '반지의 제왕',
    author: 'J.R.R. 톨킨',
    imageUrl: 'https://placehold.co/100x150?text=Lord+of+Rings',
    score: 4,
    startedAt: '2024-03-01T10:00:00.000Z',
    endedAt: '2024-04-15T10:00:00.000Z',
    status: 'DONE' as const,
    cardSummaries: [
      { cardId: 201, cardImage: 'https://placehold.co/100x100?text=Card3' }
    ]
  },
  {
    memberBookId: 3,
    title: '1984',
    author: '조지 오웰',
    imageUrl: 'https://placehold.co/100x150?text=1984',
    score: 0,
    startedAt: '2024-05-01T10:00:00.000Z',
    endedAt: '2024-05-01T10:00:00.000Z',
    status: 'READING' as const,
    cardSummaries: []
  },
  {
    memberBookId: 4,
    title: '동물농장',
    author: '조지 오웰',
    imageUrl: 'https://placehold.co/100x150?text=Animal+Farm',
    score: 0,
    startedAt: '2024-05-01T10:00:00.000Z',
    endedAt: '2024-05-01T10:00:00.000Z',
    status: 'NOT_START' as const,
    cardSummaries: []
  }
];

// 목업 독서카드 데이터
export const mockCards = [
  {
    cardId: 1,
    content: '해리포터의 첫 번째 마법 수업에서 배운 내용입니다. "윙가르디움 레비오사!" 주문을 외우며 마법의 세계에 첫 발을 내딛는 순간이었습니다.',
    image: 'https://placehold.co/150x200?text=Card1',
    created: '2024-01-20T14:30:00.000Z',
    isPublic: true
  },
  {
    cardId: 2,
    content: '반지의 제왕에서 가장 인상 깊었던 구절입니다. "모든 것이 끝나면, 새로운 시작이 있다"는 메시지가 마음에 남습니다.',
    image: 'https://placehold.co/150x200?text=Card2',
    created: '2024-03-10T16:45:00.000Z',
    isPublic: true
  },
  {
    cardId: 3,
    content: '1984를 읽으며 빅브라더의 감시 사회에 대한 경각심을 느꼈습니다. 자유의 소중함을 다시 한번 깨닫게 된 순간이었습니다.',
    image: 'https://placehold.co/150x200?text=Card3',
    created: '2024-05-05T11:20:00.000Z',
    isPublic: true  
  }
];

// 목업 검색 결과 데이터
export const mockSearchResults = [
  {
    title: '해리포터와 마법사의 돌, 해리포터와 마법사의 돌, 해리포터와 마법사의 돌, 해리포터와 마법사의 돌',
    author: 'J.K. 롤링',
    imageUrl: 'https://placehold.co/100x150?text=Harry+Potter',
    publisher: '문학수첩',
    isbn: '978-89-8281-002-8'
  },
  {
    title: '해리포터와 비밀의 방',
    author: 'J.K. 롤링',
    imageUrl: 'https://placehold.co/100x150?text=Harry+Potter+2',
    publisher: '문학수첩',
    isbn: '978-89-8281-003-5'
  },
  {
    title: '해리포터와 아즈카반의 죄수',
    author: 'J.K. 롤링',
    imageUrl: 'https://placehold.co/100x150?text=Harry+Potter+3',
    publisher: '문학수첩',
    isbn: '978-89-8281-004-2'
  }
];

// 목업 인기 도서 데이터
export const mockPopularBooks = [
  {
    image: 'https://placehold.co/100x150?text=Popular+1',
    title: '세상의 마지막 기회',
    author: '김영하',
    publisher: '민음사',
    isbn: '978-89-374-1234-5'
  },
  {
    image: 'https://placehold.co/100x150?text=Popular+2',
    title: '미드나잇 라이브러리',
    author: '매트 헤이그',
    publisher: '인플루엔셜',
    isbn: '978-89-374-5678-9'
  },
  {
    image: 'https://placehold.co/100x150?text=Popular+3',
    title: '클린 코드',
    author: '로버트 C. 마틴',
    publisher: '인사이트',
    isbn: '978-89-374-9012-3'
  }
];

// 목업 오늘의 추천 도서
export const mockTodaysRecommendation = [
  {
    bookId: 1,
    title: '오늘의 추천 도서 1',
    author: '추천 작가 1',
    imageUrl: 'https://placehold.co/100x150?text=Recommend+1'
  },
  {
    bookId: 2,
    title: '오늘의 추천 도서 2',
    author: '추천 작가 2',
    imageUrl: 'https://placehold.co/100x150?text=Recommend+2'
  }
];

// 목업 JWT 토큰
export const mockTokens = {
  accessToken: 'mock.access.token.here',
  refreshToken: 'mock.refresh.token.here'
};

// 목업 OCR 결과
export const mockOcrResult = '이것은 목업 OCR 결과 텍스트입니다. 실제 이미지에서 추출된 것처럼 보입니다. 독서 카드에 사용할 수 있는 의미 있는 텍스트가 여기에 나타날 것입니다.';

// 목업 이미지 URL
export const mockImageUrl = 'https://placehold.co/300x400?text=Mock+Image';
