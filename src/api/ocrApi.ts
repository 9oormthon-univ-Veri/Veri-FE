// src/api/ocrApi.ts

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

// OCR API 응답 타입
export interface OCRResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    extractedString: string;
  } | null;
}

/**
 * 이미지 URL을 기반으로 OCR 텍스트를 추출합니다.
 * @param imageUrl - 업로드된 이미지의 public URL
 * @param accessToken - 사용자 인증 토큰
 * @returns 추출된 텍스트
 */
export const extractTextFromImage = async (
  imageUrl: string,
  accessToken: string
): Promise<string> => {
  const response = await fetch(
    `${BASE_URL}/api/v0/pictures?imageUrl=${encodeURIComponent(imageUrl)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data: OCRResponse = await response.json();

  if (!response.ok || !data.isSuccess || !data.result) {
    throw new Error(data.message || '텍스트 추출에 실패했습니다.');
  }

  return data.result.extractedString;
};
