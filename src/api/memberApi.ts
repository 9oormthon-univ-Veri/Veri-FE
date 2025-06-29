// src/api/memberApi.ts

// API 응답의 기본 구조
export interface DefaultApiResponse<T> {
    isSuccess: boolean;
    code: string;
    message: string;
    result: T;
}

// 회원 프로필 정보 타입
export interface MemberProfile {
    memberId: number;
    name: string;
    booksRead: number;
    readingCards: number;
    profileImageUrl?: string;
}

// 회원 프로필 조회 API 응답 타입
export type GetMemberProfileResponse = DefaultApiResponse<MemberProfile>;

// 💡 목 데이터를 임포트해야 합니다.
//    이 파일이 api-services.ts 역할을 겸하므로, mockData.ts에서 데이터를 가져와야 합니다.
import { mockMemberProfileResponse } from './mockData';

/**
 * 회원 프로필 정보를 가져오는 API 호출 (Mock 함수)
 * 이 함수는 api-services.ts에 있던 로직을 여기에 옮긴 것입니다.
 */
export async function getMemberProfile(): Promise<GetMemberProfileResponse> {
    // 실제 API 호출 로직은 여기에 구현합니다.
    // 예: const response = await axios.get('/api/v1/members/me');

    // 현재는 목 데이터를 1초 지연 후 반환합니다.
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockMemberProfileResponse);
        }, 1000); // 1초 지연
    });
}