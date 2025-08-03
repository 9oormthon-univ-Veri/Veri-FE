import { getAccessToken } from './auth';

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;
export const USE_MOCK_DATA = false;

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

export interface CardBookDetail {
  id: number;
  title: string;
  coverImageUrl: string;
  author: string;
}

export interface MyCardItem {
  cardId: number | undefined;
  content: string;
  image: string;
  created: string;
}

export interface Card {
  cardId: number;
  content: string;
  imageUrl: string;
  createdAt: string,
  book: CardBookDetail | null;
}

export interface GetMyCardsResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    cards: MyCardItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface GetCardDetailByIdResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    id: number;
    content: string;
    imageUrl: string;
    "createdAt": string,
    book: CardBookDetail | null;
  } | null;
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
  };
}

export interface GetPresignedUrlRequest {
  contentType: string;
  contentLength: number;
}

export interface GetPresignedUrlResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    presignedUrl: string;
    publicUrl: string;
  };
}

export interface GetMyCardsQueryParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface DeleteCardResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: Record<string, never>;
}

export interface GetMyCardsCountResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: number;
}

export async function getMyCards(params: GetMyCardsQueryParams = {}): Promise<GetMyCardsResponse> {
  if (USE_MOCK_DATA) {
    const mockCards: MyCardItem[] = [
      { cardId: 1, content: '첫 번째 독서카드 내용', created: "2025-07-03T11:41:16.019Z", image: 'https://placehold.co/150x200?text=Card1' },
      { cardId: 2, content: '두 번째 독서카드 내용', created: "2025-07-03T11:41:16.019Z", image: 'https://placehold.co/150x200?text=Card2' },
    ];
    return new Promise(resolve => setTimeout(() => resolve({
      isSuccess: true,
      code: '1000',
      message: '목 내 독서카드 조회 성공',
      result: {
        cards: mockCards,
        page: params.page || 1,
        size: params.size || 10,
        totalElements: mockCards.length,
        totalPages: 1,
      }
    }), 500));
  }

  const url = new URL(`${BASE_URL}/api/v1/cards/my`);
  if (params.page !== undefined) url.searchParams.append('page', String(params.page));
  if (params.size !== undefined) url.searchParams.append('size', String(params.size));
  if (params.sort) url.searchParams.append('sort', params.sort);

  try {
    const response = await fetchWithAuth(url.toString(), { method: 'GET' });
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

export async function getCardDetailById(cardId: number): Promise<GetCardDetailByIdResponse> {
  if (USE_MOCK_DATA) {
    const mockSuccessResult: GetCardDetailByIdResponse = {
      isSuccess: true,
      code: '1000',
      message: '목 독서카드 상세 조회 성공',
      result: {
        id: cardId,
        content: `이것은 독서카드 ${cardId}의 내용입니다. 책의 중요한 구절이나 감상을 담고 있습니다. 
                  이 카드는 독서 경험을 시각적으로 기록하고 공유하는 데 도움이 됩니다.`,
        imageUrl: `https://placehold.co/300x400?text=Card+${cardId}+Detail+Image`,
        createdAt: "2025-07-03T11:47:09.032Z",
        book: {
          id: 0,
          title: '목 책 제목',
          coverImageUrl: 'https://placehold.co/100x150?text=BookCover',
          author: '목 작가',
        },
      },
    };

    const mockNotFoundResult: GetCardDetailByIdResponse = {
      isSuccess: false,
      code: 'CARD404',
      message: '독서 카드를 찾을 수 없습니다.',
      result: null,
    };

    const resultToReturn = cardId === 1 ? mockSuccessResult : mockNotFoundResult;
    return new Promise(resolve => setTimeout(() => resolve(resultToReturn), 500));
  }

  const url = `${BASE_URL}/api/v1/cards/${cardId}`;

  try {
    const response = await fetchWithAuth(url, { method: 'GET' });
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

export async function createCard(body: CreateCardRequest): Promise<CreateCardResponse> {
  const url = `${BASE_URL}/api/v1/cards`;

  try {
    const response = await fetchWithAuth(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

export async function getPresignedUrlForImageUpload(body: GetPresignedUrlRequest): Promise<GetPresignedUrlResponse> {
  const url = `${BASE_URL}/api/v1/cards/image`;

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
      headers: { 'Content-Type': 'application/json' },
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

export async function uploadImageAndGetUrl(file: File): Promise<string> {
  if (USE_MOCK_DATA) {
    return new Promise(resolve => setTimeout(() => resolve('https://mock-public-url.example.com/mock-image.jpg'), 500));
  }

  try {
    const presignedRequestData: GetPresignedUrlRequest = {
      contentType: file.type,
      contentLength: file.size,
    };

    const presignedResponse = await getPresignedUrlForImageUpload(presignedRequestData);
    const { presignedUrl, publicUrl } = presignedResponse.result;

    if (!presignedUrl || !publicUrl) {
      throw new Error("백엔드 응답에 presignedUrl 또는 publicUrl이 누락되었습니다.");
    }

    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`S3 직접 업로드 실패: ${uploadResponse.statusText || 'Unknown S3 error'}`);
    }

    console.log('이미지 S3 업로드 성공. Public URL:', publicUrl);
    return publicUrl;
  } catch (error: any) {
    console.error('이미지 업로드 과정에서 오류 발생:', error);
    throw new Error(`이미지 업로드 실패: ${error.message || "알 수 없는 오류"}`);
  }
}

export async function deleteCard(cardId: number): Promise<DeleteCardResponse> {
  if (USE_MOCK_DATA) {
    return new Promise(resolve => setTimeout(() => resolve({
      isSuccess: true,
      code: '1000',
      message: '목 독서카드 삭제 성공',
      result: {}
    }), 500));
  }

  const url = `${BASE_URL}/api/v1/cards/${cardId}`;

  try {
    const response = await fetchWithAuth(url, {
      method: 'DELETE',
    });

    if (response.status === 204) {
      return { isSuccess: true, code: '204', message: '삭제 성공', result: {} };
    }

    const data: DeleteCardResponse = await response.json();
    if (!data.isSuccess) {
      throw new Error(data.message || '독서 카드 삭제에 실패했습니다.');
    }
    return data;
  } catch (error) {
    console.error('독서 카드 삭제 중 오류:', error);
    throw error;
  }
}

export async function getMyCardsCount(): Promise<GetMyCardsCountResponse> {
  if (USE_MOCK_DATA) {
    return new Promise(resolve => setTimeout(() => resolve({
      isSuccess: true,
      code: '1000',
      message: '목 내 독서카드 개수 조회 성공',
      result: 7
    }), 500));
  }

  const url = `${BASE_URL}/api/v1/cards/my/count`;
  try {
    const response = await fetchWithAuth(url, { method: 'GET' });
    const data: GetMyCardsCountResponse = await response.json();
    if (!data.isSuccess) {
      throw new Error(data.message || '내 독서카드 개수 조회에 실패했습니다.');
    }
    return data;
  } catch (error) {
    console.error('내 독서카드 개수 조회 중 오류:', error);
    throw error;
  }
}
