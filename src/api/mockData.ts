// src/api/mockData.ts

// 기존 타입 임포트는 그대로 둡니다.
import type { GetAllBooksResponse, TodaysRecommendationBook, GetBookByIdResponse, SearchBooksResponse } from './bookApi';
import type { Card, GetMyCardsResponse, GetCardDetailByIdResponse, BookInfoForCard } from './cardApi';

// 💡 새로 추가된 타입 임포트
import type { GetMemberProfileResponse } from './memberApi';

// 모든 책을 가져오는 API의 목 데이터
export const mockAllBooksResponse: GetAllBooksResponse = {
    isSuccess: true,
    code: '1000',
    message: '요청에 성공하였습니다.',
    result: {
        books: [
            {
                bookId: 1,
                title: '해리 포터와 마법사의 돌',
                author: 'J.K. 롤링',
                imageUrl: 'https://picsum.photos/id/10/200/300',
                status: '독서중',
                rating: 5,
                date: '2023-01-15',
                cards: [
                    { imageUrl: 'https://picsum.photos/id/11/200/300' },
                    { imageUrl: 'https://picsum.photos/id/12/200/300' },
                ],
            },
            {
                bookId: 2,
                title: '어린 왕자',
                author: '앙투안 드 생텍쥐페리',
                imageUrl: 'https://picsum.photos/id/20/200/300',
                status: '완독',
                rating: 4.5,
                date: '2022-12-01',
                cards: [],
            },
            {
                bookId: 3,
                title: '코스모스',
                author: '칼 세이건',
                imageUrl: 'https://picsum.photos/id/30/200/300',
                status: '읽고싶어요',
                rating: 0,
                date: '',
                cards: [],
            },
        ],
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
        status: '독서중',
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
                createdAt: '2023-05-20T10:00:00Z',
                content: '인생은 가까이서 보면 비극이지만, 멀리서 보면 희극이다.',
                imageUrl: 'https://picsum.photos/id/201/200/300',
                book: {
                    bookId: 1,
                    title: '해리 포터와 마법사의 돌',
                    coverUrl: 'https://picsum.photos/id/10/200/300',
                },
            },
            {
                cardId: 102,
                createdAt: '2023-05-18T14:30:00Z',
                content: '나는 생각한다. 고로 나는 존재한다.',
                imageUrl: 'https://picsum.photos/id/202/200/300',
                book: {
                    bookId: 2,
                    title: '어린 왕자',
                    coverUrl: 'https://picsum.photos/id/20/200/300',
                },
            },
            {
                cardId: 103,
                createdAt: '2023-05-15T11:00:00Z',
                content: '하늘을 나는 것만으로는 부족하다. 더 높이, 더 멀리, 더 빨리.',
                imageUrl: 'https://picsum.photos/id/203/200/300',
                book: {
                    bookId: 5,
                    title: '갈매기의 꿈',
                    coverUrl: 'https://picsum.photos/id/50/200/300',
                },
            },
        ],
    },
};

// 단일 카드 상세 정보 API의 목 데이터 (ID 101에 대한 정보)
export const mockCardDetailResponse: GetCardDetailByIdResponse = {
    isSuccess: true,
    code: '1000',
    message: '요청에 성공하였습니다.',
    result: {
        cardId: 101,
        createdAt: '2023-05-20T10:00:00Z',
        content: '인생은 가까이서 보면 비극이지만, 멀리서 보면 희극이다. - 찰리 채플린',
        imageUrl: 'https://picsum.photos/id/201/200/300',
        book: {
            bookId: 1,
            title: '해리 포터와 마법사의 돌',
            coverUrl: 'https://picsum.photos/id/10/200/300',
        },
    },
};

// 💡 MemberProfile 목 데이터 추가
export const mockMemberProfileResponse: GetMemberProfileResponse = {
    isSuccess: true,
    code: '1000',
    message: '사용자 정보 조회에 성공하였습니다.',
    result: {
        memberId: 1,
        name: '홍길동',
        booksRead: 42,
        readingCards: 150,
        profileImageUrl: 'https://i.pravatar.cc/150?img=22', // 임의의 프로필 이미지
    },
};