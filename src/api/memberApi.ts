import { fetchWithAuth } from './cardApi';
import { USE_MOCK_DATA, mockDelay, createMockResponse, mockUser } from './mock';

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

export interface DefaultApiResponse<T> {
    isSuccess: boolean;
    code: string;
    message: string;
    result: T;
}

export interface MemberProfile {
    email: string;
    nickname: string;
    image: string;
    numOfReadBook: number;
    numOfCard: number;
}

export interface GetMemberProfileResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    result: MemberProfile | null;
}

export async function getMemberProfile(): Promise<GetMemberProfileResponse> {
    if (USE_MOCK_DATA) {
        await mockDelay();
        return createMockResponse(mockUser, '목 사용자 프로필 조회 성공');
    }

    const url = `${BASE_URL}/api/v1/members/me`;

    try {
        const response = await fetchWithAuth(url, {
            method: 'GET',
        });

        const data: GetMemberProfileResponse = await response.json();

        if (!data.isSuccess) {
            throw new Error(`프로필 로드 실패: ${data.message || '알 수 없는 오류'}`);
        }

        return data;
    } catch (error) {
        console.error('프로필 데이터를 불러오는 중 오류 발생:', error);
        throw error;
    }
}