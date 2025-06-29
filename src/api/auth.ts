// src/api/auth.ts (개선된 코드)

const BASE_URL = "https://very.miensoap.me";

// Swagger 명세서에 기반한 응답 타입 인터페이스 (추정)
interface MockLoginResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    jwtToken: string; // Swagger 스키마를 확인하여 정확한 필드명(e.g., accessToken, token)으로 변경
  } | null; // result 필드가 없을 수도 있음을 명시
}

/**
 * 임시 로그인 API를 호출하여 JWT 토큰을 가져오는 함수
 * @returns {Promise<string>} JWT 토큰 문자열
 */
export async function mockLogin(): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/oauth2/mock/1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 1. 응답 상태 코드 확인
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Login failed (HTTP ${response.status}): ${errorData.message}`);
    }
    
    // 2. JSON 파싱
    const data: MockLoginResponse = await response.json();
    
    // 3. 응답 데이터의 성공 및 토큰 존재 여부 확인
    if (!data.isSuccess || !data.result || !data.result.jwtToken) {
      throw new Error('Access token not found in the response result.');
    }

    const accessToken = data.result.jwtToken;
    
    // 로컬 스토리지 등에 토큰을 보관하는 로직은 사용하는 곳에서 호출하는 것이 더 좋습니다.
    // setAccessToken(accessToken); // 여기서 바로 저장할 수도 있지만, 외부에서 제어하는 것이 유연함
    
    return accessToken;

  } catch (error) {
    if (error instanceof Error) {
      console.error('Login Error:', error.message);
      // 네트워크 에러, CORS 에러 등 fetch 자체 에러를 포함
    } else {
      console.error('An unknown login error occurred:', error);
    }
    throw error; // 에러를 호출한 곳으로 다시 전파
  }
}

/**
 * 로컬 스토리지에서 액세스 토큰을 가져오는 함수
 * 브라우저 환경에서만 동작하도록 처리
 */
export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

/**
 * 로컬 스토리지에 액세스 토큰을 저장하는 함수
 */
export const setAccessToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token);
  }
};

/**
 * 로컬 스토리지에서 액세스 토큰을 제거하는 함수
 */
export const removeAccessToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
  }
};