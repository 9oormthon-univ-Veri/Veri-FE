// src/api/memberApi.ts

import { fetchWithAuth } from './bookApi'; // fetchWithAuth 임포트
import { USE_MOCK_DATA } from './bookApi'; // USE_MOCK_DATA 임포트 (만약 bookApi에 있다면)
// 또는 USE_MOCK_DATA가 별도의 config 파일에 있다면 그곳에서 임포트합니다.

const BASE_URL = "https://api.very.miensoap.me";

// API 응답의 기본 구조는 그대로 유지
export interface DefaultApiResponse<T> {
    isSuccess: boolean;
    code: string;
    message: string;
    result: T;
}

// ✨ 회원 프로필 정보 타입을 API 스펙에 맞춰 수정합니다.
export interface MemberProfile {
    email: string;
    nickname: string;        // 'name' -> 'nickname'
    image: string;           // 'profileImageUrl' -> 'image'
    numOfReadBook: number;   // 'booksRead' -> 'numOfReadBook'
    numOfCard: number;       
}

// 회원 프로필 조회 API 응답 타입은 그대로 유지
export interface GetMemberProfileResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    result: MemberProfile | null;
}

// 💡 목 데이터를 임포트해야 합니다.
import { mockMemberProfileResponse } from './mockData';

/**
 * 회원 프로필 정보를 가져오는 API 호출 (Mock 또는 실제)
 */
export async function getMemberProfile(): Promise<GetMemberProfileResponse> {
    // ✨ USE_MOCK_DATA 플래그를 사용하여 분기합니다.
    if (USE_MOCK_DATA) {
        // 목 데이터의 필드도 MemberProfile 인터페이스에 맞춰 수정해야 합니다.
        // 예: mockMemberProfileResponse.result = { email: 'mock@example.com', nickname: 'MockUser', ... }
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockMemberProfileResponse);
            }, 500); // 일관성을 위해 지연 시간 0.5초로 변경
        });
    }

    // ✨ 실제 API 호출 로직
    const url = `${BASE_URL}/api/v1/members/me`;

    try {
        const response = await fetchWithAuth(url, { // fetchWithAuth 사용
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