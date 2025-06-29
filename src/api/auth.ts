// src/api/auth.ts (새 파일 생성)

const BASE_URL = "https://very.miensoap.me";

/**
 * 임시 로그인 API를 호출하여 액세스 토큰을 가져오는 함수
 * @returns {Promise<string>} 액세스 토큰 문자열
 */
export async function mockLogin(): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/oauth2/mock/1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // API 응답이 실패한 경우
      const errorData = await response.json();
      throw new Error(`Login failed: ${errorData.message}`);
    }

    const data = await response.json();
    // API 명세에 따라 실제 토큰이 어디에 있는지 확인해야 합니다.
    // 여기서는 응답 데이터의 result.accessToken에 있다고 가정합니다.
    // 스웨거 명세서를 참고하여 정확한 필드명을 확인하세요.
    const accessToken = data.result.accessToken; 
    
    if (!accessToken) {
        throw new Error('Access token not found in the response.');
    }
    
    // 로컬 스토리지 등에 토큰을 보관할 수 있습니다.
    // localStorage.setItem('accessToken', accessToken);
    
    return accessToken;

  } catch (error) {
    console.error('Login Error:', error);
    throw error; // 에러를 호출한 곳으로 다시 throw
  }
}

// 예시: 토큰을 로컬 스토리지에 저장하고 사용하는 로직
export const getAccessToken = (): string | null => {
  // 실제 앱에서는 redux, context API 등 상태 관리 도구를 사용하는 것이 좋습니다.
  return localStorage.getItem('accessToken');
};

export const setAccessToken = (token: string) => {
  localStorage.setItem('accessToken', token);
};

export const removeAccessToken = () => {
  localStorage.removeItem('accessToken');
};