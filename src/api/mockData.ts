// src/api/mockData.ts

// 기존 타입 임포트는 그대로 둡니다.
import type { GetAllBooksResponse, TodaysRecommendationBook, GetBookByIdResponse, SearchBooksResponse } from './bookApi';
import type { GetMyCardsResponse, GetCardDetailByIdResponse } from './cardApi';

// 💡 새로 추가된 타입 임포트
import type { GetMemberProfileResponse } from './memberApi';

// 모든 책을 가져오는 API의 목 데이터
export const mockAllBooksResponse: GetAllBooksResponse = {
    isSuccess: true,
    code: '1000',
    message: '요청에 성공하였습니다.',
    result: {
        // ✨ 'books' 대신 'memberBooks'로 변경
        memberBooks: [
            {
                bookId: 1,
                title: '해리 포터와 마법사의 돌',
                author: 'J.K. 롤링',
                imageUrl: 'https://picsum.photos/id/10/200/300',
                score: 5,           // ✨ rating 대신 score로 변경
                startedAt: '2023-01-15T00:00:00.000Z', // ✨ date 대신 startedAt, ISO 8601 형식으로 변경
                status: 'READING',  // ✨ '독서중' 대신 API 스펙의 BookStatus 값 사용
            },
            {
                bookId: 2,
                title: '어린 왕자',
                author: '앙투안 드 생텍쥐페리',
                imageUrl: 'https://picsum.photos/id/20/200/300',
                score: 4,           // ✨ rating 대신 score로 변경 (소수점은 integer($int32) 스펙에 안맞을 수 있음)
                startedAt: '2022-12-01T00:00:00.000Z', // ✨ date 대신 startedAt, ISO 8601 형식으로 변경
                status: 'COMPLETED', // ✨ '완독' 대신 API 스펙의 BookStatus 값 사용
            },
            {
                bookId: 3,
                title: '코스모스',
                author: '칼 세이건',
                imageUrl: 'https://picsum.photos/id/30/200/300',
                score: 0,
                startedAt: '2024-07-02T00:00:00.000Z', // ✨ API 스펙의 ISO 8601 형식에 맞춤
                status: 'NOT_START', // ✨ '읽고싶어요' 대신 API 스펙의 BookStatus 값 사용
            },
        ],
        // ✨ pagination 필드를 추가합니다.
        page: 1,
        size: 3, // mock data에 있는 책의 개수
        totalElements: 3,
        totalPages: 1,
    },
};

// 특정 책 상세 정보를 가져오는 API의 목 데이터
export const mockBookByIdResponse: GetBookByIdResponse = {
    isSuccess: true,
    code: '1000',
    message: '요청에 성공하였습니다.',
    result: {
        bookId: 1,
        title: '해리 포터와 마법사의 돌',
        author: 'J.K. 롤링',
        imageUrl: 'https://picsum.photos/id/10/200/300',
        rating: 5,
        status: 'READING',
        cards: [
            { imageUrl: 'https://picsum.photos/id/11/200/300' },
            { imageUrl: 'https://picsum.photos/id/12/200/300' },
            { imageUrl: 'https://picsum.photos/id/13/200/300' },
        ],
    },
};

// 책 제목으로 검색하는 API의 목 데이터
export const mockSearchBooksResponse: SearchBooksResponse = {
    isSuccess: true,
    code: '1000',
    message: '검색에 성공하였습니다.',
    result: [
        {
            title: '해리 포터와 비밀의 방',
            author: 'J.K. 롤링',
            imageUrl: 'https://picsum.photos/id/14/200/300',
        },
        {
            title: '해리 포터와 아즈카반의 죄수',
            author: 'J.K. 롤링',
            imageUrl: 'https://picsum.photos/id/15/200/300',
        },
    ],
};

// 오늘의 추천 도서 API의 목 데이터
export const mockTodaysRecommendation: TodaysRecommendationBook[] = [
    {
        bookId: 4,
        title: '데미안',
        author: '헤르만 헤세',
        imageUrl: 'https://picsum.photos/id/40/200/300',
    },
    {
        bookId: 5,
        title: '갈매기의 꿈',
        author: '리처드 바크',
        imageUrl: 'https://picsum.photos/id/50/200/300',
    },
];

// 내 카드 목록 API의 목 데이터
export const mockMyCardsResponse: GetMyCardsResponse = {
    isSuccess: true,
    code: '1000',
    message: '요청에 성공하였습니다.',
    result: {
        cards: [
            {
                cardId: 101,
                // createdAt 필드는 새 스펙에서 제거되었으므로 삭제
                content: '인생은 가까이서 보면 비극이지만, 멀리서 보면 희극이다.',
                image: 'https://picsum.photos/id/201/200/300', // imageUrl -> image로 필드명 변경
                // book 객체는 새 스펙에서 제거되었으므로 삭제
            },
            {
                cardId: 102,
                // createdAt 필드는 새 스펙에서 제거되었으므로 삭제
                content: '나는 생각한다. 고로 나는 존재한다.',
                image: 'https://picsum.photos/id/202/200/300', // imageUrl -> image로 필드명 변경
                // book 객체는 새 스펙에서 제거되었으므로 삭제
            },
            {
                cardId: 103,
                // createdAt 필드는 새 스펙에서 제거되었으므로 삭제
                content: '하늘을 나는 것만으로는 부족하다. 더 높이, 더 멀리, 더 빨리.',
                image: 'https://picsum.photos/id/203/200/300', // imageUrl -> image로 필드명 변경
                // book 객체는 새 스펙에서 제거되었으므로 삭제
            },
            // 필요하다면 더 많은 카드 데이터 추가
            {
                cardId: 104,
                content: '책 속에는 항상 진리가 있다. 그것을 찾아내는 것이 독서의 기쁨이다.',
                image: 'https://picsum.photos/id/204/200/300',
            },
            {
                cardId: 105,
                content: '어제는 역사이고, 내일은 미스터리이며, 오늘은 선물이다.',
                image: 'https://picsum.photos/id/205/200/300',
            },
        ],
        // ✨ 새로운 API 스펙에 따라 페이지네이션 정보 추가
        page: 1,           // 현재 페이지
        size: 5,           // 한 페이지당 항목 수 (여기서는 예시로 5개)
        totalElements: 10, // 전체 항목 수 (예시)
        totalPages: 2,     // 전체 페이지 수 (예시)
    },
};

// ✨ mockCardDetailResponse도 새 Card 인터페이스에 맞춰 수정해야 합니다.
export const mockCardDetailResponse: GetCardDetailByIdResponse = {
    isSuccess: true,
    code: '1000',
    message: '카드 상세 정보 조회 성공',
    result: {
        cardId: 101,
        content: '인생은 가까이서 보면 비극이지만, 멀리서 보면 희극이다. (상세 내용)',
        image: 'https://picsum.photos/id/201/500/800', // imageUrl -> image
    },
};

// 💡 MemberProfile 목 데이터 추가
export const mockMemberProfileResponse: GetMemberProfileResponse = {
    isSuccess: true,
    code: '1000',
    message: '목업 프로필 정보입니다.',
    result: {
        email: 'mockuser@example.com',
        nickname: '테스트유저', // API 스펙에 맞춰 변경
        image: 'https://placehold.co/100x100/A0B2C3/FFFFFF?text=Mock', // API 스펙에 맞춰 변경
        numOfReadBook: 15, // API 스펙에 맞춰 변경
        numOfCard: 30,     // API 스펙에 맞춰 변경
    },
};

export const mockExtractedTextResponse = {
    isSuccess: true,
    code: 'COMMON200',
    message: '성공입니다.',
    result: {
      extractedString: '“행복은 우리가 멈춰 서서 바라볼 때 가장 잘 보인다.” - 헨리 데이비드 소로우',
    },
  };