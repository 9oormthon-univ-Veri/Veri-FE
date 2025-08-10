import { fetchWithAuth } from './cardApi';
import { USE_MOCK_DATA, mockDelay, mockImageUrl, mockOcrResult } from './mock';

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

interface ImageUploadApiResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    result: {
        presignedUrl: string;
        publicUrl: string;
    };
}

export interface GetImagesQueryParams {
    page?: number;
    size?: number;
}

export interface GetImagesResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    result: {
        content: string[];
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
    };
}

export interface OcrResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    result: string;
}

const mockOcrResponse: OcrResponse = {
    isSuccess: true,
    code: '1000',
    message: 'Mock OCR successful.',
    result: mockOcrResult,
};

export async function uploadImage(file: File): Promise<string> {
    if (USE_MOCK_DATA) {
        await mockDelay();
        return mockImageUrl;
    }

    try {
        const presignedRequestData = {
            contentType: file.type,
            contentLength: file.size,
        };

        const response = await fetchWithAuth(`${BASE_URL}/api/v1/cards/image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(presignedRequestData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Presigned URL 요청 실패: ${errorData.message || response.statusText}`);
        }

        const data: ImageUploadApiResponse = await response.json();
        const { presignedUrl, publicUrl } = data.result;

        if (!presignedUrl || !publicUrl) {
            throw new Error("백엔드 응답에 presignedUrl 또는 publicUrl이 누락되었습니다.");
        }

        const uploadResponse = await fetch(presignedUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type,
            },
            body: file,
        });

        if (!uploadResponse.ok) {
            throw new Error(`S3 직접 업로드 실패: ${uploadResponse.statusText}`);
        }

        console.log('이미지 S3 업로드 성공. Public URL:', publicUrl);
        return publicUrl;

    } catch (error: any) {
        console.error('이미지 업로드 과정에서 오류 발생:', error);
        throw new Error(`이미지 업로드 실패: ${error.message}`);
    }
}

export async function extractTextFromImage(imageUrl: string): Promise<OcrResponse> {
    if (USE_MOCK_DATA) {
        await mockDelay();
        return mockOcrResponse;
    }

    const url = new URL(`${BASE_URL}/api/v0/images/ocr`);
    url.searchParams.append('imageUrl', imageUrl);

    try {
        const response = await fetchWithAuth(url.toString(), {
            method: 'POST',
        });

        const data: OcrResponse = await response.json();

        if (!data.isSuccess) {
            throw new Error(`OCR API call failed: ${data.message || 'Unknown error'}`);
        }

        return data;
    } catch (error) {
        console.error(`Failed to perform OCR for image ${imageUrl}:`, error);
        throw error;
    }
}