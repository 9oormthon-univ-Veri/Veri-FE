// src/api/cardApi.ts

export interface BookInfoForCard {
  bookId: number;
  title: string;
  coverUrl: string; // 단일 카드 상세 조회 시 책 커버 URL
}

export interface Card {
  cardId: number;
  createdAt: string;
  content: string;
  imageUrl: string; // 독서 카드 이미지 URL (단일 카드 조회 시에도 사용)
  book: BookInfoForCard;
}

export interface GetMyCardsResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    cards: Card[];
  };
}

// 단일 독서 카드 상세 조회 API 응답 인터페이스 업데이트
export interface GetCardDetailByIdResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: Card | null; // result 바로 아래에 Card 객체
}

const BASE_URL = "https://your-api-base-url.com"; // 실제 서버 URL로 교체 필요

export async function getMyCards(): Promise<GetMyCardsResponse> {
  const url = `${BASE_URL}/api/v1/cards/my`;

  return new Promise((resolve) => {
    setTimeout(() => {
      const mockResponse: GetMyCardsResponse = {
        isSuccess: true,
        code: "COMMON200",
        message: "성공입니다.",
        result: {
          cards: [
            {
              cardId: 123,
              createdAt: "2025-06-04T16:30:00Z",
              content: "이 책은 인간 본성과 윤리에 대해 깊이 성찰하게 만든다.",
              imageUrl: "https://placehold.co/150x100/F0F8FF/000000?text=Card1",
              book: {
                bookId: 1,
                title: "인간 본성에 대하여",
                coverUrl: "https://placehold.co/100x150/ff9900/ffffff?text=HP1"
              }
            },
            {
              cardId: 124,
              createdAt: "2025-06-02T11:20:00Z",
              content: "과학적 사고방식을 삶에 어떻게 적용할 수 있을지 고민했다.",
              imageUrl: "https://placehold.co/150x100/FFF8DC/000000?text=Card2",
              book: {
                bookId: 2,
                title: "과학이란 무엇인가",
                coverUrl: "https://placehold.co/100x150/0099ff/ffffff?text=Human"
              }
            },
            {
              cardId: 125,
              createdAt: "2025-06-01T09:00:00Z",
              content: "새로운 관점으로 세상을 바라보는 법을 배웠다.",
              imageUrl: "https://placehold.co/150x100/E6E6FA/000000?text=Card3",
              book: {
                bookId: 3,
                title: "생각의 탄생",
                coverUrl: "https://placehold.co/100x150/99ff00/ffffff?text=OldMan"
              }
            },
            {
              cardId: 126,
              createdAt: "2025-05-28T14:00:00Z",
              content: "자기계발에 대한 실용적인 조언들이 많아 도움이 되었다.",
              imageUrl: "https://placehold.co/150x100/F5FFFA/000000?text=Card4",
              book: {
                bookId: 4,
                title: "아주 작은 습관의 힘",
                coverUrl: "https://placehold.co/100x150/ff0099/ffffff?text=Demian"
              }
            },
            {
              cardId: 127,
              createdAt: "2025-05-20T10:00:00Z",
              content: "고전 문학의 아름다움을 다시금 느낄 수 있었다.",
              imageUrl: "https://placehold.co/150x100/FFEBCD/000000?text=Card5",
              book: {
                bookId: 5,
                title: "데미안",
                coverUrl: "https://placehold.co/100x150/00ffff/000000?text=LittlePrince"
              }
            }
          ]
        }
      };
      resolve(mockResponse);
    }, 1200);
  });
}

// 단일 독서 카드 상세 정보를 가져오는 API 함수 업데이트
export async function getCardDetailById(cardId: number): Promise<GetCardDetailByIdResponse> {
  const url = `${BASE_URL}/api/v1/cards/${cardId}`; // URL 경로 변경

  return new Promise((resolve) => {
    setTimeout(() => {
      let mockCardDetail: Card | null = null;
      switch (cardId) {
        case 123:
          mockCardDetail = {
            cardId: 123,
            createdAt: "2025-06-04T16:30:00Z",
            content: "이 책은 인간 본성과 윤리에 대해 깊이 성찰하게 만든다.", // getMyCards와 동일하게
            imageUrl: "https://placehold.co/300x400/D3D3D3/000000?text=DetailCard1",
            book: {
              bookId: 1, // getMyCards와 동일하게
              title: "인간 본성에 대하여", // getMyCards와 동일하게
              coverUrl: "https://placehold.co/100x150/ff9900/ffffff?text=HP1"
            }
          };
          break;
        case 124:
          mockCardDetail = {
            cardId: 124,
            createdAt: "2025-06-02T11:20:00Z",
            content: "과학적 사고방식을 삶에 어떻게 적용할 수 있을지 고민했다.", // getMyCards와 동일하게
            imageUrl: "https://placehold.co/300x400/C0C0C0/000000?text=DetailCard2",
            book: {
              bookId: 2, // getMyCards와 동일하게
              title: "과학이란 무엇인가", // getMyCards와 동일하게
              coverUrl: "https://placehold.co/100x150/0099ff/ffffff?text=Human"
            }
          };
          break;
        case 125:
          mockCardDetail = {
            cardId: 125,
            createdAt: "2025-06-01T09:00:00Z",
            content: "새로운 관점으로 세상을 바라보는 법을 배웠다.", // getMyCards와 동일하게
            imageUrl: "https://placehold.co/300x400/A9A9A9/000000?text=DetailCard3",
            book: {
              bookId: 3, // getMyCards와 동일하게
              title: "생각의 탄생", // getMyCards와 동일하게
              coverUrl: "https://placehold.co/100x150/99ff00/ffffff?text=OldMan"
            }
          };
          break;
        case 126: // ✨ 126번 카드 추가
          mockCardDetail = {
            cardId: 126,
            createdAt: "2025-05-28T14:00:00Z",
            content: "자기계발에 대한 실용적인 조언들이 많아 도움이 되었다.",
            imageUrl: "https://placehold.co/300x400/F5FFFA/000000?text=DetailCard4",
            book: {
              bookId: 4,
              title: "아주 작은 습관의 힘",
              coverUrl: "https://placehold.co/100x150/ff0099/ffffff?text=Demian"
            }
          };
          break;
        case 127: // ✨ 127번 카드 추가
          mockCardDetail = {
            cardId: 127,
            createdAt: "2025-05-20T10:00:00Z",
            content: "고전 문학의 아름다움을 다시금 느낄 수 있었다.",
            imageUrl: "https://placehold.co/300x400/FFEBCD/000000?text=DetailCard5",
            book: {
              bookId: 5,
              title: "데미안",
              coverUrl: "https://placehold.co/100x150/00ffff/000000?text=LittlePrince"
            }
          };
          break;
        default:
          mockCardDetail = null;
      }

      const mockResponse: GetCardDetailByIdResponse = mockCardDetail
        ? {
            isSuccess: true,
            code: "COMMON200",
            message: "성공입니다.",
            result: mockCardDetail
          }
        : {
            isSuccess: false,
            code: "CARD_NOT_FOUND",
            message: "독서 카드를 찾을 수 없습니다.",
            result: null
          };
      resolve(mockResponse);
    }, 800);
  });
}
