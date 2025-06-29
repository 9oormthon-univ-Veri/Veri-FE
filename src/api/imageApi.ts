// src/api/imageApi.ts (새 파일 생성)

const BASE_URL = "https://very.miensoap.me";

interface PresignedUrlResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    result: {
        presignedUrl: string;
        fileName: string;
    };
}

/**
 * 백엔드로부터 이미지를 업로드할 수 있는 Presigned URL을 받아오는 함수
 * @param {string} mimeType 이미지 MIME 타입 (예: 'image/jpeg')
 * @param {number} contentLength 이미지 바이트 단위 길이
 * @returns {Promise<string>} 업로드된 이미지의 URL
 */
export async function uploadImage(file: File): Promise<string> {
    try {
        // 1. Presigned URL을 요청하는 API 호출
        const response = await fetch(`${BASE_URL}/api/v0/images/presigned-url`, {
            method: 'POST', // 명세서에 POST 방식 설명이 있으므로 POST 사용
            headers: {
                'Content-Type': 'application/json',
                // 인증이 필요한 경우 여기에 토큰을 추가해야 합니다.
                // 'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({
                imageName: file.name,
                mimeType: file.type,
                contentLength: file.size,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to get presigned URL: ${errorData.message}`);
        }

        const data: PresignedUrlResponse = await response.json();
        const { presignedUrl } = data.result;

        // 2. Presigned URL에 실제 이미지를 PUT 방식으로 업로드
        const uploadResponse = await fetch(presignedUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type,
                // Presigned URL에 업로드할 때는 보통 인증 헤더가 필요 없습니다.
                // 서버가 이미 URL을 생성할 때 인증을 처리했기 때문입니다.
            },
            body: file, // 이미지 파일 자체를 body에 담아 전송
        });

        if (!uploadResponse.ok) {
            throw new Error('Failed to upload image to the presigned URL.');
        }
        
        // 3. 업로드 성공 후, API에서 요구하는 이미지 URL을 반환
        // 명세서에 따르면 `fileName`이 S3 등 스토리지의 URL이 될 가능성이 높습니다.
        // 또는 명세서에 업로드 후 반환되는 최종 URL이 명시되어 있을 수 있습니다.
        // 여기서는 예시로 fileName을 반환합니다.
        // 정확한 URL 구조는 백엔드에 문의하거나 명세서를 확인해야 합니다.
        // 예: `https://very-miensoap-image-bucket.s3.ap-northeast-2.amazonaws.com/${fileName}`
        
        // 일단은 presignedUrl을 그대로 반환하거나, 명세에 맞는 최종 URL을 구성
        return presignedUrl?.split('?')[0] ?? '';
        
    } catch (error) {
        console.error('Image upload failed:', error);
        throw error;
    }
}