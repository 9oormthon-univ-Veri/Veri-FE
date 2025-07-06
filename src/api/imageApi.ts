// src/api/imageApi.ts

import { fetchWithAuth, USE_MOCK_DATA } from './bookApi'; // Adjust path if needed

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

// ==========================================================
//          ⬇️ 인터페이스 정의 ⬇️
// ==========================================================

// POST /api/v0/images/presigned-url 응답 (기존)
// interface PresignedUrlResponse {
//     isSuccess: boolean;
//     code: string;
//     message: string;
//     result: {
//         presignedUrl: string;
//         fileName: string; // 업로드 후 접근할 최종 파일 이름/URL
//     };
// }

interface ImageUploadApiResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    result: {
        presignedUrl: string;
        publicUrl: string;
    };
}

// GET /api/v0/images 쿼리 파라미터 (기존)
export interface GetImagesQueryParams {
    page?: number;
    size?: number;
}

// GET /api/v0/images 응답 (기존)
export interface GetImagesResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    result: {
        content: string[]; // 이미지 URL들의 배열
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
    };
}

// ✨ POST /api/v0/images/ocr 응답 인터페이스 추가
export interface OcrResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    result: string; // 추출된 텍스트
}

// ==========================================================
//          ⬇️ 목 데이터 (필요시 src/api/mockData.ts로 이동) ⬇️
// ==========================================================

// const mockPresignedUrlResponse: PresignedUrlResponse = {
//     isSuccess: true,
//     code: '1000',
//     message: 'Mock presigned URL generated successfully.',
//     result: {
//         presignedUrl: 'https://mock-presigned-url.example.com/upload/mock-image.jpg?AWSAccessKeyId=MOCKKEY&Expires=MOCKEXP&Signature=MOCKSIG',
//         fileName: 'https://mock-public-url.example.com/mock-image.jpg', // mock public URL
//     },
// };

// const mockImagesListResponse: GetImagesResponse = {
//     isSuccess: true,
//     code: '1000',
//     message: 'Mock images fetched successfully.',
//     result: {
//         content: [
//             'https://via.placeholder.com/150/0000FF/FFFFFF?text=MockImage1',
//             'https://via.placeholder.com/150/FF0000/FFFFFF?text=MockImage2',
//             'https://via.placeholder.com/150/00FF00/FFFFFF?text=MockImage3',
//             'https://via.placeholder.com/150/FFFF00/000000?text=MockImage4',
//             'https://via.placeholder.com/150/FF00FF/FFFFFF?text=MockImage5',
//         ],
//         page: 1,
//         size: 5,
//         totalElements: 10,
//         totalPages: 2,
//     },
// };

// ✨ OCR API를 위한 목 데이터 추가
const mockOcrResponse: OcrResponse = {
    isSuccess: true,
    code: '1000',
    message: 'Mock OCR successful.',
    result: '이것은 목업 OCR 결과 텍스트입니다. 실제 이미지에서 추출된 것처럼 보입니다.',
};

// interface DirectUploadResponse {
//     isSuccess: boolean;
//     code: string;
//     message: string;
//     result: {
//         imageUrl: string; // 업로드된 이미지의 최종 Public URL
//     };
// }

// ==========================================================
//          ⬇️ API 호출 함수 ⬇️
// ==========================================================

/**
 * 이미지를 서버에 업로드하고 최종 이미지 URL을 반환하는 함수
 * 이 함수는 Presigned URL을 받아와서 직접 S3(또는 유사 스토리지)에 이미지를 PUT 업로드합니다.
 *
 * @param {File} file - 업로드할 이미지 파일 객체
 * @returns {Promise<string>} 업로드된 이미지의 최종 Public URL
 */
export async function uploadImage(file: File): Promise<string> {
    if (USE_MOCK_DATA) {
        // 목 데이터는 새 API에 맞춰 수정해야 할 수 있습니다.
        // 여기서는 임시로 mockPresignedUrlResponse.result.fileName을 사용합니다.
        return new Promise(resolve => setTimeout(() => resolve("https://mock-direct-upload.example.com/mock-image.jpg"), 500));
    }

    try {
        // 1단계: 백엔드 API에 Presigned URL 요청
        // 백엔드 개발자가 제안한 새로운 요청 바디와 경로 사용
        const presignedRequestData = {
            contentType: file.type,
            contentLength: file.size,
        };

        const response = await fetchWithAuth(`${BASE_URL}/api/v1/cards/image`, { // ✨ 경로 변경
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

        // ✨ 백엔드 응답 파싱 (새로운 인터페이스 사용)
        const data: ImageUploadApiResponse = await response.json();

        // 응답에서 presignedUrl과 publicUrl 추출
        const { presignedUrl, publicUrl } = data.result;

        if (!presignedUrl || !publicUrl) {
            throw new Error("백엔드 응답에 presignedUrl 또는 publicUrl이 누락되었습니다.");
        }

        // 2단계: 받은 presigned URL에 이미지를 직접 PUT 업로드
        const uploadResponse = await fetch(presignedUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type, // S3에 업로드할 때 파일의 MIME 타입 지정
            },
            body: file, // 이미지 파일 자체를 요청 본문에 담아 보냄
        });

        if (!uploadResponse.ok) {
            // S3 업로드 실패 시, S3는 보통 JSON 응답을 주지 않으므로 statusText를 사용
            throw new Error(`S3 직접 업로드 실패: ${uploadResponse.statusText}`);
        }

        console.log('이미지 S3 업로드 성공. Public URL:', publicUrl);
        return publicUrl; // 최종 Public URL 반환

    } catch (error: any) {
        console.error('이미지 업로드 과정에서 오류 발생:', error);
        throw new Error(`이미지 업로드 실패: ${error.message}`);
    }
}

/**
 * 이미지에서 텍스트를 추출하는 OCR API 함수
 * @param {string} imageUrl - OCR을 수행할 이미지의 URL
 * @returns {Promise<OcrResponse>} 추출된 텍스트를 포함하는 응답 객체
 */
export async function extractTextFromImage(imageUrl: string): Promise<OcrResponse> {
    if (USE_MOCK_DATA) {
        return new Promise(resolve => setTimeout(() => resolve(mockOcrResponse), 500));
    }

    // OCR API는 imageUrl을 쿼리 파라미터로 받습니다.
    const url = new URL(`${BASE_URL}/api/v0/images/ocr`);
    url.searchParams.append('imageUrl', imageUrl);

    try {
        // OCR API 호출. 인증이 필요하다면 fetchWithAuth 사용
        const response = await fetchWithAuth(url.toString(), {
            method: 'POST', // POST 요청
            headers: {
                // 쿼리 파라미터로 데이터를 넘기므로 'Content-Type': 'application/json'은 필요 없음
                // 하지만 백엔드가 특정 Content-Type을 기대할 수 있으니 확인 필요
            },
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