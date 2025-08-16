import { fetchWithAuth } from './cardApi';

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

export interface OCRResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: string | null;
}

export const extractTextFromImage = async (imageUrl: string): Promise<string> => {
  const url = new URL(`${BASE_URL}/api/v1/images/ocr`);
  url.searchParams.append('imageUrl', imageUrl);

  const response = await fetchWithAuth(url.toString(), {
    method: 'POST',
  });

  const data: OCRResponse = await response.json();

  if (!data.isSuccess || !data.result) {
    throw new Error(data.message || '텍스트 추출에 실패했습니다.');
  }

  return data.result;
};
