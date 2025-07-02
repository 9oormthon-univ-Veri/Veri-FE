// src/api/cardApi.ts

import { fetchWithAuth, USE_MOCK_DATA } from './bookApi';
// mockData는 새 스펙에 맞춰 업데이트해야 합니다.
import { mockMyCardsResponse, mockCardDetailResponse } from './mockData';

const BASE_URL = "https://api.very.miensoap.me";

// Card 인터페이스는 현재 스펙에 맞습니다.
export interface Card {
    cardId: number;
    content: string;
    image: string; // 'imageUrl' 대신 'image' 사용
}

// GetMyCardsResponse 인터페이스는 현재 스펙에 맞습니다.
export interface GetMyCardsResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    result: {
        cards: Card[];
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
    };
}

// GetCardDetailByIdResponse는 Card 타입 변경에 따라 결과 타입에 영향을 받습니다.
export interface GetCardDetailByIdResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    result: Card | null; // Card 타입이 변경되었으므로 여기에 반영
}

// CreateCardRequest는 새 API 스펙과 일치합니다.
export interface CreateCardRequest {
    memberBookId: number;
    content: string;
    imageUrl: string; // 백엔드와 논의 후 'image'로 통일하는 것을 고려 (현재 API는 imageUrl)
}

// ✨ CreateCardResponse를 새 API 스펙에 맞춰 수정합니다.
export interface CreateCardResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    result: {
        cardId: number;
        // 'createdAt' 필드는 새 스펙에 없으므로 제거합니다.
    };
}

// ✨ POST /api/v1/cards/image 요청 바디 인터페이스 추가
export interface GetPresignedUrlRequest {
    contentType: string;
    contentLength: number;
}

// ✨ POST /api/v1/cards/image 응답 인터페이스 추가
export interface GetPresignedUrlResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    result: {
        presignedUrl: string;
        publicUrl: string;
    };
}

// GetMyCards API를 위한 쿼리 파라미터 인터페이스는 현재 스펙에 맞습니다.
export interface GetMyCardsQueryParams {
    page?: number;
    size?: number;
    sort?: string;
}

// ==========================================================
//          ⬇️ 실제 API 호출 로직 ⬇️
// ==========================================================

/**
 * 내 독서 카드 목록을 가져오는 API 함수
 * @param {GetMyCardsQueryParams} params - 페이지네이션 및 정렬 쿼리 파라미터
 * @returns {Promise<GetMyCardsResponse>} 카드 목록 응답 객체
 */
export async function getMyCards(params: GetMyCardsQueryParams = {}): Promise<GetMyCardsResponse> {
    if (USE_MOCK_DATA) {
        return new Promise(resolve => setTimeout(() => resolve(mockMyCardsResponse), 500));
    }

    const url = new URL(`${BASE_URL}/api/v1/cards/my`);
    if (params.page !== undefined) {
        url.searchParams.append('page', String(params.page));
    }
    if (params.size !== undefined) {
        url.searchParams.append('size', String(params.size));
    }
    if (params.sort) {
        url.searchParams.append('sort', params.sort);
    }

    try {
        const response = await fetchWithAuth(url.toString(), {
            method: 'GET',
        });

        const data: GetMyCardsResponse = await response.json();

        if (!data.isSuccess || !data.result || !Array.isArray(data.result.cards)) {
            throw new Error(`API call failed or data format is incorrect: ${data.message || 'Unknown error'}`);
        }

        return data;
    } catch (error) {
        console.error('Failed to fetch my cards:', error);
        throw error;
    }
}

/**
 * 단일 독서 카드 상세 정보를 가져오는 API 함수
 * @param cardId 조회할 카드의 ID
 * @returns {Promise<GetCardDetailByIdResponse>} 카드 상세 정보 응답 객체
 */
export async function getCardDetailById(cardId: number): Promise<GetCardDetailByIdResponse> {
    if (USE_MOCK_DATA) {
        const mockResult = cardId === 101 ? mockCardDetailResponse : {
            isSuccess: true,
            code: '200',
            message: '카드를 찾을 수 없습니다.',
            result: null,
        };
        return new Promise(resolve => setTimeout(() => resolve(mockResult), 500));
    }

    const url = `${BASE_URL}/api/v1/cards/${cardId}`;

    try {
        const response = await fetchWithAuth(url, {
            method: 'GET',
        });

        const data: GetCardDetailByIdResponse = await response.json();

        if (!data.isSuccess) {
            throw new Error(`API call failed: ${data.message || 'Unknown error'}`);
        }

        return data;
    } catch (error) {
        console.error(`Failed to fetch card detail for ID ${cardId}:`, error);
        throw error;
    }
}

/**
 * 새로운 독서 카드를 생성하는 API 함수
 * @param {CreateCardRequest} body - 생성할 카드의 데이터 (memberBookId, content, imageUrl)
 * @returns {Promise<CreateCardResponse>} 카드 생성 응답 객체 (cardId 포함)
 */
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
            throw new Error(data.message || '카드 생성에 실패했습니다.');
        }

        return data;
    } catch (error) {
        console.error('카드 생성 중 오류:', error);
        throw error;
    }
}

/**
 * 이미지 업로드를 위한 presigned URL을 요청하는 API 함수
 * @param {GetPresignedUrlRequest} body - 이미지의 contentType 및 contentLength
 * @returns {Promise<GetPresignedUrlResponse>} presigned URL 및 public URL 응답 객체
 */
export async function getPresignedUrlForImageUpload(body: GetPresignedUrlRequest): Promise<GetPresignedUrlResponse> {
    const url = `${BASE_URL}/api/v1/cards/image`;

    // ✨ USE_MOCK_DATA에 대한 목 데이터 처리를 추가할 수 있습니다.
    if (USE_MOCK_DATA) {
        return new Promise(resolve => setTimeout(() => resolve({
            isSuccess: true,
            code: '1000',
            message: 'Mock presigned URL generated successfully.',
            result: {
                presignedUrl: 'https://mock-presigned-url.example.com/upload/mock-image.jpg?AWSAccessKeyId=MOCKKEY&Expires=MOCKEXP&Signature=MOCKSIG',
                publicUrl: 'https://mock-public-url.example.com/mock-image.jpg',
            }
        }), 500));
    }


    try {
        const response = await fetchWithAuth(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data: GetPresignedUrlResponse = await response.json();

        if (!data.isSuccess) {
            throw new Error(data.message || 'Presigned URL 요청에 실패했습니다.');
        }

        return data;
    } catch (error) {
        console.error('Presigned URL 요청 중 오류:', error);
        throw error;
    }
}

/**
 * 이미지 파일을 S3에 직접 업로드하고 최종 Public URL을 반환하는 함수
 * 이 함수는 먼저 백엔드로부터 Presigned URL을 받은 후, 해당 URL에 이미지를 직접 PUT 업로드합니다.
 *
* @param {File} file - 업로드할 이미지 파일 객체
* @returns {Promise<string>} 업로드된 이미지의 최종 Public URL
*/
export async function uploadImageAndGetUrl(file: File): Promise<string> {
   if (USE_MOCK_DATA) {
       // 목 데이터 처리: 실제 업로드 없이 mock public URL 반환
       return new Promise(resolve => setTimeout(() => resolve('https://mock-public-url.example.com/mock-image.jpg'), 500));
   }

   try {
       // 1단계: 백엔드 API에 Presigned URL 요청
       const presignedRequestData: GetPresignedUrlRequest = {
           contentType: file.type,
           contentLength: file.size,
       };

       const presignedResponse = await getPresignedUrlForImageUpload(presignedRequestData); // 새로 분리된 함수 호출

       const { presignedUrl, publicUrl } = presignedResponse.result;

       if (!presignedUrl || !publicUrl) {
           throw new Error("백엔드 응답에 presignedUrl 또는 publicUrl이 누락되었습니다.");
       }

       // 2단계: 받은 presigned URL에 이미지를 직접 PUT 업로드 (S3)
       const uploadResponse = await fetch(presignedUrl, {
           method: 'PUT',
           headers: {
               'Content-Type': file.type, // S3에 업로드할 때 파일의 MIME 타입 지정
               // 참고: Content-Length 헤더는 fetch API가 자동으로 설정하는 경우가 많아 명시하지 않아도 됨
           },
           body: file, // 이미지 파일 자체를 요청 본문에 담아 보냄
       });

       if (!uploadResponse.ok) {
           // S3 업로드 실패 시 (주로 CORS 또는 Presigned URL 문제), S3는 HTTP 상태 코드로 응답
           throw new Error(`S3 직접 업로드 실패: ${uploadResponse.statusText || 'Unknown S3 error'}`);
       }

       console.log('이미지 S3 업로드 성공. Public URL:', publicUrl);
       return publicUrl; // 최종 Public URL 반환

   } catch (error: any) {
       console.error('이미지 업로드 과정에서 오류 발생:', error);
       throw new Error(`이미지 업로드 실패: ${error.message || "알 수 없는 오류"}`);
   }
}