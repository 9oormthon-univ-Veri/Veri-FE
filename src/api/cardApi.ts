// src/api/cardApi.ts

import { fetchWithAuth, USE_MOCK_DATA } from './bookApi';
import { mockMyCardsResponse, mockCardDetailResponse } from './mockData';

const BASE_URL = "https://api.very.miensoap.me";

// 인터페이스 정의 (기존 코드 그대로 유지, 문제 없음)
export interface BookInfoForCard {
  bookId: number;
  title: string;
  coverUrl: string;
}

export interface Card {
  cardId: number;
  createdAt: string;
  content: string;
  imageUrl: string;
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

export interface GetCardDetailByIdResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: Card | null;
}

export interface CreateCardRequest {
  memberBookId: number;
  content: string;
  imageUrl: string;
}

export interface CreateCardResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    cardId: number;
    createdAt: string;
  };
}

// ==========================================================
//                 ⬇️ 실제 API 호출 로직 ⬇️
// ==========================================================

/**
 * 내 독서 카드 목록을 가져오는 API 함수
 * @returns {Promise<GetMyCardsResponse>} 카드 목록 응답 객체
 */
export async function getMyCards(): Promise<GetMyCardsResponse> {
  // ✨ 목 데이터를 사용할 경우, 실제 API 호출 대신 목 데이터를 반환합니다.
  if (USE_MOCK_DATA) {
    // 네트워크 지연을 흉내내기 위해 0.5초 지연시킵니다.
    return new Promise(resolve => setTimeout(() => resolve(mockMyCardsResponse), 500));
  }

  // 실제 API 호출 로직
  const url = `${BASE_URL}/api/v1/cards/my`;
  try {
    const response = await fetchWithAuth(url, {
      method: 'GET',
    });

    const data: GetMyCardsResponse = await response.json();

    // API 응답의 성공 여부 및 데이터 유효성 검사
    if (!data.isSuccess || !data.result) {
      throw new Error(`API call failed: ${data.message || 'Unknown error'}`);
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch my cards:', error);
    // 에러를 호출한 컴포넌트로 다시 전파
    throw error;
  }
}

/**
 * 단일 독서 카드 상세 정보를 가져오는 API 함수
 * @param cardId 조회할 카드의 ID
 * @returns {Promise<GetCardDetailByIdResponse>} 카드 상세 정보 응답 객체
 */
export async function getCardDetailById(cardId: number): Promise<GetCardDetailByIdResponse> {
  // ✨ 목 데이터를 사용할 경우, 실제 API 호출 대신 목 데이터를 반환합니다.
  if (USE_MOCK_DATA) {
    // 요청한 ID에 따라 다른 목 데이터를 반환하도록 로직을 추가합니다.
    const mockResult = cardId === 101 ? mockCardDetailResponse : {
      isSuccess: true,
      code: '200', // 카드가 없을 때도 isSuccess는 true일 수 있으므로 code로 분기
      message: '카드를 찾을 수 없습니다.',
      result: null, // 결과가 없는 경우 null
    };
    return new Promise(resolve => setTimeout(() => resolve(mockResult), 500));
  }

  // 실제 API 호출 로직
  const url = `${BASE_URL}/api/v1/cards/${cardId}`;

  try {
    const response = await fetchWithAuth(url, {
      method: 'GET',
    });

    const data: GetCardDetailByIdResponse = await response.json();

    // API 응답의 성공 여부 및 데이터 유효성 검사
    if (!data.isSuccess) {
      throw new Error(`API call failed: ${data.message || 'Unknown error'}`);
    }

    return data;
  } catch (error) {
    console.error(`Failed to fetch card detail for ID ${cardId}:`, error);
    throw error;
  }
}

export async function createCard(body: CreateCardRequest): Promise<CreateCardResponse> {
  const url = `${BASE_URL}/api/v1/cards`;

  try {
    const response = await fetchWithAuth(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data: CreateCardResponse = await response.json();

    if (!data.isSuccess) {
      throw new Error(data.message || '카드 생성 실패');
    }

    return data;
  } catch (error) {
    console.error('카드 생성 중 오류:', error);
    throw error;
  }
}